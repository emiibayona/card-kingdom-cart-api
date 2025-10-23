# Vercel CORS Proxy with API Key & Rate Limiting

Deploy a secure CORS proxy to Vercel.

### Features

- API Key authentication via `X-PROXY-KEY` header
- Rate limiting per IP (configurable)
- Host whitelist support (`ALLOWED_HOSTS`)

### Environment Variables

PROXY_API_KEY=your-secret
ALLOWED_HOSTS=cardkingdom.com
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW=60

### Example Usage

```js
fetch(
  `/api/proxy?url=${encodeURIComponent(
    "https://www.cardkingdom.com/api/cart"
  )}`,
  {
    headers: { "X-PROXY-KEY": "your-secret" },
  }
)
  .then((r) => r.json())
  .then(console.log);
```
