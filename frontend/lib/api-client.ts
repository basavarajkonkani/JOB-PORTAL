/**
 * API Client utility for making authenticated requests to the backend
 * Automatically handles Firebase ID token refresh
 */

import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get a fresh Firebase ID token
 */
async function getFreshToken(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('No authenticated user found. User must sign in first.');
      return null;
    }
    // Force token refresh to ensure it's not expired
    const token = await currentUser.getIdToken(true);
    console.log('Fresh token obtained successfully');
    return token;
  } catch (error) {
    console.error('Error getting fresh token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request with automatic token refresh
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getFreshToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Add existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Request failed',
    }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Make an authenticated API request with FormData (for file uploads)
 */
export async function apiRequestFormData<T = any>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const token = await getFreshToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in to continue.');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  // Add existing headers (excluding Content-Type for FormData)
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = value;
      }
    });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    method: options.method || 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Request failed',
    }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export { API_URL };
