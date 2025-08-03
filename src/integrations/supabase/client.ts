import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { Database } from './types';

const SUPABASE_URL = "https://vvmhpditdxcwfcekugcw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bWhwZGl0ZHhjd2ZjZWt1Z2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODI1NjYsImV4cCI6MjA2OTA1ODU2Nn0.BwjrKaXS2XDEV4XkgW-8aNsEcUhg7Mp0cz7X46EKmm8";

// Create a custom storage handler that safely handles SSR
const storage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage,
    debug: false // Disable debug logs
  },
  global: {
    headers: {
      'X-Client-Info': 'frame-your-prompt/1.0.0'
    }
  }
});

// Add a response interceptor to handle 401 errors
const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log('Auth state changed:', event);
    
    switch (event) {
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed successfully');
        break;
        
      case 'SIGNED_OUT':
      case 'USER_DELETED':
        console.log('User signed out, redirecting to login...');
        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        }
        break;
        
      case 'USER_UPDATED':
        console.log('User updated');
        break;
        
      case 'PASSWORD_RECOVERY':
        console.log('Password recovery requested');
        break;
    }
    
    // Handle sign out
    if (event === 'SIGNED_OUT') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
  }
);

// Cleanup subscription on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    authListener?.unsubscribe();
  });
}

// Helper function to handle expired tokens
export const handleExpiredToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    
    if (!session) {
      console.log('No active session, redirecting to login');
      window.location.href = '/auth/login';
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    window.location.href = '/auth/login';
    return null;
  }
};