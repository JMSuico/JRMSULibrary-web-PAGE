// Use relative API base url so Vite proxy (in dev) and Nginx (in prod) handles routing.
// This ensures SameSite cookies work correctly across identical origins.
const getApiBase = () => {
  let base = import.meta.env.VITE_API_BASE_URL;
  if (!base) {
    base = import.meta.env.DEV ? '/api' : 'https://jrmsulibrary-web-page.onrender.com/api';
  } else {
    // If the user forgot to add /api to the environment variable, add it automatically
    if (!base.endsWith('/api') && !base.endsWith('/api/')) {
      base = base.endsWith('/') ? `${base}api` : `${base}/api`;
    }
  }
  return base;
};

const API_BASE = getApiBase();

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath;
  
  // Use relative path for media so Vite proxy/Nginx handles it automatically.
  return imagePath;
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

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken') || '',
    ...(options.headers || {}),
  };

  // Remove Content-Type if FormData is used (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure session cookies are sent for authentication
    cache: 'no-store', // Fix: Prevent browser from caching API responses (which causes stale UI on edits)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
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
    throw new Error(errorMsg);
  }

  // Handle empty responses (like 204 No Content)
  let result = null;
  if (response.status !== 204) {
    result = await response.json();
  }

  // If this was a mutation (POST, PUT, PATCH, DELETE), instantly tell all components to refresh!
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cms_updated'));
  }

  return result;
};
