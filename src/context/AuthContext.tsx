import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Authorized Committee Admin Credentials (Configurable via Environment Variables)
const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const adminPhone = (import.meta.env.VITE_ADMIN_PHONE || '9999999999').trim();
const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@12345';
const adminPin = import.meta.env.VITE_ADMIN_PIN || '1234';

export const AUTHORIZED_ADMIN_EMAILS = [
  adminEmail,
];

export const AUTHORIZED_ADMIN_PHONES = [
  adminPhone,
];

export const MASTER_ADMIN_CREDENTIALS = {
  email: adminEmail,
  phone: adminPhone,
  pass: adminPass,
  pin: adminPin,
};

export interface AdminUserShim {
  email: string | null;
  displayName?: string | null;
  uid: string;
}

interface AuthContextType {
  currentUser: User | AdminUserShim | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthorized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | AdminUserShim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this device has previously authenticated (Permanent Remember Device)
    const isDeviceAuthenticated =
      localStorage.getItem('cym_device_authenticated') === 'true' ||
      sessionStorage.getItem('cym_admin_session') === 'true';

    if (isDeviceAuthenticated) {
      setCurrentUser({
        email: MASTER_ADMIN_CREDENTIALS.email,
        displayName: 'CYM Committee Admin',
        uid: auth.currentUser?.uid || 'cym_master_admin_session',
      });
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const email = user.email.toLowerCase();
        if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
          signOut(auth);
          setCurrentUser(null);
          localStorage.removeItem('cym_device_authenticated');
          sessionStorage.removeItem('cym_admin_session');
          setLoading(false);
          return;
        }
        setCurrentUser(user);
        localStorage.setItem('cym_device_authenticated', 'true');
        sessionStorage.setItem('cym_admin_session', 'true');
      } else if (!isDeviceAuthenticated) {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const rawInput = identifier.trim();
    const cleanDigits = rawInput.replace(/\D/g, '');

    // Map phone number to primary admin email
    let normalizedEmail = rawInput.toLowerCase();
    if (cleanDigits === MASTER_ADMIN_CREDENTIALS.phone || rawInput === MASTER_ADMIN_CREDENTIALS.phone) {
      normalizedEmail = MASTER_ADMIN_CREDENTIALS.email;
    }

    if (!AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      throw new Error(
        'Access Denied: Please enter authorized email or registered phone.'
      );
    }

    // 1. Verify Master Admin Credentials
    const isMasterMatch =
      (normalizedEmail === MASTER_ADMIN_CREDENTIALS.email || cleanDigits === MASTER_ADMIN_CREDENTIALS.phone) &&
      pass === MASTER_ADMIN_CREDENTIALS.pass;

    if (isMasterMatch) {
      // Attempt Firebase Auth sign-in to sync server token if enabled
      try {
        await signInWithEmailAndPassword(auth, MASTER_ADMIN_CREDENTIALS.email, pass);
      } catch (fbErr: unknown) {
        console.warn('Direct Firebase Auth sign-in bypassed with verified master credentials:', fbErr);
        try {
          await signInAnonymously(auth);
        } catch {
          // If anonymous provider is disabled, proceed with verified session
        }
      }

      // Establish verified persistent admin device session
      const adminShim: AdminUserShim = {
        email: MASTER_ADMIN_CREDENTIALS.email,
        displayName: 'CYM Committee Admin',
        uid: auth.currentUser?.uid || 'cym_master_admin_session',
      };
      setCurrentUser(adminShim);
      localStorage.setItem('cym_device_authenticated', 'true');
      localStorage.setItem('cym_admin_email', MASTER_ADMIN_CREDENTIALS.email);
      sessionStorage.setItem('cym_admin_session', 'true');
      sessionStorage.setItem('cym_last_active', String(Date.now()));
      return;
    }

    // 2. Standard Firebase Email/Password Sign-in
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      localStorage.setItem('cym_device_authenticated', 'true');
      localStorage.setItem('cym_admin_email', normalizedEmail);
      sessionStorage.setItem('cym_admin_session', 'true');
      sessionStorage.setItem('cym_last_active', String(Date.now()));
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      console.warn('Firebase signIn notice:', authErr.code);

      // If user is authorized but not yet created in Firebase Auth, automatically bootstrap/register it
      if (
        authErr.code === 'auth/user-not-found' ||
        authErr.code === 'auth/invalid-credential'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
          localStorage.setItem('cym_device_authenticated', 'true');
          localStorage.setItem('cym_admin_email', normalizedEmail);
          sessionStorage.setItem('cym_admin_session', 'true');
          sessionStorage.setItem('cym_last_active', String(Date.now()));
          return;
        } catch (createErr: unknown) {
          const cErr = createErr as { code?: string; message?: string };
          console.warn('Firebase createUser notice:', cErr.code);

          if (cErr.code === 'auth/operation-not-allowed') {
            throw new Error(
              'Sign-in with authorized credentials or Continue with Google.'
            );
          }
          if (cErr.code === 'auth/email-already-in-use') {
            throw new Error(
              'Incorrect password. Please verify credentials or Continue with Google.'
            );
          }
          throw createErr;
        }
      }
      throw err;
    }
  };

  const signup = async (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      throw new Error(
        'Access Denied: Only authorized committee accounts can register.'
      );
    }
    await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const userEmail = result.user?.email?.toLowerCase();

    // Strictly enforce Google Login only for the authorized admin email
    if (userEmail !== MASTER_ADMIN_CREDENTIALS.email) {
      await signOut(auth);
      localStorage.removeItem('cym_device_authenticated');
      sessionStorage.removeItem('cym_admin_session');
      throw new Error(
        'Access Denied: This Google account is not authorized for Admin access.'
      );
    }

    localStorage.setItem('cym_device_authenticated', 'true');
    localStorage.setItem('cym_admin_email', MASTER_ADMIN_CREDENTIALS.email);
    sessionStorage.setItem('cym_admin_session', 'true');
    sessionStorage.setItem('cym_last_active', String(Date.now()));
  };

  const logout = async () => {
    localStorage.removeItem('cym_device_authenticated');
    localStorage.removeItem('cym_admin_email');
    localStorage.removeItem('cym_pin_locked');
    sessionStorage.clear();
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut notice:', e);
    }
  };

  const isAuthorized = !!(
    currentUser?.email &&
    AUTHORIZED_ADMIN_EMAILS.includes(currentUser.email.toLowerCase())
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, login, signup, loginWithGoogle, logout, isAuthorized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
