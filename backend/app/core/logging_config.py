import logging, sys, pathlib
from logging.handlers import TimedRotatingFileHandler
from app.core.config import LOG_DIR

logger = logging.getLogger("capstone")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s | %(levelname)-8s | %(module)s | %(message)s")

# Console
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.INFO)
ch.setFormatter(formatter)
logger.addHandler(ch)

# File rotating handler
log_path = pathlib.Path(LOG_DIR) / "auth.log"
fh = TimedRotatingFileHandler(log_path, when="midnight", backupCount=7, encoding="utf-8")
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
logger.addHandler(fh)
