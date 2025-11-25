'use client';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../client-provider';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

interface UseDocState<T> {
  data: T | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

export function useDoc<T>(
  ref: DocumentReference<DocumentData> | null
): UseDocState<T> {
  const { isReady: isFirebaseReady } = useFirebase();
  const memoizedRef = useMemo(() => ref, [ref]);
  const refRef = useRef(memoizedRef);
  refRef.current = memoizedRef;

  const [state, setState] = useReducer(
    (state: UseDocState<T>, newState: Partial<UseDocState<T>>) => ({
      ...state,
      ...newState,
    }),
    {
      data: null,
      isLoading: true,
      error: null,
    }
  );

  useEffect(() => {
    if (!isFirebaseReady || !ref) {
      setState({ isLoading: false });
      return;
    }

    setState({ isLoading: true });

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        const data = snapshot.exists()
          ? ({ ...snapshot.data(), id: snapshot.id } as T)
          : null;
        setState({ data, isLoading: false, error: null });
      },
      (error: FirestoreError) => {
        setState({ error, isLoading: false });
        const path = (ref as any).path;
        const permissionError = new FirestorePermissionError({
          operation: 'get',
          path,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [isFirebaseReady, memoizedRef]);

  return state;
}
