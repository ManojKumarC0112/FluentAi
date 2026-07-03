import json
import base64
import os
import asyncio
import uuid
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Any

from app.services.llm import llm_service
from app.services.stt import stt_service
from app.services.tts import tts_service
from app.models.domain import Conversation, Message, User
from app.db.database import SessionLocal

class ConversationManager:
    def __init__(self):
        # We store the conversation history to maintain context
        self.histories: Dict[str, list] = {}
        # Track statistics per session to compute averages on disconnect
        self.session_data: Dict[str, dict] = {}
        
    async def handle_websocket(self, websocket: WebSocket, conversation_id: str):
        # We handle setup here instead of global dependencies
        await websocket.accept()
        
        # Simplified token check - grabbing user_id from path/params
        user_id = websocket.query_params.get("userId", "anonymous_user")
        mode = websocket.query_params.get("mode", "casual")
        
        # Open short-lived DB session for initialization
        with SessionLocal() as db:
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
            self.session_data[conversation_id] = {
                "fluency_total": 0, "grammar_total": 0, "vocab_total": 0,
                "duration": 0, "turns": 0
            }
            
        try:
            while True:
                # 1. Receive JSON from client
                data = await websocket.receive_text()
                payload = json.loads(data)
                
                # Dynamic mode switching
                if payload.get("type") == "set_mode":
                    new_mode = payload.get("mode", "casual")
                    system_prompt = f"""You are FluentAI, an expert, strict, but encouraging English Speaking Coach. 
Current Practice Mode: {new_mode.upper()}

CRITICAL INSTRUCTIONS FOR EVERY RESPONSE:
1. Actively point out if they stutter (e.g. "umm", "uh"), mispronounce, or lack confidence based on the transcript shape.
2. Ask probing questions based on the {new_mode} mode to force them to speak more. Do NOT do all the talking.
3. Start by evaluating their response briefly.
4. Keep your responses short so the user does the maximum amount of speaking.
"""
                    try:
                        self.histories[conversation_id][0]["content"] = system_prompt
                        with SessionLocal() as db:
                            conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
                            if conv:
                                conv.mode = new_mode
                                db.commit()
                    except Exception:
                        pass
                    continue
                
                # Graceful termination
                if payload.get("type") == "end_session":
                    break
                
                if "audio" not in payload:
                    continue
                    
                # Decode audio WebM/WAV from client
                audio_b64 = payload["audio"]
                audio_bytes = base64.b64decode(audio_b64)
                
                # Use unique temporal file to avoid race conditions
                unique_id = str(uuid.uuid4())
                temp_audio = f"/tmp/fluentai_{conversation_id}_{unique_id}.webm"
                os.makedirs("/tmp", exist_ok=True)
                with open(temp_audio, "wb") as f:
                    f.write(audio_bytes)
                    
                # 2. STT (Transcribe user speech)
                await websocket.send_json({"type": "status", "status": "transcribing"})
                
                # Note: stt_service.transcribe is sync. Can run in thread, but for MVP it's fast.
                transcript = stt_service.transcribe(temp_audio)
                
                if not transcript.strip():
                    if os.path.exists(temp_audio):
                        os.remove(temp_audio)
                    await websocket.send_json({"type": "error", "message": "No speech detected"})
                    continue
                    
                # Send transcript down immediately
                await websocket.send_json({"type": "transcript", "text": transcript})
                
                # 3. Parallel Grammar Analysis & AI Response Generation
                self.histories[conversation_id].append({"role": "user", "content": transcript})
                
                await websocket.send_json({"type": "status", "status": "generating_reply"})
                
                loop = asyncio.get_event_loop()
                grammar_task = loop.run_in_executor(None, llm_service.analyze_grammar, transcript)
                reply_task = loop.run_in_executor(None, llm_service.generate_response, self.histories[conversation_id])
                
                duration_seconds = 2.0
                try:
                    from pydub import AudioSegment
                    audio_segment = AudioSegment.from_file(temp_audio)
                    duration_seconds = len(audio_segment) / 1000.0
                except Exception as e:
                    print(f"Pydub warning: {e}. Falling back to estimated duration.")
                    duration_seconds = max(1.0, len(transcript.split()) / 2.5)

                if os.path.exists(temp_audio):
                    os.remove(temp_audio)

                grammar_result, ai_reply = await asyncio.gather(grammar_task, reply_task)
                
                self.histories[conversation_id].append({"role": "assistant", "content": ai_reply})
                
                corrections = []
                if grammar_result:
                    try:
                        corrections = json.loads(grammar_result)
                    except Exception as e:
                        print("Failed to parse grammar JSON:", e)
                
                from app.services.scoring import scoring_service
                score_dict = scoring_service.calculate_score(transcript, float(duration_seconds), len(corrections))

                # Track session metrics safely
                if conversation_id in self.session_data:
                    self.session_data[conversation_id]["turns"] += 1
                    self.session_data[conversation_id]["duration"] += duration_seconds
                    self.session_data[conversation_id]["fluency_total"] += score_dict.get("fluency", 0)
                    self.session_data[conversation_id]["grammar_total"] += score_dict.get("grammar", 0)
                    self.session_data[conversation_id]["vocab_total"] += score_dict.get("vocabulary", 0)

                # Short-lived DB transaction for writing messages
                try:
                    with SessionLocal() as db:
                        user_msg = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="user", content=transcript)
                        ai_msg = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="assistant", content=ai_reply, grammar_corrections=corrections)
                        db.add(user_msg)
                        db.add(ai_msg)
                        db.commit()
                except Exception as db_e:
                    print("DB error saving messages:", db_e)

                await websocket.send_json({"type": "grammar", "corrections": corrections, "score": score_dict})
                
                # 4. Synthesize AI reply (TTS)
                await websocket.send_json({"type": "status", "status": "speaking"})
                tts_output = await tts_service.generate_speech(ai_reply)
                
                with open(tts_output, "rb") as f:
                    bot_audio_b64 = base64.b64encode(f.read()).decode("utf-8")
                
                if os.path.exists(tts_output):
                    os.remove(tts_output)
                    
                # 5. Send finale reply
                await websocket.send_json({
                    "type": "ai_reply",
                    "text": ai_reply,
                    "audio": bot_audio_b64
                })
                
                await websocket.send_json({"type": "status", "status": "listening"})
                
        except WebSocketDisconnect:
            print(f"Client disconnected dict: {conversation_id}")
            pass
        finally:
            self._finalize_session(conversation_id, user_id)
            
    def _finalize_session(self, conversation_id: str, user_id: str):
        # Calculate final stats and award XP on session end
        if conversation_id in self.session_data:
            stats = self.session_data[conversation_id]
            turns = max(1, stats["turns"])
            
            avg_fluency = stats["fluency_total"] / turns
            avg_grammar = stats["grammar_total"] / turns
            avg_vocab = stats["vocab_total"] / turns
            
            with SessionLocal() as db:
                # Update Conversation
                conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
                if conv:
                    conv.score_fluency = avg_fluency
                    conv.score_grammar = avg_grammar
                    conv.score_vocabulary = avg_vocab
                    conv.duration_seconds = int(stats["duration"])
                    
                    # Award User XP (10 XP per minute)
                    if conv.duration_seconds > 0:
                        user = db.query(User).filter(User.id == user_id).first()
                        if user:
                            minutes = conv.duration_seconds / 60.0
                            user.xp = (user.xp or 0) + int(minutes * 10)
                            
                db.commit()
            
            # Clean up memory
            del self.session_data[conversation_id]
            
        if conversation_id in self.histories:
            del self.histories[conversation_id]

manager = ConversationManager()
