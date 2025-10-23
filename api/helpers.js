export function parseAllowedHosts(envValue) {
  if (!envValue) return null;
  return envValue.split(',').map(s => s.trim()).filter(Boolean);
}

export function isHostAllowed(url, allowedHosts) {
  if (!allowedHosts) return true;
  try {
    const u = new URL(url);
    return allowedHosts.includes(u.hostname) || allowedHosts.includes(u.host);
  } catch {
    return false;
  }
}

export function copySelectedHeaders(srcHeaders, allowed = []) {
  const headers = {};
  for (const [k, v] of Object.entries(srcHeaders || {})) {
    const lower = k.toLowerCase();
    if (allowed.length === 0 || allowed.includes(lower)) {
      headers[k] = v;
    }
  }
  return headers;
}
