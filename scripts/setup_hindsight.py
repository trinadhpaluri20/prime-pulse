#!/usr/bin/env python3
"""Hindsight Memory Bank Initialization Script."""

import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.core.config import settings
from app.services.hindsight_service import HindsightMemoryService


def main():
    print("=" * 60)
    print("HINDSIGHT PERSISTENT MEMORY BANK SETUP")
    print("=" * 60)

    print(f"Target Base URL: {settings.HINDSIGHT_BASE_URL}")
    print(f"Target Bank ID:  {settings.HINDSIGHT_BANK_ID}")

    if not settings.is_hindsight_configured:
        print("\n[ERROR] HINDSIGHT_API_KEY environment variable is missing!")
        print("Please configure HINDSIGHT_API_KEY in your .env file.")
        print("Example: HINDSIGHT_API_KEY=your_actual_key_here")
        sys.exit(1)

    print("\n[+] API Key detected (Key obscured for security: ***)")
    print("[+] Connecting to Hindsight persistent memory service...")

    try:
        service = HindsightMemoryService()
        result = service.ensure_bank(bank_id=settings.HINDSIGHT_BANK_ID)
        print(f"\n[SUCCESS] Memory Bank Status: {result.get('status')}")
        print(f"[SUCCESS] Message: {result.get('message')}")
        print(f"[SUCCESS] Memory bank '{settings.HINDSIGHT_BANK_ID}' is active and ready.")
    except Exception as err:
        print(f"\n[FAILURE] Failed to setup Hindsight memory bank: {err}")
        sys.exit(1)

    print("=" * 60)


if __name__ == "__main__":
    main()
