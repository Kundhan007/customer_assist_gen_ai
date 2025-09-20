import logging
import logging.handlers
import os
from datetime import datetime

class CentralLogger:
    def __init__(self, service_name='python-orchestrator', log_file='../nestjs-backend/app.log'):
        self.service_name = service_name
        self.log_file = log_file
        self.logger = logging.getLogger(service_name)
        
        if not self.logger.handlers:
            self._setup_logger()
    
    def _setup_logger(self):
        log_dir = os.path.dirname(os.path.abspath(self.log_file))
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        self.logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        file_handler = logging.handlers.RotatingFileHandler(
            self.log_file,
            maxBytes=10*1024*1024,
            backupCount=7
        )
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
    
    def log(self, message, level='info'):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        formatted_message = f'[{timestamp}] [{self.service_name}] {message}'
        
        if level.lower() == 'error':
            self.logger.error(formatted_message)
        elif level.lower() == 'warning':
            self.logger.warning(formatted_message)
        elif level.lower() == 'debug':
            self.logger.debug(formatted_message)
        else:
            self.logger.info(formatted_message)
    
    def info(self, message):
        self.log(message, 'info')
    
    def error(self, message):
        self.log(message, 'error')
    
    def warning(self, message):
        self.log(message, 'warning')
    
    def debug(self, message):
        self.log(message, 'debug')

logger = CentralLogger()

def get_logger(name):
    """Get a logger instance with the specified name."""
    return logging.getLogger(name)
