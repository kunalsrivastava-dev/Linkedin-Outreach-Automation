import fs from 'fs';
import path from 'path';
import { LOG_FILE, LOGS_DIR } from '../config/constants.js';

// Ensure the logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

class Logger {
  private logStream: fs.WriteStream;

  constructor() {
    this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a', encoding: 'utf8' });
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  info(message: string): void {
    const formatted = this.formatMessage('INFO', message);
    console.log(message);
    this.logStream.write(formatted + '\n');
  }

  success(message: string): void {
    const formatted = this.formatMessage('SUCCESS', message);
    // Green checkmark color in terminal
    console.log(`\x1b[32m✓ ${message}\x1b[0m`);
    this.logStream.write(formatted + '\n');
  }

  warn(message: string): void {
    const formatted = this.formatMessage('WARN', message);
    // Yellow text for warning
    console.warn(`\x1b[33m⚠ ${message}\x1b[0m`);
    this.logStream.write(formatted + '\n');
  }

  error(message: string, error?: any): void {
    let errorStr = '';
    if (error) {
      if (error instanceof Error) {
        errorStr = `\n${error.stack || error.message}`;
      } else {
        errorStr = `\n${JSON.stringify(error)}`;
      }
    }
    
    const formatted = this.formatMessage('ERROR', message + errorStr);
    // Red text for error
    console.error(`\x1b[31m✗ ${message}\x1b[0m`);
    if (errorStr) {
      console.error(`\x1b[31m${errorStr}\x1b[0m`);
    }
    this.logStream.write(formatted + '\n');
  }

  divider(): void {
    const dividerText = '='.repeat(40);
    console.log(dividerText);
    this.logStream.write(dividerText + '\n');
  }

  close(): void {
    this.logStream.end();
  }
}

export const logger = new Logger();
export default logger;
