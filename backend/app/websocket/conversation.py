import json
import base64
import os
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Any

from app.services.llm import llm_service
from app.services.stt import stt_service
from app.services.tts import tts_service
from app.models.domain import Conversation, Message
from app.db.database import SessionLocal

class ConversationManager:
    def __init__(self):
        # We store the conversation history to maintain context
        self.histories: Dict[str, list] = {}
        
    async def handle_websocket(self, websocket: WebSocket, conversation_id: str):
        # We handle setup here instead of global dependencies
        await websocket.accept()
        
        # Simplified token check - grabbing user_id from path/params
        # If no strict auth token, fallback to anon
        user_id = websocket.query_params.get("userId", "anonymous_user")
        mode = websocket.query_params.get("mode", "casual")
        
        db = SessionLocal()
        
        # Save Conversation DB Shell
        conv_record = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv_record:
            conv_record = Conversation(id=conversation_id, user_id=user_id, mode=mode)
            db.add(conv_record)
            db.commit()
            
        if conversation_id not in self.histories:
            system_prompt = f"""You are FluentAI, an expert, strict, but encouraging English Speaking Coach. 
Current Practice Mode: {mode.upper()}

CRITICAL INSTRUCTIONS FOR EVERY RESPONSE:
1. Actively point out if they stutter (e.g. "umm", "uh"), mispronounce, or lack confidence based on the transcript shape.
2. Ask probing questions based on the {mode} mode to force them to speak more. Do NOT do all the talking.
3. Start by evaluating their response briefly (e.g. "Good effort, but I noticed some hesitation...").
4. Keep your responses short (max 2-3 sentences) so the user does the maximum amount of speaking.
5. If they just say something short, ask them to expand and tell you more.
"""
            self.histories[conversation_id] = [
                {"role": "system", "content": system_prompt}
            ]
            
        try:
            while True:
                # 1. Receive JSON from client (which contains the base64 encoded audio from MediaRecorder)
                data = await websocket.receive_text()
                payload = json.loads(data)
                if payload.get("type") == "set_mode":
                    new_mode = payload.get("mode", "casual")
                    system_prompt = f"""You are FluentAI, an expert, strict, but encouraging English Speaking Coach. 
Current Practice Mode: {new_mode.upper()}

CRITICAL INSTRUCTIONS FOR EVERY RESPONSE:
1. Actively point out if they stutter (e.g. "umm", "uh"), mispronounce, or lack confidence based on the transcript shape.
2. Ask probing questions based on the {new_mode} mode to force them to speak more. Do NOT do all the talking.
3. Start by evaluating their response briefly (e.g. "Good effort, but I noticed some hesitation...").
4. Keep your responses short (max 2-3 sentences) so the user does the maximum amount of speaking.
5. If they just say something short, ask them to expand and tell you more.
"""
                    try:
                        self.histories[conversation_id][0]["content"] = system_prompt
                    except Exception:
                        pass
                    continue
                
                if "audio" not in payload:
                    continue
                    
                # Decode audio WebM/WAV from client
                audio_b64 = payload["audio"]
                audio_bytes = base64.b64decode(audio_b64)
                
                # Save temp audio file for Whisper
                temp_audio = f"/tmp/fluentai_{conversation_id}_in.webm"
                with open(temp_audio, "wb") as f:
                    f.write(audio_bytes)
                    
                # 2. STT (Transcribe user speech)
                # We send processing status
                await websocket.send_json({"type": "status", "status": "transcribing"})
                
                # Call Groq Whisper
                # Note: stt_service.transcribe is synchronous in our mock SDK. We can run in thread if needed, but for MVP it's fast.
                transcript = stt_service.transcribe(temp_audio)
                
                # Cleanup temp
                if os.path.exists(temp_audio):
                    os.remove(temp_audio)
                    
                if not transcript.strip():
                    await websocket.send_json({"type": "error", "message": "No speech detected"})
                    continue
                    
                # Send transcript down immediately
                await websocket.send_json({"type": "transcript", "text": transcript})
                
                # 3. Parallel Grammar Analysis & AI Response Generation
                # Add to history
                self.histories[conversation_id].append({"role": "user", "content": transcript})
                
                await websocket.send_json({"type": "status", "status": "generating_reply"})
                
                # We can run these concurrently to save time
                loop = asyncio.get_event_loop()
                grammar_task = loop.run_in_executor(None, llm_service.analyze_grammar, transcript)
                reply_task = loop.run_in_executor(None, llm_service.generate_response, self.histories[conversation_id])
                
                # Calculate Duration using pydub if possible
                duration_seconds = 2.0 # fallback
                try:
                    from pydub import AudioSegment
                    audio_segment = AudioSegment.from_file(temp_audio)
                    duration_seconds = len(audio_segment) / 1000.0 # milliseconds to seconds
                except Exception as e:
                    print(f"Pydub warning: {e}. Falling back to estimated duration.")
                    # Roughly 2.5 words per second estimation
                    duration_seconds = max(1.0, len(transcript.split()) / 2.5)

                grammar_result, ai_reply = await asyncio.gather(grammar_task, reply_task)
                
                self.histories[conversation_id].append({"role": "assistant", "content": ai_reply})
                
                # Setup defaults
                corrections = []
                # Send grammar feedback if any
                if grammar_result:
                    try:
                        corrections = json.loads(grammar_result)
                    except Exception as e:
                        print("Failed to parse grammar JSON:", e)
                
                from app.services.scoring import scoring_service
                score_dict = scoring_service.calculate_score(transcript, float(duration_seconds), len(corrections))

                # Save Messages to DB!
                import uuid
                try:
                    user_msg = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="user", content=transcript)
                    ai_msg = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="assistant", content=ai_reply, grammar_corrections=corrections)
                    db.add(user_msg)
                    db.add(ai_msg)
                    db.commit()
                except Exception as db_e:
                    print("DB error saving messages:", db_e)

                # ALWAYS send grammar message to update the scores, even if no corrections
                await websocket.send_json({"type": "grammar", "corrections": corrections, "score": score_dict})

                
                # 4. Synthesize AI reply (TTS)
                await websocket.send_json({"type": "status", "status": "speaking"})
                tts_output = await tts_service.generate_speech(ai_reply)
                
                # Base64 encode the output mp3
                with open(tts_output, "rb") as f:
                    bot_audio_b64 = base64.b64encode(f.read()).decode("utf-8")
                
                # Cleanup TTS file
                if os.path.exists(tts_output):
                    os.remove(tts_output)
                    
                # 5. Send finale reply to client
                await websocket.send_json({
                    "type": "ai_reply",
                    "text": ai_reply,
                    "audio": bot_audio_b64
                })
                
                await websocket.send_json({"type": "status", "status": "listening"})
                
        except WebSocketDisconnect:
            if conversation_id in self.histories:
                del self.histories[conversation_id]
            print(f"Client disconnected dict: {conversation_id}")
            
manager = ConversationManager()
