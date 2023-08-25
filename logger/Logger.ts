export enum LogLevel {
  INFO,
  WARNING,
  ERROR,
}

class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  private timeNow(date: Date) : string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
  }

  private log(level: LogLevel, message: string) {
    if (level >= this.logLevel) {
      const prefix = this.getLogLevelPrefix(level);
      const timestamp = this.timeNow(new Date()); // Get current timestamp
      console.log(`[${timestamp}] [${prefix}] ${message}`);
    }
  }

  private getLogLevelPrefix(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARNING:
        return 'WARNING';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return '';
    }
  }

  public info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  public warn(message: string) {
    this.log(LogLevel.WARNING, message);
  }

  public error(message: string) {
    this.log(LogLevel.ERROR, message);
  }
}

export default Logger;
