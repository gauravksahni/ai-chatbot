import logging
import json
import sys
from typing import Any, Dict
from datetime import datetime

# Custom JSON formatter
class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Include exception info if available
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        
        # Include any extra attributes
        for key, value in record.__dict__.items():
            if key not in {
                "args", "asctime", "created", "exc_info", "exc_text", "filename",
                "funcName", "id", "levelname", "levelno", "lineno", "module",
                "msecs", "message", "msg", "name", "pathname", "process",
                "processName", "relativeCreated", "stack_info", "thread", "threadName"
            }:
                log_record[key] = value
        
        return json.dumps(log_record)


def setup_logging(log_level: str = "INFO") -> None:
    """
    Set up logging for the application.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level))
    
    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # JSON handler for production
    json_handler = logging.StreamHandler(sys.stdout)
    json_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(json_handler)

    # Set elasticsearch and urllib3 loggers to WARN to avoid noise
    logging.getLogger("elasticsearch").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)