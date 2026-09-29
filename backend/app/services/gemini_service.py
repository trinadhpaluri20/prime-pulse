import json
import logging
from typing import Any, Dict, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.utils.errors import AppException, ValidationErrorException

logger = logging.getLogger("app.services.gemini_service")


class GeminiService:
    """Service adapter for Google GenAI Gemini SDK (`google-genai`)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.timeout = timeout or settings.GEMINI_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        """Check whether valid GEMINI_API_KEY is configured."""
        if not self.api_key or not self.api_key.strip():
            return False
        return self.api_key.strip() != "YOUR_GOOGLE_AI_STUDIO_API_KEY"

    def generate_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Send completion request to Google Gemini API via official google-genai SDK
        and return parsed structured response dict.
        """
        if not self.is_configured:
            logger.warning("[GEMINI_SERVICE] GEMINI_API_KEY is not configured.")
            raise ValidationErrorException("GEMINI_API_KEY is not configured in environment.")

        logger.info(f"[GEMINI_SERVICE] Sending completion request to Gemini model '{self.model}'")

        try:
            client = genai.Client(api_key=self.api_key)
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                response_mime_type="application/json",
            )

            response = client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=config,
            )

            if not response or not response.text:
                raise AppException("Gemini returned empty completion response.", status_code=502)

            content_text = response.text
            logger.info("[GEMINI_SERVICE] Completion response received successfully.")

            return self._parse_json_content(content_text)

        except ValidationErrorException:
            raise

        except Exception as err:
            logger.error(f"[GEMINI_SERVICE] Gemini execution error: {str(err)}", exc_info=True)
            raise AppException(f"Gemini LLM service execution failed: {str(err)}", status_code=502)

    def _parse_json_content(self, content_text: str) -> Dict[str, Any]:
        """Safely parse JSON response content into structured dictionary."""
        cleaned = content_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        try:
            parsed = json.loads(cleaned.strip())
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            logger.warning("[GEMINI_SERVICE] Failed to parse raw Gemini response as JSON, wrapping text.")

        return {
            "summary": content_text[:300],
            "facts": [],
            "observations": [],
            "insights": [content_text],
            "limitations": [],
        }
