import log from 'loglevel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class RemoteLogger {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async sendToBackend(level, message, service = 'react') {
    const logData = {
      level,
      message,
      service,
      timestamp: new Date().toISOString()
    };

    this.queue.push(logData);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const logData = this.queue[0];
      let retryCount = 0;
      let success = false;

      while (retryCount < this.maxRetries && !success) {
        try {
          const response = await fetch(`${API_BASE_URL}/log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
          });

          if (response.ok) {
            success = true;
            this.queue.shift();
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          retryCount++;
          if (retryCount < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          }
        }
      }

      if (!success) {
        console.warn(`Failed to send log after ${this.maxRetries} retries:`, logData);
        this.queue.shift();
      }
    }

    this.isProcessing = false;
  }
}

const remoteLogger = new RemoteLogger();

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  
  return function (...args) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    remoteLogger.sendToBackend(methodName, message, loggerName || 'react');
    rawMethod.apply(this, args);
  };
};

log.setLevel(process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

export default log;
