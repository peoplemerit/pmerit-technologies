/**
 * Structured Logger
 *
 * JSON-structured logging for Cloudflare Workers.
 * All output is JSON for structured log ingestion via wrangler tail,
 * Cloudflare Logpush, or future Datadog/LogTail integration.
 *
 * Usage:
 *   log.info('User registered', { userId: '123', tier: 'TRIAL' });
 *   log.warn('Rate limit approaching', { userId: '123', remaining: 5 });
 *   log.error('Database query failed', { error: err.message, query: 'SELECT...' });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...data,
  };

  const json = JSON.stringify(entry);

  switch (level) {
    case 'debug':
    case 'info':
      console.log(json);
      break;
    case 'warn':
      console.warn(json);
      break;
    case 'error':
      console.error(json);
      break;
  }
}

export const log = {
  debug: (msg: string, data?: Record<string, unknown>) => emit('debug', msg, data),
  info: (msg: string, data?: Record<string, unknown>) => emit('info', msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => emit('warn', msg, data),
  error: (msg: string, data?: Record<string, unknown>) => emit('error', msg, data),
};
