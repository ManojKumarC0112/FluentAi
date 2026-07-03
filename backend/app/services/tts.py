import os
import edge_tts
import uuid
from typing import Optional

class TTSService:
    def __init__(self):
        # Default voice, can be configured. 
        # popular voices: en-US-AriaNeural, en-US-GuyNeural, en-GB-SoniaNeural
        self.voice = "en-US-AriaNeural"
        
    async def generate_speech(self, text: str, output_path: Optional[str] = None) -> str:
        """
        Generate speech from text using Microsoft Edge TTS.
        Returns the absolute path to the generated audio file.
        """
        if not output_path:
            # Generate a temporary file if none provided
            os.makedirs("/tmp/fluentai_tts", exist_ok=True)
            output_path = f"/tmp/fluentai_tts/{uuid.uuid4()}.mp3"
            
        communicate = edge_tts.Communicate(text, self.voice)
        await communicate.save(output_path)
        
        return output_path

tts_service = TTSService()
