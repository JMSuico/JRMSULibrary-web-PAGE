// Use relative API base url so Vite proxy (in dev) and Nginx (in prod) handles routing.
// This ensures SameSite cookies work correctly across identical origins.
const getApiBase = () => {
  // Always use a relative path. This forces the browser to treat API calls as Same-Origin.
  // In Docker (Nginx) and local dev (Vite), /api is configured to proxy to the backend.
  // This solves the 'infinite login loop' caused by browsers rejecting Cross-Origin cookies on HTTP.
  return '/api';
};

const API_BASE = getApiBase();

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath);
      if (url.pathname.startsWith('/media/')) {
        return url.pathname;
      }
    } catch (e) {
      // Ignore invalid URLs
    }
    return imagePath;
  }
  
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath;
  
  if (imagePath.startsWith('/')) return imagePath;
  return `/${imagePath}`;
};

export const getFileUrl = getImageUrl;

/**
 * Converts a media path into its fast `_thumb.webp` thumbnail URL when applicable.
 * Preserves query/hash suffixes and falls back cleanly for non-media, SVG, e-resource,
 * data:, blob:, or already-thumbnailed paths.
 */
export const getThumbnailUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  const base = getImageUrl(imagePath);
  if (!base) return '';
  if (base.startsWith('data:') || base.startsWith('blob:')) return base;

  const queryOrHashIdx = base.search(/[?#]/);
  const pathname = queryOrHashIdx >= 0 ? base.slice(0, queryOrHashIdx) : base;
  const suffix = queryOrHashIdx >= 0 ? base.slice(queryOrHashIdx) : '';
  const lowerPath = pathname.toLowerCase();

  if (
    !lowerPath.startsWith('/media/') ||
    lowerPath.startsWith('/media/e_resources/') ||
    lowerPath.endsWith('.svg') ||
    lowerPath.endsWith('_thumb.webp')
  ) {
    return base;
  }

  const lastSlash = pathname.lastIndexOf('/');
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot <= lastSlash) {
    return base;
  }

  return `${pathname.slice(0, lastDot)}_thumb.webp${suffix}`;
};

export function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Ensures the CSRF cookie is set before making state-changing requests.
 * The public landing page does not have a session, so the csrftoken cookie
 * may not be present. This fetches /api/csrf/ to set it if missing.
 * Safe to call multiple times — only makes a network request when needed.
 */
let _csrfFetchPromise: Promise<void> | null = null;
export const ensureCsrfToken = async (): Promise<void> => {
  if (getCookie('csrftoken')) return; // Already have it
  if (_csrfFetchPromise) return _csrfFetchPromise; // Deduplicate concurrent calls
  _csrfFetchPromise = fetch(`${API_BASE}/csrf/`, { credentials: 'include' })
    .then(() => { /* cookie is now set by Django */ })
    .catch(() => { /* silently fail — form will retry */ })
    .finally(() => { _csrfFetchPromise = null; });
  return _csrfFetchPromise;
};

// Background polling endpoints that should NEVER trigger a global logout redirect.
// These fire silently in the background and may return 401 briefly during session init
// or page navigation, which should NOT kick the user out of the admin panel.
const SILENT_ENDPOINTS = [
  '/settings/last_update/',
  '/users/heartbeat/',
  '/users/me/',
];

/**
 * Returns true only when targetUrl resolves to a relative same-origin `/...` path
 * (excluding protocol-relative `//...`), the current window origin, or the configured API_BASE origin.
 */
export function isTrustedApiOrigin(
  targetUrl: string,
  currentOrigin?: string,
  configuredApiBase: string = API_BASE
): boolean {
  if (!targetUrl) return false;
  const trimmed = targetUrl.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  const resolvedOrigin =
    currentOrigin !== undefined
      ? currentOrigin
      : typeof window !== 'undefined' && window.location
        ? window.location.origin
        : '';

  const fallbackBase = resolvedOrigin || 'http://localhost';

  try {
    const parsedTarget = new URL(trimmed, fallbackBase);
    if (parsedTarget.protocol !== 'http:' && parsedTarget.protocol !== 'https:') {
      return false;
    }

    const trustedOrigins = new Set<string>();
    if (resolvedOrigin) {
      trustedOrigins.add(resolvedOrigin);
    }
    if (configuredApiBase) {
      if (configuredApiBase.startsWith('http://') || configuredApiBase.startsWith('https://')) {
        trustedOrigins.add(new URL(configuredApiBase).origin);
      } else if (resolvedOrigin) {
        trustedOrigins.add(new URL(configuredApiBase, resolvedOrigin).origin);
      }
    }

    return trustedOrigins.has(parsedTarget.origin);
  } catch {
    return false;
  }
}

/**
 * Checks whether an endpoint corresponds to a silent polling path using
 * normalized pathname exact/prefix matching instead of loose substring matching.
 */
export function isSilentApiEndpoint(endpoint: string): boolean {
  if (!endpoint) return false;
  let pathname = endpoint.trim();
  if (!pathname) return false;

  if (pathname.startsWith('http://') || pathname.startsWith('https://') || pathname.startsWith('//')) {
    try {
      const base = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
      pathname = new URL(pathname, base).pathname;
    } catch {
      return false;
    }
  } else {
    const qIdx = pathname.indexOf('?');
    if (qIdx !== -1) pathname = pathname.slice(0, qIdx);
    const hIdx = pathname.indexOf('#');
    if (hIdx !== -1) pathname = pathname.slice(0, hIdx);
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  const normalizedPath = pathname.startsWith('/api/') ? pathname.slice(4) : pathname;

  return SILENT_ENDPOINTS.some((ep) => {
    const epNoTrailing = ep.endsWith('/') ? ep.slice(0, -1) : ep;
    return (
      normalizedPath === ep ||
      normalizedPath === epNoTrailing ||
      normalizedPath.startsWith(ep)
    );
  });
}

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const isExternalLike =
    endpoint.startsWith('http://') ||
    endpoint.startsWith('https://') ||
    endpoint.startsWith('//');
  const url = isExternalLike ? endpoint : `${API_BASE}${endpoint}`;
  const trustedOrigin = isTrustedApiOrigin(url);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(trustedOrigin ? { 'X-CSRFToken': getCookie('csrftoken') || '' } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Remove Content-Type if FormData is used (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];

    // Removed Vercel 4.5MB bypass.
    // Making direct Cross-Origin requests to Render prevents the browser from sending 
    // the Vercel-bound session cookies, resulting in a 401 Unauthorized auto-logout.
    // All requests must pass through the relative /api proxy to maintain the session.
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // Only send session cookies to trusted API origins; never leak cookies externally
    credentials: trustedOrigin ? 'include' : 'omit',
    cache: 'no-store', // Fix: Prevent browser from caching API responses (which causes stale UI on edits)
  });

  const isSilentEndpoint = trustedOrigin && isSilentApiEndpoint(endpoint);

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !isSilentEndpoint) {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMsg = errorData.detail;
      else if (errorData.error) errorMsg = errorData.error;
      else if (errorData.message) errorMsg = errorData.message;
      else if (typeof errorData === 'object' && errorData !== null) {
        // Handle DRF serializer errors like {"email": ["Email already in use"]}
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && Array.isArray(errorData[firstKey]) && errorData[firstKey].length > 0) {
          errorMsg = errorData[firstKey][0];
        } else {
          errorMsg = JSON.stringify(errorData);
        }
      } else {
        errorMsg = String(errorData);
      }
    } catch {
      errorMsg = response.statusText || `HTTP Error ${response.status}`;
    }
    const err = new Error(errorMsg) as Error & { status?: number; retryAfter?: number };
    err.status = response.status;
    const retryAfterHeader = response.headers?.get?.('Retry-After');
    if (retryAfterHeader) {
      const parsedRetry = Number(retryAfterHeader);
      if (Number.isFinite(parsedRetry) && parsedRetry > 0) {
        err.retryAfter = parsedRetry;
      }
    }
    throw err;
  }

  // Handle empty responses (like 204 No Content)
  let result = null;
  if (response.status !== 204) {
    result = await response.json();
  }

  // If this was a mutation (POST, PUT, PATCH, DELETE), instantly tell all components to refresh!
  // Exception: Do not refresh if status is 202 (Accepted), because it means the task is still processing in the background (Celery).
  // Triggering a refresh immediately would fetch stale data and ruin the optimistic UI.
  const method = (options.method || 'GET').toUpperCase();
  if (trustedOrigin && method !== 'GET' && typeof window !== 'undefined' && response.status !== 202) {
    window.dispatchEvent(new CustomEvent('cms_updated'));
  }

  return result;
};
