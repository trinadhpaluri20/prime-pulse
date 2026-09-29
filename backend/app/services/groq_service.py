import json
import logging
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.utils.errors import AppException, ValidationErrorException

logger = logging.getLogger("app.services.groq_service")


class GroqService:
    """Service adapter for Groq LLM completion API (`https://api.groq.com/openai/v1/chat/completions`)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.base_url = (base_url or settings.GROQ_BASE_URL or "https://api.groq.com/openai/v1").rstrip("/")
        self.model = model or settings.GROQ_MODEL or "openai/gpt-oss-120b"
        self.timeout = timeout or settings.GROQ_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        """Check whether valid GROQ_API_KEY is configured."""
        if not self.api_key or not self.api_key.strip():
            return False
        return self.api_key.strip() != "YOUR_GROQ_API_KEY"

    def generate_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Send completion request to Groq API and return parsed structured response dict."""
        if not self.is_configured:
            logger.warning("[GROQ_SERVICE] GROQ_API_KEY is not configured.")
            raise ValidationErrorException("GROQ_API_KEY is not configured in environment.")

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        logger.info(f"[GROQ_SERVICE] Sending completion request to Groq model '{self.model}'")

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

            choices = data.get("choices", [])
            if not choices:
                raise AppException("Groq returned empty completion response.", status_code=502)

            content_text = choices[0].get("message", {}).get("content", "")
            logger.info("[GROQ_SERVICE] Completion response received successfully.")

            return self._parse_json_content(content_text)

        except httpx.TimeoutException:
            logger.error("[GROQ_SERVICE] Groq API request timed out.")
            raise AppException("Groq API request timed out.", status_code=504)

        except httpx.HTTPStatusError as err:
            status_code = err.response.status_code if err.response else 502
            logger.error(f"[GROQ_SERVICE] Groq HTTP error: status {status_code}")
            raise AppException(f"Groq API returned HTTP status {status_code}.", status_code=status_code)

        except Exception as err:
            logger.error(f"[GROQ_SERVICE] Groq execution error: {str(err)}", exc_info=True)
            raise AppException(f"Groq LLM service execution failed: {str(err)}", status_code=502)

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
            logger.warning("[GROQ_SERVICE] Failed to parse raw Groq response as JSON, wrapping text.")

        return {
            "summary": content_text[:300],
            "facts": [],
            "observations": [],
            "insights": [content_text],
            "limitations": [],
        }
