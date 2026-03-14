const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/$/, '');

const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const rawSocketBase = import.meta.env.VITE_SOCKET_BASE_URL || '';

export const API_BASE_URL = normalizeBaseUrl(rawBase);

export const ENABLE_LOCAL_FALLBACK =
  String(import.meta.env.VITE_ENABLE_LOCAL_FALLBACK || 'false').toLowerCase() === 'true';

export const DEV_BACKEND_HINT =
  import.meta.env.VITE_BACKEND_HINT || 'Set VITE_API_BASE_URL in your .env file';

const withLeadingSlash = (path) => (String(path || '').startsWith('/') ? String(path) : `/${String(path || '')}`);

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

export const SOCKET_BASE_URL = extractOrigin(rawSocketBase) || extractOrigin(API_BASE_URL);
export const SOCKET_PATH = withLeadingSlash(import.meta.env.VITE_SOCKET_PATH || '/socket.io');
