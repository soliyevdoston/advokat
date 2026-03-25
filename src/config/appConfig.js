const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/$/, '');
const withLeadingSlash = (path) => (String(path || '').startsWith('/') ? String(path) : `/${String(path || '')}`);

const normalizeProxyPrefix = (value) => {
  const cleaned = withLeadingSlash(String(value || '/__api').replace(/^\/+|\/+$/g, ''));
  return cleaned === '/' ? '/__api' : cleaned;
};

const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const rawSocketBase = import.meta.env.VITE_SOCKET_BASE_URL || '';

export const ENABLE_DEV_PROXY =
  import.meta.env.DEV && String(import.meta.env.VITE_ENABLE_DEV_PROXY || 'true').toLowerCase() === 'true';
export const DEV_PROXY_PREFIX = normalizeProxyPrefix(import.meta.env.VITE_DEV_PROXY_PREFIX || '/__api');

export const API_BASE_URL = ENABLE_DEV_PROXY ? DEV_PROXY_PREFIX : normalizeBaseUrl(rawBase);

export const ENABLE_LOCAL_FALLBACK =
  String(import.meta.env.VITE_ENABLE_LOCAL_FALLBACK || 'false').toLowerCase() === 'true';

export const DEV_BACKEND_HINT =
  import.meta.env.VITE_BACKEND_HINT || 'Set VITE_API_BASE_URL in your .env file';

export const buildApiUrl = (path) => `${API_BASE_URL}${withLeadingSlash(path)}`;

const extractOrigin = (value) => {
  const text = normalizeBaseUrl(value);
  if (!text) return '';

  try {
    return new URL(text).origin;
  } catch {
    return '';
  }
};

const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

export const SOCKET_BASE_URL = ENABLE_DEV_PROXY
  ? browserOrigin
  : extractOrigin(rawSocketBase) || extractOrigin(API_BASE_URL);

export const SOCKET_PATH = ENABLE_DEV_PROXY
  ? `${DEV_PROXY_PREFIX}/socket.io`
  : withLeadingSlash(import.meta.env.VITE_SOCKET_PATH || '/socket.io');
