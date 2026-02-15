/**
 * Error Tracker Utility Tests
 *
 * Validates structured error logging output format for wrangler tail.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackError, trackWarning } from '../src/utils/errorTracker';

describe('trackError', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should output structured JSON to console.error', () => {
    trackError(new Error('test failure'));

    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.level).toBe('error');
    expect(output.message).toBe('test failure');
    expect(output.error).toBe('Error');
    expect(output.timestamp).toBeDefined();
  });

  it('should include context metadata', () => {
    trackError(new Error('route error'), {
      requestId: 'req-123',
      userId: 'user-456',
      path: '/api/v1/auth/me',
      method: 'GET',
      statusCode: 500,
    });

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.requestId).toBe('req-123');
    expect(output.userId).toBe('user-456');
    expect(output.path).toBe('/api/v1/auth/me');
    expect(output.method).toBe('GET');
    expect(output.statusCode).toBe(500);
  });

  it('should handle non-Error objects', () => {
    trackError('string error message');

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.message).toBe('string error message');
    expect(output.level).toBe('error');
  });

  it('should include extra context', () => {
    trackError(new Error('db error'), {
      extra: { table: 'sessions', operation: 'INSERT' },
    });

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.context).toEqual({ table: 'sessions', operation: 'INSERT' });
  });

  it('should truncate stack traces to 5 lines', () => {
    const error = new Error('deep error');
    // Simulate a long stack
    error.stack = Array.from({ length: 20 }, (_, i) => `    at func${i} (file.ts:${i}:0)`).join('\n');

    trackError(error);

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    const stackLines = output.stack.split('\n');
    expect(stackLines.length).toBeLessThanOrEqual(5);
  });
});

describe('trackWarning', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should output structured JSON to console.warn', () => {
    trackWarning('rate limit approaching');

    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.level).toBe('warn');
    expect(output.message).toBe('rate limit approaching');
    expect(output.timestamp).toBeDefined();
  });

  it('should include optional context', () => {
    trackWarning('slow query', {
      requestId: 'req-789',
      path: '/api/v1/router',
      extra: { queryTimeMs: 2500 },
    });

    const output = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(output.requestId).toBe('req-789');
    expect(output.path).toBe('/api/v1/router');
    expect(output.context).toEqual({ queryTimeMs: 2500 });
  });
});
