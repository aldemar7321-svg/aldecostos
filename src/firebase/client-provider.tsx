'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

interface FirebaseClientContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
  isReady: boolean;
  isUserReady: boolean;
}

const FirebaseClientContext = createContext<FirebaseClientContextType | null>(
  null
);

function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error de Permisos',
        description:
          error.message ||
          'No tienes permisos para realizar esta acción. Revisa las reglas de seguridad de Firestore.',
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<Omit<FirebaseClientContextType, 'user' | 'isUserReady'> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserReady, setIsUserReady] = useState(false);

  const initialize = useCallback(() => {
    if (firebase) {
      return;
    }

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    setFirebase({
      app,
      auth,
      firestore,
      isReady: true,
    });
  }, [firebase]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!firebase?.auth) return;

    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      setUser(user);
      setIsUserReady(true);
    });

    return () => unsubscribe();
  }, [firebase]);

  const contextValue: FirebaseClientContextType = {
    ...firebase,
    app: firebase?.app || null,
    auth: firebase?.auth || null,
    firestore: firebase?.firestore || null,
    user,
    isReady: !!firebase?.isReady,
    isUserReady,
  };

  return (
    <FirebaseClientContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {contextValue.isReady ? children : <div>Cargando Firebase...</div>}
    </FirebaseClientContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseClientContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseClientProvider');
  }
  return context;
}

export const useUser = () => {
  const context = useFirebase();
  return { data: context.user, isLoading: !context.isUserReady };
};

export const useAuth = () => {
  const context = useFirebase();
  if (!context.auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return context.auth;
};

export const useFirestore = () => {
  const context = useFirebase();
  if (!context.firestore) {
    throw new Error('Firebase Firestore not initialized');
  }
  return context.firestore;
};

export function useMemoFirebase<T>(
  factory: () => T,
  deps: React.DependencyList
) {
  const { isReady } = useFirebase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [...deps, isReady]);
}

export function onUserChange(callback: (user: User | null) => void) {
    const context = useFirebase();
    if (!context.auth) {
        throw new Error('onUserChange cannot be used before Auth is initialized');
    }
    return onAuthStateChanged(context.auth, callback);
}