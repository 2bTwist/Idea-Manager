from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from datetime import datetime, timezone
from sqlalchemy import text
import socket
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", summary="Health check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Returns API health status.
    """
    try:
        # Quick DB check
        await db.execute(text("SELECT 1"))
        db_status = True
    except Exception as e:
        db_status = False
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "host": socket.gethostname(),
        "db": db_status
    }
