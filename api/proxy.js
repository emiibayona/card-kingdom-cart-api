import { parseAllowedHosts, isHostAllowed, copySelectedHeaders } from './helpers';
import { checkRateLimit } from './rateLimit';

export default async function handler(req, res) {
  const providedKey = req.headers['x-proxy-key'];
  const validKey = process.env.PROXY_API_KEY;
  if (!validKey || providedKey !== validKey) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(401).json({ error: 'Invalid or missing X-PROXY-KEY' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const max = parseInt(process.env.RATE_LIMIT_MAX || '60', 10);
  const windowSec = parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10);
  const limit = checkRateLimit(ip, max, windowSec);
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.remaining));
  res.setHeader('X-RateLimit-Reset', limit.reset);

  if (!limit.allowed) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-PROXY-KEY');
    return res.status(204).end();
  }

  const target = req.query.url || (req.body && req.body.url);
  if (!target) {
    return res.status(400).json({ error: 'Missing ?url parameter' });
  }

  const allowedHosts = parseAllowedHosts(process.env.ALLOWED_HOSTS);
  if (!isHostAllowed(target, allowedHosts)) {
    return res.status(403).json({ error: 'Host not allowed by proxy configuration' });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: copySelectedHeaders(req.headers, ['accept', 'content-type', 'authorization', 'x-requested-with']),
      redirect: 'follow',
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(target, fetchOptions);
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);

    const forwardHeaders = ['content-length', 'cache-control', 'etag'];
    for (const h of forwardHeaders) {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status).send(buffer);
  } catch (err) {
    console.error('Proxy error', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: err.message });
  }
}
