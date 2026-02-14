# BYOK Multi-Provider Testing Guide

## What Was Fixed

**Problem**: BYOK users could only configure ONE API key for all providers, causing failures for OpenAI, DeepSeek, and Google.

**Solution**: Implemented provider-specific API key storage and management system.

## Changes Deployed

- **Backend Version**: `a2b80675-49cf-4266-a8da-21d22f7fed4b`
- **Migration**: `033_user_api_keys.sql` (applied to production)
- **New Table**: `user_api_keys` (stores provider-specific keys)
- **New Endpoints**: `/api/v1/api-keys` (manage user keys)

---

## Testing Steps

### Option 1: Insert Keys Directly (Quick Test)

1. **Edit the SQL file** with your actual API keys:
   ```bash
   notepad insert-test-keys.sql
   ```
   
2. **Replace placeholders** with your real keys:
   - `YOUR_ANTHROPIC_KEY_HERE` → Your Anthropic API key (starts with `sk-ant-`)
   - `YOUR_OPENAI_KEY_HERE` → Your OpenAI API key (starts with `sk-`)
   - `YOUR_DEEPSEEK_KEY_HERE` → Your DeepSeek API key (starts with `sk-`)
   - `YOUR_GOOGLE_KEY_HERE` → Your Google Gemini API key

3. **Run the migration**:
   ```bash
   cd C:\dev\pmerit\pmerit-technologies\products\aixord-router-worker
   npx wrangler d1 execute aixord-db --remote --file insert-test-keys.sql
   ```

4. **Test in AIXORD**:
   - Go to https://aixord.pmerit.com
   - Try sending a message
   - Router will try providers in this order for HIGH_QUALITY:
     1. Anthropic (claude-sonnet-4-5)
     2. OpenAI (gpt-4o)
     3. Google (gemini-2.0-pro)
   - All should work now!

### Option 2: Use API Endpoints (Production Method)

You'll need to get your session token first, then use curl to add keys.

#### Step 1: Get Session Token

1. Open browser DevTools (F12) on https://aixord.pmerit.com
2. Go to Application → Storage → Local Storage
3. Find `aixord_session` or similar auth token
4. Copy the token value

#### Step 2: Add API Keys

```bash
# Set your session token
set TOKEN=your_session_token_here

# Add Anthropic key
curl -X POST https://aixord-router-worker.peoplemerit.workers.dev/api/v1/api-keys ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"anthropic\",\"apiKey\":\"sk-ant-YOUR_KEY\",\"label\":\"My Anthropic Key\"}"

# Add OpenAI key
curl -X POST https://aixord-router-worker.peoplemerit.workers.dev/api/v1/api-keys ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"openai\",\"apiKey\":\"sk-YOUR_KEY\",\"label\":\"My OpenAI Key\"}"

# Add DeepSeek key
curl -X POST https://aixord-router-worker.peoplemerit.workers.dev/api/v1/api-keys ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"deepseek\",\"apiKey\":\"sk-YOUR_KEY\",\"label\":\"My DeepSeek Key\"}"

# Add Google key
curl -X POST https://aixord-router-worker.peoplemerit.workers.dev/api/v1/api-keys ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"google\",\"apiKey\":\"YOUR_KEY\",\"label\":\"My Google Key\"}"
```

#### Step 3: Verify Keys

```bash
# List configured keys (shows masked keys)
curl https://aixord-router-worker.peoplemerit.workers.dev/api/v1/api-keys ^
  -H "Authorization: Bearer %TOKEN%"
```

---

## Expected Behavior After Fix

### Before (Broken):
- ✅ Anthropic requests worked
- ❌ OpenAI requests failed: "API key invalid"
- ❌ DeepSeek requests failed: "API key invalid"
- ❌ Google requests failed: "API key not valid"

### After (Fixed):
- ✅ Anthropic requests work (uses your Anthropic key)
- ✅ OpenAI requests work (uses your OpenAI key)
- ✅ DeepSeek requests work (uses your DeepSeek key)
- ✅ Google requests work (uses your Google key)

---

## Provider Fallback Order

For `HIGH_QUALITY` model class (default for most requests):

1. **Anthropic** (claude-sonnet-4-5-20250929) - Primary
2. **OpenAI** (gpt-4o) - First fallback
3. **Google** (gemini-2.0-pro) - Second fallback

If all three fail, you'll get:
```
ALL_PROVIDERS_FAILED: All providers failed for class HIGH_QUALITY
```

---

## Troubleshooting

### Error: "No API key configured for [provider]"

**Cause**: Key not added for that provider yet.

**Solution**: Add the missing provider's key using Option 1 or 2 above.

### Error: "BYOK mode requires user_api_key"

**Cause**: Old code still being used (cache issue).

**Solution**: 
- Backend version should be `a2b80675-49cf-4266-a8da-21d22f7fed4b`
- Check deployment: https://dash.cloudflare.com → Workers → aixord-router-worker
- Wait 1-2 minutes for global deployment

### Error: "API key invalid" from provider

**Cause**: Wrong API key format or expired key.

**Solution**:
- Verify key format:
  - Anthropic: `sk-ant-...`
  - OpenAI: `sk-...`
  - DeepSeek: `sk-...`
  - Google: varies (often shorter keys)
- Test key directly with provider's API
- Regenerate key if needed

---

## Database Schema

### user_api_keys Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (nanoid) |
| user_id | TEXT | Foreign key to users.id |
| provider | TEXT | 'anthropic', 'openai', 'google', or 'deepseek' |
| api_key | TEXT | The API key (stored encrypted) |
| label | TEXT | Optional user-friendly label |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

**Constraint**: One key per provider per user (`UNIQUE(user_id, provider)`)

---

## API Endpoints

### GET /api/v1/api-keys
**Auth**: Required (session token)

**Returns**: List of configured keys (keys are NOT shown, only metadata)
```json
{
  "keys": [
    {
      "id": "key_abc123",
      "provider": "anthropic",
      "label": "My Anthropic Key",
      "created_at": "2026-02-14T12:00:00.000Z",
      "updated_at": "2026-02-14T12:00:00.000Z"
    }
  ]
}
```

### POST /api/v1/api-keys
**Auth**: Required (session token)

**Body**:
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "label": "My Key" // optional
}
```

**Returns**:
```json
{
  "message": "anthropic API key added successfully",
  "provider": "anthropic",
  "id": "key_abc123"
}
```

### DELETE /api/v1/api-keys/:provider
**Auth**: Required (session token)

**Example**: `DELETE /api/v1/api-keys/anthropic`

**Returns**:
```json
{
  "message": "anthropic API key removed successfully",
  "provider": "anthropic"
}
```

---

## Next Steps (Frontend UI)

The backend is ready, but the frontend needs a settings page where users can:
1. View configured API keys
2. Add new keys
3. Update existing keys
4. Remove keys

**Recommendation**: Add a Settings page with:
- List of providers (Anthropic, OpenAI, DeepSeek, Google)
- Input fields for each provider's API key
- "Save" button that calls POST /api/v1/api-keys
- Visual indicators showing which providers are configured

---

## Testing Checklist

- [ ] Insert test keys into database (Option 1)
- [ ] Verify keys with: `SELECT provider FROM user_api_keys WHERE user_id = 'YOUR_USER_ID'`
- [ ] Test Anthropic requests (should work)
- [ ] Test OpenAI requests (should work after fix)
- [ ] Test DeepSeek requests (should work after fix)
- [ ] Test Google requests (should work after fix)
- [ ] Test fallback (remove Anthropic key, verify OpenAI is used)
- [ ] Test error message (remove all keys, verify helpful error)

---

## Success Criteria

✅ All 4 providers work with BYOK subscription
✅ Provider-specific keys are used (not single key for all)
✅ Fallback works when primary provider fails
✅ Clear error messages when keys are missing
✅ API endpoints work for key management
✅ Database migration applied successfully

---

**Created**: 2026-02-14  
**Backend Version**: a2b80675-49cf-4266-a8da-21d22f7fed4b  
**Migration**: 033_user_api_keys.sql
