import re
from typing import Dict, Any

class ScoringService:
    def __init__(self):
        # Common English filler words
        self.fillers = {"um", "uh", "like", "you know", "basically", "literally", "actually", "right"}
        
    def calculate_score(self, transcript: str, duration_seconds: float, num_grammar_errors: int) -> Dict[str, float]:
        """
        Calculate fluency score algorithmically.
        """
        if not transcript.strip() or duration_seconds <= 0:
            return {"fluency": 0.0, "grammar": 0.0, "vocabulary": 0.0, "confidence": 0.0}
            
        words = re.findall(r'\b\w+\b', transcript.lower())
        word_count = len(words)
        
        if word_count == 0:
            return {"fluency": 0.0, "grammar": 0.0, "vocabulary": 0.0, "confidence": 0.0}
            
        # 1. Speaking Speed (WPM)
        wpm = (word_count / duration_seconds) * 60
        # Ideal WPM for non-natives is ~120-150. Too fast or too slow reduces score.
        if 110 <= wpm <= 160:
            wpm_score = 10.0
        elif wpm < 110:
            wpm_score = max(0.0, 10.0 - ((110 - wpm) * 0.1)) # Penalize 1 point per 10 WPM too slow
        else:
            wpm_score = max(0.0, 10.0 - ((wpm - 160) * 0.1))
            
        # 2. Filler Words
        filler_count = sum(1 for w in words if w in self.fillers)
        filler_ratio = filler_count / word_count
        # Target: < 2% fillers. If > 10% fillers, score is ~0.
        filler_score = max(0.0, 10.0 - (filler_ratio * 100))
        
        # 3. Vocabulary Diversity (unique words / total words)
        # Note: Short sentences naturally have high diversity. So we scale it slightly.
        unique_words = len(set(words))
        diversity_ratio = unique_words / word_count
        # Good diversity is > 60% for short chunks.
        vocab_score = min(10.0, (diversity_ratio / 0.7) * 10)
        
        # 4. Grammar Score
        # Start at 10, subtract 2 for each error.
        grammar_score = max(0.0, 10.0 - (num_grammar_errors * 2.0))
        
        # Compute final weighted fluency
        # 40% WPM + 30% Fillers + 30% Grammar
        fluency_score = (wpm_score * 0.4) + (filler_score * 0.3) + (grammar_score * 0.3)
        
        # Confidence correlates heavily with taking fewer pauses (higher WPM, less fillers)
        confidence_score = (wpm_score * 0.5) + (filler_score * 0.5)
        
        return {
            "fluency": round(fluency_score, 1),
            "grammar": round(grammar_score, 1),
            "vocabulary": round(vocab_score, 1),
            "confidence": round(confidence_score, 1)
        }

scoring_service = ScoringService()
