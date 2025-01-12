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

def configure_logging(log_level: int = logging.INFO) -> None:
    """Configure root logger with console and file handlers.
    
    Args:
        log_level: The logging level to use for all handlers
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear existing handlers to avoid duplicate logs
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)  # Respect configured log level
    console_formatter = logging.Formatter(LOG_FORMAT)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "asset_processing.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)  # Same level as console
    file_formatter = logging.Formatter(LOG_FORMAT)
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)

    # JSON file handler for structured logging
    json_handler = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "asset_processing_structured.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    json_handler.setLevel(log_level)  # Same level as others
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            # Safely get context or None if not present
            context = getattr(record, 'context', None)
            
            # Build the log record dictionary
            log_record = {
                "timestamp": self.formatTime(record),
                "logger": record.name,
                "level": record.levelname,
                "message": record.getMessage()
            }
            
            # Only add context if it exists
            if context is not None:
                log_record["context"] = context
                
            return json.dumps(log_record)
    
    json_formatter = JsonFormatter()
    json_handler.setFormatter(json_formatter)
    root_logger.addHandler(json_handler)

    # JSON file handler for structured logging
    json_handler = logging.handlers.RotatingFileHandler(
        LOGS_DIR / "asset_processing_structured.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    json_handler.setLevel(logging.DEBUG)
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            # Safely get context or None if not present
            context = getattr(record, 'context', None)
            
            # Build the log record dictionary
            log_record = {
                "timestamp": self.formatTime(record),
                "logger": record.name,
                "level": record.levelname,
                "message": record.getMessage()
            }
            
            # Only add context if it exists
            if context is not None:
                log_record["context"] = context
                
            return json.dumps(log_record)
    
    json_formatter = JsonFormatter()
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
