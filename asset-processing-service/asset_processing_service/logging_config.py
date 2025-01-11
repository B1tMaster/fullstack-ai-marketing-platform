import logging
import logging.handlers
import os
from pathlib import Path
from typing import Dict, Any
import json
from datetime import datetime

# Create logs directory if it doesn't exist
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Standard logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
JSON_LOG_FORMAT = {
    "timestamp": "%(asctime)s",
    "logger": "%(name)s",
    "level": "%(levelname)s",
    "message": "%(message)s",
    "context": "%(context)s"
}

def configure_logging() -> None:
    """Configure root logger with console and file handlers."""
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(LOG_FORMAT)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "asset_processing.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(LOG_FORMAT)
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)

    # JSON file handler for structured logging
    json_handler = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "asset_processing_structured.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    json_handler.setLevel(logging.DEBUG)
    json_formatter = logging.Formatter(json.dumps(JSON_LOG_FORMAT))
    json_handler.setFormatter(json_formatter)
    root_logger.addHandler(json_handler)

def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance with the given name.
    
    Args:
        name: Name of the logger (usually __name__)
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    return logger

def log_error_with_context(
    logger: logging.Logger,
    message: str,
    error: Exception,
    context: Dict[str, Any]
) -> None:
    """Log an error with additional context information.
    
    Args:
        logger: Logger instance to use
        message: Error message
        error: Exception object
        context: Dictionary of additional context information
    """
    log_context = {
        "error_type": error.__class__.__name__,
        "error_message": str(error),
        **context
    }
    
    logger.error(
        f"{message}: {str(error)}",
        extra={"context": json.dumps(log_context)}
    )

# Configure logging when module is imported
configure_logging()
