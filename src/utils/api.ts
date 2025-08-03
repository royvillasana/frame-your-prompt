import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Track if we're currently refreshing the token
let isRefreshing = false;
let refreshPromise: Promise<{ session: any; error: any } | null> | null = null;

/**
 * Refreshes the session if needed
 */
async function refreshSessionIfNeeded() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = supabase.auth.refreshSession().then(({ data, error }) => {
    isRefreshing = false;
    refreshPromise = null;
    return { session: data?.session, error };
  });

  return refreshPromise;
}

/**
 * Makes an authenticated API request with automatic token refresh
 * @param url The API endpoint URL
 * @param options Fetch options
 * @param isRetry Internal flag to prevent infinite retry loops
 */
export const fetchWithAuth = async <T>(
  url: string, 
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> => {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // If no session and this isn't a retry, try to refresh the session
    if ((sessionError || !session) && !isRetry) {
      console.log('No active session, attempting to refresh...');
      const { session: newSession, error: refreshError } = await refreshSessionIfNeeded() || {};
      
      if (refreshError || !newSession) {
        console.error('Session refresh failed:', refreshError);
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        }
        return { data: null, error: new Error('Session expired. Please log in again.') };
      }
      
      // Retry the request with the new session
      return fetchWithAuth<T>(url, options, true);
    } else if (sessionError || !session) {
      // If we've already tried to refresh or this is a retry, fail
      console.error('No active session after refresh:', sessionError);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return { data: null, error: new Error('Not authenticated') };
    }
    
    // Add authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
    headers.set('Content-Type', 'application/json');
    
    // Make sure we're using the correct URL format
    const baseUrl = SUPABASE_URL;
    const apiUrl = url.startsWith('http') ? url : `${baseUrl}/rest/v1${url.startsWith('/') ? '' : '/'}${url}`;
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      // Remove credentials to avoid CORS issues
      credentials: 'same-origin',
    };

    // Ensure body is properly stringified for non-GET requests
    if (options.body && typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    // Make the request
    const response = await fetch(apiUrl, fetchOptions);
    
    // Handle 401 Unauthorized responses
    if (response.status === 401 && !isRetry) {
      console.log('Received 401, attempting to refresh token...');
      const { session: newSession, error: refreshError } = await refreshSessionIfNeeded() || {};
      
      if (refreshError || !newSession) {
        console.error('Token refresh failed:', refreshError);
        await supabase.auth.signOut();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        }
        return { data: null, error: new Error('Session expired. Please log in again.') };
      }
      
      // Update the authorization header with the new token
      headers.set('Authorization', `Bearer ${newSession.access_token}`);
      
      // Retry the request with the new token
      const retryResponse = await fetch(apiUrl, {
        ...fetchOptions,
        headers,
      });
      
      return handleResponse<T>(retryResponse);
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    console.error('API request failed:', error);
    toast.error('Network error. Please check your connection and try again.');
    return { data: null, error: error as Error };
  }
};

/**
 * Handles the API response and parses the JSON if needed
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.status === 205) {
    return { data: null as unknown as T, error: null };
  }

  // First, check the content type
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  
  try {
    const text = await response.text();
    
    // If the response is not JSON, handle it appropriately
    if (!isJson) {
      console.warn('Non-JSON response received:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        contentType,
        body: text.slice(0, 1000) // Log first 1000 chars to avoid huge logs
      });
      
      // If we got HTML, it's likely a redirect to a login page or error page
      if (contentType.includes('text/html')) {
        // Handle Supabase auth redirects
        if (response.url.includes('/auth/')) {
          window.location.href = response.url;
          return { 
            data: null, 
            error: new Error('Authentication required - redirecting to login') 
          };
        }
        
        // Handle other HTML responses (like 404 pages)
        throw new Error(`Unexpected HTML response (${response.status} ${response.statusText})`);
      }
      
      // For other non-JSON responses, try to parse as JSON anyway (some APIs don't set content-type correctly)
      try {
        const jsonData = JSON.parse(text);
        return { data: jsonData as T, error: null };
      } catch (parseError) {
        throw new Error(`Expected JSON but received ${contentType}`);
      }
    }
    
    // If we get here, we have JSON content type
    const data = JSON.parse(text);
    
    if (!response.ok) {
      const errorMessage = data?.message || 
                         data?.error_description || 
                         `API request failed with status ${response.status}`;
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).code = data?.code || 'api_error';
      (error as any).details = data;
      
      // Handle specific error codes
      if (response.status === 401) {
        // Clear any invalid session
        await supabase.auth.signOut();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error handling response:', {
      error: error.message,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      contentType,
      stack: error.stack
    });
    
    // If we have an unauthorized error, redirect to login
    if (response.status === 401) {
      await supabase.auth.signOut();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return { 
      data: null, 
      error: new Error(`Failed to process response: ${error.message}`) 
    };
  }
}

/**
 * Helper function for making GET requests
 */
export const get = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * Helper function for making POST requests
 */
export const post = async <T>(
  url: string, 
  body?: any, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Helper function for making PUT requests
 */
export const put = async <T>(
  url: string, 
  body?: any, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Helper function for making DELETE requests
 */
export const del = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'DELETE',
  });
};


