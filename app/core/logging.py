# app/core/logging.py
import logging
import logging.config
import os
import sys

# Optional but recommended on Windows for ANSI colors:
try:
    import colorama
    colorama.just_fix_windows_console()
except Exception:
    pass

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# --- ANSI colors (keep it simple) ---
RESET = "\x1b[0m"
WHITE = "\x1b[37m"
COLORS = {
    "DEBUG": "\x1b[36m",      # cyan
    "INFO": "\x1b[32m",       # green
    "WARNING": "\x1b[33m",    # yellow
    "ERROR": "\x1b[31m",      # red
    "CRITICAL": "\x1b[1;31m", # bold red
}

# Map HTTP status code to color
def status_color(code: int) -> str:
    if 200 <= code < 300:
        return "\x1b[32m"  # green
    if 300 <= code < 400:
        return "\x1b[36m"  # cyan
    if 400 <= code < 500:
        return "\x1b[33m"  # yellow
    return "\x1b[31m"      # red for 5xx / other


class NiceFormatter(logging.Formatter):
    """
    Generic formatter:
    - time (white)
    - level (colored)
    - logger name (white)
    - message (white)
    """
    def format(self, record: logging.LogRecord) -> str:
        # Ensure asctime is computed
        if not hasattr(record, "asctime"):
            record.asctime = self.formatTime(record, "%Y-%m-%d %H:%M:%S")

        levelname = record.levelname
        level_col = COLORS.get(levelname, WHITE)

        # Everything white except colored level
        parts = [
            f"{WHITE}{record.asctime}{RESET}",
            f"{level_col}{levelname:<8}{RESET}",
            f"{WHITE}{record.name}{RESET}",
            f"{WHITE}{record.getMessage()}{RESET}",
        ]
        formatted = " | ".join(parts)
        
        # Add traceback if exception info is present
        if record.exc_info:
            formatted += "\n" + self.formatException(record.exc_info)
        elif record.exc_text:
            formatted += "\n" + record.exc_text
            
        return formatted


class AccessFormatter(NiceFormatter):
    """
    Formatter for app.request lines.
    Same style as NiceFormatter, but colors just the status=XXX segment.
    We rely on the middleware to pass status_code, method, path, duration_ms, client in record.extra.
    """
    def format(self, record: logging.LogRecord) -> str:
        # Build base line first (time | LEVEL | logger | message)
        if not hasattr(record, "asctime"):
            record.asctime = self.formatTime(record, "%Y-%m-%d %H:%M:%S")

        levelname = record.levelname
        level_col = COLORS.get(levelname, WHITE)

        # Pull structured fields (all optional)
        method = getattr(record, "method", None)
        path = getattr(record, "path", None)
        status_code = getattr(record, "status_code", None)
        duration_ms = getattr(record, "duration_ms", None)
        client = getattr(record, "client", None)
        rid = getattr(record, "request_id", "-")

        if all(v is not None for v in (method, path, status_code, duration_ms, client)):
            # status gets color; everything else white
            sc_col = status_color(int(status_code))
            msg = (
                f"{WHITE}rid={rid} method={method} path={path} "
                f"status={sc_col}{status_code}{RESET} "
                f"duration_ms={duration_ms} client={client}{RESET}"
            )
        else:
            # Fallback to plain message if fields missing
            msg = f"{WHITE}{record.getMessage()}{RESET}"

        parts = [
            f"{WHITE}{record.asctime}{RESET}",
            f"{level_col}{levelname:<8}{RESET}",
            f"{WHITE}{record.name}{RESET}",
            msg,
        ]
        formatted = " | ".join(parts)
        
        # Add traceback if exception info is present
        if record.exc_info:
            formatted += "\n" + self.formatException(record.exc_info)
        elif record.exc_text:
            formatted += "\n" + record.exc_text
            
        return formatted


def configure_logging() -> None:
    """
    Configure all loggers:
    - root/app/uvicorn use NiceFormatter
    - app.request uses AccessFormatter
    - uvicorn.access is silenced (we have our own)
    """
    use_color = sys.stdout.isatty()

    handlers = {
        "stdout_default": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "formatter": "nice" if use_color else "plain",
        },
        "stdout_access": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "formatter": "access" if use_color else "plain",
        },
    }

    formatters = {
        "nice": {
            "()": NiceFormatter,
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "access": {
            "()": AccessFormatter,
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "plain": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    }

    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": formatters,
        "handlers": handlers,
        "root": {"level": LOG_LEVEL, "handlers": ["stdout_default"]},
        "loggers": {
            # Our app loggers
            "app": {"level": LOG_LEVEL, "handlers": ["stdout_default"], "propagate": False},
            "app.request": {"level": LOG_LEVEL, "handlers": ["stdout_access"], "propagate": False},

            # Uvicorn
            "uvicorn": {"level": LOG_LEVEL, "handlers": ["stdout_default"], "propagate": False},
            "uvicorn.error": {"level": LOG_LEVEL, "handlers": ["stdout_default"], "propagate": False},

            # Silence uvicorn.access (we log access ourselves)
            "uvicorn.access": {"level": "CRITICAL", "handlers": ["stdout_default"], "propagate": False},

            # SQLAlchemy (quiet by default; flip to INFO when needed)
            "sqlalchemy.engine": {"level": "WARNING", "handlers": ["stdout_default"], "propagate": False},
        },
    })
