'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

/**
 * Debug component to show authentication status
 * Only visible in development mode
 */
export default function AuthStatus() {
  const { user, firebaseUser, accessToken, isLoading } = useAuth();
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          setTokenExpiry(new Date(payload.exp * 1000));
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [accessToken]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const now = new Date();
  const isTokenExpired = tokenExpiry ? tokenExpiry < now : false;
  const minutesUntilExpiry = tokenExpiry
    ? Math.round((tokenExpiry.getTime() - now.getTime()) / 1000 / 60)
    : null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
      >
        🔐 Auth Status
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto">
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Loading:</span>{' '}
              <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>
                {isLoading ? '⏳ Yes' : '✅ No'}
              </span>
            </div>

            <div>
              <span className="font-semibold">User Signed In:</span>{' '}
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? '✅ Yes' : '❌ No'}
              </span>
            </div>

            {user && (
              <>
                <div>
                  <span className="font-semibold">Email:</span>{' '}
                  <span className="text-gray-700">{user.email}</span>
                </div>

                <div>
                  <span className="font-semibold">Role:</span>{' '}
                  <span className="text-gray-700">{user.role}</span>
                </div>

                <div>
                  <span className="font-semibold">User ID:</span>{' '}
                  <span className="text-gray-700 text-xs break-all">{user.id}</span>
                </div>
              </>
            )}

            <div>
              <span className="font-semibold">Firebase User:</span>{' '}
              <span className={firebaseUser ? 'text-green-600' : 'text-red-600'}>
                {firebaseUser ? '✅ Yes' : '❌ No'}
              </span>
            </div>

            <div>
              <span className="font-semibold">Access Token:</span>{' '}
              <span className={accessToken ? 'text-green-600' : 'text-red-600'}>
                {accessToken ? '✅ Present' : '❌ Missing'}
              </span>
            </div>

            {tokenExpiry && (
              <>
                <div>
                  <span className="font-semibold">Token Status:</span>{' '}
                  <span className={isTokenExpired ? 'text-red-600' : 'text-green-600'}>
                    {isTokenExpired ? '❌ EXPIRED' : '✅ Valid'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold">Expires In:</span>{' '}
                  <span className={minutesUntilExpiry && minutesUntilExpiry < 5 ? 'text-yellow-600' : 'text-gray-700'}>
                    {minutesUntilExpiry} minutes
                  </span>
                </div>

                <div>
                  <span className="font-semibold">Expiry Time:</span>{' '}
                  <span className="text-gray-700 text-xs">{tokenExpiry.toLocaleString()}</span>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={async () => {
                  try {
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      const freshToken = await currentUser.getIdToken(true);
                      console.log('Fresh token obtained:', freshToken.substring(0, 20) + '...');
                      alert('Token refreshed! Check console for details.');
                      window.location.reload();
                    } else {
                      alert('No user signed in');
                    }
                  } catch (error) {
                    console.error('Error refreshing token:', error);
                    alert('Error refreshing token. Check console.');
                  }
                }}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
