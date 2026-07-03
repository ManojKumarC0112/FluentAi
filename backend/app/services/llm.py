from typing import List, Dict, Any, Optional
from groq import Groq
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"
        
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 150
    ) -> str:
        """
        Generate a conversational response using Llama 3.3.
        `messages` should be in the format: [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    def analyze_grammar(self, transcript: str) -> Optional[str]:
        """
        Analyze grammar and provide corrections in a structured JSON format if errors exist.
        Returns a JSON string array of correction objects, or None if no errors.
        """
        system_prompt = (
            "You are an expert English grammar coach. Analyze the user's speech transcript for grammar, vocabulary, or pronunciation errors (indicated by phonetic misspellings). "
            "If there are NO errors and the speech is completely natural and correct, reply with exactly the word 'PERFECT'. "
            "If there ARE errors, return a strict JSON array of objects, where each object has: "
            "`error` (the incorrect phrase), `correction` (the corrected phrase), and `explanation` (a brief, encouraging explanation of why it was wrong and how to improve). "
            "Do not output markdown formatting like ```json, just the raw JSON array or 'PERFECT'."
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": transcript}
                ],
                temperature=0.1,
                max_tokens=500,
            )
            content = response.choices[0].message.content.strip()
            
            if "PERFECT" in content.upper() and len(content) < 15:
                return None
                
            return content
        except Exception as e:
            print(f"Grammar analysis error: {e}")
            return None

llm_service = LLMService()
