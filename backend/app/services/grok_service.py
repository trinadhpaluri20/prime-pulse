import json
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.utils.errors import AppException, ValidationErrorException

logger = logging.getLogger("app.services.grok_service")


class GrokService:
    """Service adapter for xAI Grok LLM completion API (`https://api.x.ai/v1/chat/completions`)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.api_key = api_key or settings.XAI_API_KEY
        self.base_url = (base_url or settings.XAI_BASE_URL or "https://api.x.ai/v1").rstrip("/")
        self.model = model or settings.XAI_MODEL or "grok-2-latest"
        self.timeout = timeout or settings.XAI_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        """Check whether valid XAI API Key is configured."""
        return bool(self.api_key and self.api_key.strip())

    def generate_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Send completion request to Grok xAI API and return parsed structured response dict."""
        if not self.is_configured:
            logger.warning("[GROK_SERVICE] XAI_API_KEY is not configured.")
            raise ValidationErrorException("XAI_API_KEY is not configured in environment.")

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

        logger.info(f"[GROK_SERVICE] Sending completion request to Grok model '{self.model}'")

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

            choices = data.get("choices", [])
            if not choices:
                raise AppException("Grok returned empty completion response.", status_code=502)

            content_text = choices[0].get("message", {}).get("content", "")
            logger.info("[GROK_SERVICE] Completion response received successfully.")

            return self._parse_json_content(content_text)

        except httpx.TimeoutException:
            logger.error("[GROK_SERVICE] Grok API request timed out.")
            raise AppException("Grok API request timed out.", status_code=504)

        except httpx.HTTPStatusError as err:
            status_code = err.response.status_code if err.response else 502
            logger.error(f"[GROK_SERVICE] Grok HTTP error: status {status_code}")
            raise AppException(f"Grok API returned HTTP status {status_code}.", status_code=status_code)

        except Exception as err:
            logger.error(f"[GROK_SERVICE] Grok execution error: {str(err)}", exc_info=True)
            raise AppException(f"Grok LLM service execution failed: {str(err)}", status_code=502)

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
            logger.warning("[GROK_SERVICE] Failed to parse raw Grok response as JSON, wrapping text.")

        return {
            "summary": content_text[:300],
            "facts": [],
            "observations": [],
            "insights": [content_text],
            "limitations": [],
        }
