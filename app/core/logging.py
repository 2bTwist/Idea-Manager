# app/core/logging.py
import logging
import logging.config
import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

def configure_logging():
    """
    Configure logging for the app, uvicorn, and SQLAlchemy.
    """
    log_format = (
        "ts=%(asctime)s level=%(levelname)s logger=%(name)s "
        "msg=%(message)s"
    )
    date_format = "%Y-%m-%dT%H:%M:%S%z"

    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "logfmt": {"format": log_format, "datefmt": date_format}
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": "logfmt",
                "stream": "ext://sys.stdout",
            }
        },
        "root": {"level": LOG_LEVEL, "handlers": ["default"]},
        "loggers": {
            # Your app logs
            "app": {"level": LOG_LEVEL, "handlers": ["default"], "propagate": False},

            # FastAPI/Uvicorn logs
            "uvicorn": {"level": LOG_LEVEL, "handlers": ["default"], "propagate": False},
            "uvicorn.error": {"level": LOG_LEVEL, "handlers": ["default"], "propagate": False},
            "uvicorn.access": {"level": LOG_LEVEL, "handlers": ["default"], "propagate": False},

            # SQLAlchemy logs (set to INFO to see SQL)
            "sqlalchemy": {"level": "WARNING", "handlers": ["default"], "propagate": False},
        },
    }

    logging.config.dictConfig(config)
