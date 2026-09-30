import concurrent.futures
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from hindsight_client import Hindsight
from app.core.config import settings
from app.utils.errors import AppException, ValidationErrorException

logger = logging.getLogger(__name__)


class HindsightMemoryService:
    """Service adapter isolating Hindsight persistent memory operations."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        bank_id: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.base_url = base_url if base_url is not None else settings.HINDSIGHT_BASE_URL
        self.api_key = api_key if api_key is not None else settings.HINDSIGHT_API_KEY
        self.bank_id = bank_id if bank_id is not None else settings.HINDSIGHT_BANK_ID
        self.timeout = timeout if timeout is not None else settings.HINDSIGHT_TIMEOUT_SECONDS

        self._client: Optional[Hindsight] = None

    @property
    def is_configured(self) -> bool:
        """Check whether valid Hindsight credentials are configured."""
        return bool(self.api_key and self.api_key.strip())

    def get_client(self) -> Hindsight:
        """Lazy initialization of Hindsight Python client."""
        if not self.is_configured:
            raise ValidationErrorException(
                "Hindsight API key is not configured. Please set HINDSIGHT_API_KEY in environment."
            )
        if self._client is None:
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    def health_check(self) -> Dict[str, Any]:
        """Perform a safe health check on Hindsight connectivity with strict timeout protection."""
        if not self.is_configured:
            return {
                "status": "not_configured",
                "bank_id": self.bank_id,
                "message": "HINDSIGHT_API_KEY is missing.",
            }

        def _execute_hindsight_ping() -> Dict[str, Any]:
            client = self.get_client()
            # Ensure target memory bank exists on Hindsight Cloud
            try:
                client.create_bank(
                    bank_id=self.bank_id,
                    name=f"Memory Bank for {self.bank_id}",
                )
            except Exception as bank_err:
                logger.debug(
                    f"[SAFE_DIAGNOSTIC] create_bank info | ErrorType: {type(bank_err).__name__} | Detail: {str(bank_err)}"
                )

            # Minimal test query to verify API connectivity
            client.recall(bank_id=self.bank_id, query="ping", max_tokens=10)
            return {
                "status": "connected",
                "bank_id": self.bank_id,
                "base_url": self.base_url,
            }

        effective_timeout = float(self.timeout) if self.timeout else 10.0

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(_execute_hindsight_ping)
                return future.result(timeout=effective_timeout)
        except concurrent.futures.TimeoutError:
            logger.warning(
                f"[SAFE_DIAGNOSTIC] Hindsight health check timed out after {effective_timeout}s"
            )
            return {
                "status": "connection_failed",
                "bank_id": self.bank_id,
                "base_url": self.base_url,
                "error": f"Hindsight API check timed out after {effective_timeout}s.",
            }
        except Exception as err:
            err_type = type(err).__name__
            status_code = getattr(err, "status_code", getattr(err, "status", "N/A"))
            raw_msg = str(err)
            sanitized_msg = raw_msg.replace(self.api_key, "[MASKED_KEY]") if self.api_key else raw_msg
            logger.warning(
                f"[SAFE_DIAGNOSTIC] Hindsight health check failed | Operation: recall | ErrorType: {err_type} | HTTPStatus: {status_code} | Detail: {sanitized_msg}"
            )
            return {
                "status": "connection_failed",
                "bank_id": self.bank_id,
                "base_url": self.base_url,
                "error": f"Hindsight API check failed ({err_type}).",
            }

    def ensure_bank(
        self,
        bank_id: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create or ensure the target memory bank exists."""
        target_bank = bank_id or self.bank_id
        target_name = name or f"Memory Bank for {target_bank}"

        client = self.get_client()
        try:
            client.create_bank(bank_id=target_bank, name=target_name)
            logger.info(f"Hindsight memory bank '{target_bank}' created or verified.")
            return {
                "status": "success",
                "bank_id": target_bank,
                "message": f"Memory bank '{target_bank}' is ready.",
            }
        except Exception as err:
            logger.error(f"Failed to ensure Hindsight memory bank '{target_bank}': {str(err)}")
            raise AppException(
                message=f"Could not create/verify Hindsight bank '{target_bank}'.",
                status_code=503,
            )

    def retain(
        self,
        content: str,
        context: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, str]] = None,
        document_id: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Persist a memory snippet into the configured Hindsight bank."""
        if not content or not content.strip():
            raise ValidationErrorException("Memory content cannot be empty.")

        client = self.get_client()
        try:
            import asyncio
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop is not None:
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(
                        client.retain,
                        bank_id=self.bank_id,
                        content=content,
                        context=context,
                        timestamp=timestamp,
                        metadata=metadata,
                        document_id=document_id,
                        tags=tags,
                    )
                    response = future.result(timeout=float(self.timeout) if self.timeout else 10.0)
            else:
                response = client.retain(
                    bank_id=self.bank_id,
                    content=content,
                    context=context,
                    timestamp=timestamp,
                    metadata=metadata,
                    document_id=document_id,
                    tags=tags,
                )
            return {
                "status": "retained",
                "bank_id": self.bank_id,
                "document_id": document_id,
                "timestamp": timestamp.isoformat() if timestamp else None,
                "raw_response": str(response),
            }
        except Exception as err:
            logger.error(f"Hindsight retain operation failed: {str(err)}", exc_info=True)
            raise AppException(
                message="Failed to persist memory into Hindsight.",
                status_code=503,
            )

    def recall(
        self,
        query: str,
        types: Optional[List[str]] = None,
        limit: int = 10,
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Retrieve contextually relevant memories from Hindsight."""
        if not query or not query.strip():
            raise ValidationErrorException("Recall query cannot be empty.")

        client = self.get_client()
        try:
            import asyncio
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop is not None:
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(
                        client.recall,
                        bank_id=self.bank_id,
                        query=query,
                        types=types,
                        tags=tags,
                    )
                    response = future.result(timeout=float(self.timeout) if self.timeout else 10.0)
            else:
                response = client.recall(
                    bank_id=self.bank_id,
                    query=query,
                    types=types,
                    tags=tags,
                )

            # Parse results safely
            parsed_results = []
            results_list = getattr(response, "results", []) or []
            for item in results_list:
                parsed_results.append({
                    "text": getattr(item, "text", str(item)),
                    "score": getattr(item, "score", None),
                    "type": getattr(item, "type", None),
                    "metadata": getattr(item, "metadata", None),
                })

            return {
                "query": query,
                "bank_id": self.bank_id,
                "count": len(parsed_results),
                "results": parsed_results[:limit],
            }
        except Exception as err:
            logger.error(f"Hindsight recall operation failed: {str(err)}", exc_info=True)
            raise AppException(
                message="Failed to recall memories from Hindsight.",
                status_code=503,
            )
