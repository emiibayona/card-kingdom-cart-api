# Vercel CORS Proxy with API Key & Rate Limiting

Deploy to Vercel with:

```
vercel deploy
```

### Env vars
```
PROXY_API_KEY=your-secret
ALLOWED_HOSTS=cardkingdom.com
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW=60
```

### Example
```js
fetch(`/api/proxy?url=${encodeURIComponent('https://www.cardkingdom.com/api/cart')}`, {
  headers: { 'X-PROXY-KEY': 'your-secret' }
}).then(r => r.json()).then(console.log);
```
