'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { useFirebase } from './client-provider';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

interface FirebaseContextType {
  user: User | null;
  auth: Auth;
  firestore: Firestore;
  isUserReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

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

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isUserReady, setIsUserReady] = useState(false);

  useEffect(() => {
    if (!firebase) return;

    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      setUser(user);
      setIsUserReady(true);
    });

    return () => unsubscribe();
  }, [firebase]);

  if (!firebase?.isReady) {
    return <div>Cargando Firebase...</div>;
  }

  const contextValue = {
    user,
    auth: firebase.auth,
    firestore: firebase.firestore,
    isUserReady,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return { data: context.user, isLoading: !context.isUserReady };
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};

export function useMemoFirebase<T>(
  factory: () => T,
  deps: React.DependencyList
) {
  const { isReady } = useFirebase() ?? {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [...deps, isReady]);
}

export function onUserChange(callback: (user: User | null) => void) {
    const context = useContext(FirebaseContext);
    if (!context) {
      throw new Error('onUserChange must be used within a FirebaseProvider');
    }
    return onAuthStateChanged(context.auth, callback);
  }