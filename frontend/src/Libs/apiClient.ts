// Use relative API base url so Vite proxy (in dev) and Nginx (in prod) handles routing.
// This ensures SameSite cookies work correctly across identical origins.
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // Note: If you need to hit an external IP directly without a proxy,
    // you would configure it here. But with Vite proxy and Nginx, relative is best.
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api';
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
      errorMsg = errorData.detail || errorData.error || errorData.message || JSON.stringify(errorData);
    } catch {
      errorMsg = response.statusText || `HTTP Error ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
