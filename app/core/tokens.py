"""Token utilities (hashing, helpers).

Centralizes token hashing so routers/services can share the same
implementation without duplication.
"""

from __future__ import annotations

import hashlib

__all__ = ["hash_token"]


def hash_token(raw: str) -> str:
    """Return a stable SHA-256 hex digest for a token.

    Use for storing/looking up one-time tokens (password reset, email verify).
    """
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
