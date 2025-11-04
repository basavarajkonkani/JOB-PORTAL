'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { usePresence } from './usePresence';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: 'candidate' | 'recruiter'
  ) => Promise<void>;
  signInWithGoogle: (role?: 'candidate' | 'recruiter') => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track user presence when authenticated
  usePresence(user?.id || null, !!user);

  // Handle auth state changes with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setFirebaseUser(firebaseUser);

          // Get ID token
          const token = await firebaseUser.getIdToken();
          setAccessToken(token);

          // Get user data from Firestore
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userInfo: User = {
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'candidate',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
            setUser(userInfo);
          } else {
            // User document doesn't exist in Firestore, create it
            const userInfo: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'candidate',
              createdAt: new Date().toISOString(),
            };
            setUser(userInfo);
          }
        } else {
          // User is signed out
          setFirebaseUser(null);
          setUser(null);
          setAccessToken(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setFirebaseUser(null);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get ID token
      const token = await firebaseUser.getIdToken();
      setAccessToken(token);

      // Get user data from Firestore
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userInfo: User = {
          id: firebaseUser.uid,
          email: userData.email || firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          role: userData.role || 'candidate',
          avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        setUser(userInfo);
        setFirebaseUser(firebaseUser);
      } else {
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);

      // Handle Firebase-specific errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('Account has been disabled');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      }

      throw new Error(error.message || 'Sign in failed');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'candidate' | 'recruiter'
  ) => {
    try {
      // First, create user via backend API to set up Firestore document and custom claims
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      // Now sign in with Firebase to get the user session
      await signIn(email, password);

      // Force token refresh to get custom claims
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);

      // Handle Firebase-specific errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already registered');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }

      throw new Error(error.message || 'Sign up failed');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed');
    }
  };

  const signInWithGoogle = async (role: 'candidate' | 'recruiter' = 'candidate') => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Get ID token
      const token = await firebaseUser.getIdToken();
      setAccessToken(token);

      // Check if user exists in Firestore
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user - create profile directly in Firestore
        const userData = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          role: role,
          avatarUrl: firebaseUser.photoURL || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userDocRef, userData);

        // Set custom claims via backend
        try {
          await fetch(`${API_URL}/api/auth/google-signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              avatarUrl: firebaseUser.photoURL,
              role,
            }),
          });
        } catch (backendError) {
          console.warn(
            'Backend profile creation failed, but user exists in Firestore:',
            backendError
          );
        }
      }

      // Get user data from Firestore
      const updatedUserDoc = await getDoc(userDocRef);
      if (updatedUserDoc.exists()) {
        const userData = updatedUserDoc.data();
        const userInfo: User = {
          id: firebaseUser.uid,
          email: userData.email || firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          role: userData.role || role,
          avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        setUser(userInfo);
        setFirebaseUser(firebaseUser);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site');
      }

      throw new Error(error.message || 'Google sign in failed');
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    try {
      if (firebaseUser) {
        // Get fresh token (will refresh if expired)
        const token = await firebaseUser.getIdToken(true);
        setAccessToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        accessToken,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
