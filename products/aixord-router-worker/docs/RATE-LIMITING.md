# Rate Limiting Implementation

## Overview

The D4-CHAT backend implements request rate limiting to protect against abuse, brute force attacks, and API overload. Rate limits are tracked in the D1 database and enforced via Hono middleware.

## Architecture

### Storage
- **Database**: D1 (SQLite)
- **Table**: `rate_limits`
- **Keys**: Composite key of `userId:windowKey` or `ip:windowKey`
- **Window Strategy**: Time-based sliding windows using floor division

### Middleware Location
- **File**: `src/middleware/rateLimit.ts`
- **Migration**: `migrations/029_rate_limits.sql`
- **Tests**: `tests/rateLimit.test.ts`

## Rate Limit Tiers

### Global Limits
- **General API**: 200 requests/minute
- **Router API**: 200 requests/minute

### Sensitive Endpoints
- **Login**: 10 requests/minute
- **Register**: 10 requests/minute
- **Auth routes**: 20 requests/minute
- **Router Execute**: 30 requests/minute
- **Billing**: 20 requests/minute

## Configuration

### Basic Usage

```typescript
import { rateLimit } from './middleware/rateLimit';

// Apply to all routes
app.use('*', rateLimit({
  windowMs: 60000,      // 1 minute window
  maxRequests: 100      // 100 requests per window
}));

// Apply to specific routes
app.use('/api/auth/*', rateLimit({
  windowMs: 60000,
  maxRequests: 10
}));
```

### Custom Key Generator

```typescript
app.use('/api/*', rateLimit({
  windowMs: 60000,
  maxRequests: 50,
  keyGenerator: (c) => {
    // Use custom identifier
    return c.get('userId') || c.req.header('x-api-key') || 'anonymous';
  }
}));
```

## Response Headers

When rate limiting is active, the following headers are included:

- `X-RateLimit-Limit`: Maximum requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets
- `Retry-After`: Seconds until rate limit resets (only when blocked)

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limit": 100,
  "reset": 1705881600
}
```

**HTTP Status**: `429 Too Many Requests`

## Database Schema

```sql
CREATE TABLE rate_limits (
  key TEXT NOT NULL,
  window_key TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (key, window_key)
);

CREATE INDEX idx_rate_limits_cleanup ON rate_limits(created_at);
```

## Key Design

### Composite Key Format
`${identifier}:${windowKey}`

### Window Key Calculation
```typescript
const now = Date.now();
const windowKey = Math.floor(now / windowMs).toString();
```

### Identifier Priority
1. `userId` from auth context (authenticated users)
2. `cf-connecting-ip` header (unauthenticated users)
3. `'unknown'` fallback

## Maintenance

### Cleanup Old Records

Rate limit records older than 24 hours are automatically eligible for cleanup. To manually clean:

```typescript
import { cleanupRateLimits } from './middleware/rateLimit';

const deletedCount = await cleanupRateLimits(c.env.DB);
console.log(`Cleaned up ${deletedCount} old rate limit records`);
```

### Monitoring

Track rate limit violations:

```sql
-- Count rate limit records per user
SELECT key, SUM(request_count) as total_requests
FROM rate_limits
WHERE created_at > datetime('now', '-1 hour')
GROUP BY key
ORDER BY total_requests DESC
LIMIT 10;

-- Find blocked IPs/users (maxed out)
SELECT key, window_key, request_count
FROM rate_limits
WHERE request_count >= 100
AND created_at > datetime('now', '-1 hour');
```

## Security Considerations

### Defense in Depth
Rate limiting is one layer of protection. Also implement:
- Authentication and authorization
- Input validation
- CORS policies
- Request size limits

### Fail-Open Strategy
If the rate limit middleware encounters an error (e.g., database unavailable), it fails open and allows the request through. This prevents rate limiting from causing complete service outages.

### Distributed Limitation
Since rate limits are stored in D1, they are consistent across all Cloudflare Workers instances globally. No coordination is needed.

### Bypass Protection
- Rate limit checks happen AFTER CORS but BEFORE authentication
- Cannot be bypassed by changing IP headers (uses `cf-connecting-ip`)
- Window keys are time-based, not sequence-based

## Performance

### Database Operations
- **Per Request**: 1 SELECT + 1 INSERT/UPDATE
- **Optimization**: Composite primary key allows instant lookups
- **Index**: Cleanup index on `created_at` for maintenance queries

### Edge Performance
- Cloudflare D1 is globally distributed
- Sub-10ms database queries at edge locations
- Negligible latency impact (<15ms per request)

## Testing

Run rate limit tests:

```bash
npm test tests/rateLimit.test.ts
```

Test coverage includes:
- Requests within limit
- Requests exceeding limit
- Custom key generators
- Multiple IP isolation
- Response headers
- 429 error format

## Migration

To apply the rate limiting schema:

```bash
wrangler d1 execute <DATABASE_NAME> --file=migrations/029_rate_limits.sql
```

Verify migration:

```bash
wrangler d1 execute <DATABASE_NAME> --command="SELECT name FROM sqlite_master WHERE type='table' AND name='rate_limits';"
```

## Future Enhancements

Potential improvements:
- Per-user tier-based limits (TRIAL vs PRO)
- Redis/KV integration for higher performance
- Distributed rate limiting across multiple services
- Dynamic rate limit adjustment based on load
- Rate limit exemptions for trusted IPs
- Detailed rate limit analytics dashboard

## References

- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Hono Middleware Documentation](https://hono.dev/docs/guides/middleware)
