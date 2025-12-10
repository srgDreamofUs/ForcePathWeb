"""Logging configuration for the FastAPI backend."""
from __future__ import annotations

import logging
import sys
from pathlib import Path

from api.app.core.config import get_settings

settings = get_settings()


def setup_logging() -> None:
    """Configure application logging."""
    log_level = logging.DEBUG if settings.forcepath_env == "local" else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Set third-party loggers to WARNING
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)




