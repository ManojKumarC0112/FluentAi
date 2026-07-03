import os
from typing import BinaryIO
from groq import Groq
from app.core.config import settings

class STTService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "whisper-large-v3"
        
    def transcribe(self, file_path_or_buffer: str | BinaryIO, filename: str = "audio.wav") -> str:
        """Transcribe audio using Groq Whisper. Returns the transcript."""
        if isinstance(file_path_or_buffer, str):
            with open(file_path_or_buffer, "rb") as f:
                transcription = self.client.audio.transcriptions.create(
                    file=(filename, f.read()),
                    model=self.model,
                    language="en",
                    response_format="text"
                )
        else:
            transcription = self.client.audio.transcriptions.create(
                file=(filename, file_path_or_buffer.read()),
                model=self.model,
                language="en",
                response_format="text"
            )
            
        # The response_format="text" returns the text directly as a string if using groq SDK correctly, 
        # or an object depending on the SDK version. We'll handle both.
        if isinstance(transcription, str):
            return transcription
        return transcription.text if hasattr(transcription, "text") else getattr(transcription, "text", str(transcription))

stt_service = STTService()
