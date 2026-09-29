from app.services.groq_service import GroqService
from app.core.config import settings

class GeminiService(GroqService):
    """Backwards compatibility alias for GroqService."""
    
    @property
    def is_configured(self) -> bool:
        key = self.api_key or getattr(settings, "GEMINI_API_KEY", None) or settings.GROQ_API_KEY
        if not key or not str(key).strip():
            return False
        return str(key).strip() not in ("YOUR_GROQ_API_KEY", "YOUR_GEMINI_API_KEY")

