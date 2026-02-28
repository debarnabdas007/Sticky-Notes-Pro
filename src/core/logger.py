import logging
import sys

def setup_logger():
    logger = logging.getLogger("sticky_app")
    logger.setLevel(logging.INFO)
    
    # Create console handler and set level
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    
    # Create standard formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    ch.setFormatter(formatter)
    
    if not logger.handlers:
        logger.addHandler(ch)
        
    return logger

logger = setup_logger()