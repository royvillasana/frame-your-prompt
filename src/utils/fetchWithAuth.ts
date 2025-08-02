import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: BodyInit | object | null;
  retryCount?: number;
}

const MAX_RETRIES = 1; // Only retry once after token refresh

/**
 * A wrapper around fetch that automatically handles JWT token refresh
 * and retries failed requests with a new token if needed.
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {},
  isRetry = false
): Promise<Response> {
  const { retryCount = 0, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Add authorization header if we have a session
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  
  // Ensure we're sending JSON
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Stringify body if it's an object
  let body = fetchOptions.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body
    });
    
    // If unauthorized and we haven't retried yet, try to refresh the token
    if (response.status === 401 && !isRetry && retryCount < MAX_RETRIES) {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        // If refresh fails, sign out and redirect to login
        await supabase.auth.signOut();
        window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        throw new Error('Session expired. Please log in again.');
      }
      
      // Retry the request with the new token
      return fetchWithAuth(url, {
        ...fetchOptions,
        retryCount: retryCount + 1
      }, true);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error('API request failed:', error.message);
      toast.error('Network error. Please try again.');
    }
    throw error;
  }
}

/**
 * Helper function to make authenticated API calls with proper typing
 */
export async function apiRequest<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data?: T; error?: Error }> {
  try {
    const response = await fetchWithAuth(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'API request failed');
      (error as any).status = response.status;
      return { error };
    }
    
    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return { data: undefined };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error as Error };
  }
}
