'use client';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  FirestoreError,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../client-provider';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

interface UseCollectionState<T> {
  data: T[] | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T>(
  query: Query<DocumentData> | null
): UseCollectionState<T> {
  const { isReady: isFirebaseReady } = useFirebase();
  const memoizedQuery = useMemo(() => query, [query]);
  const queryRef = useRef(memoizedQuery);
  queryRef.current = memoizedQuery;

  const [state, setState] = useReducer(
    (
      state: UseCollectionState<T>,
      newState: Partial<UseCollectionState<T>>
    ) => ({
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
    if (!isFirebaseReady || !query) {
      setState({ isLoading: false });
      return;
    }

    setState({ isLoading: true });

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setState({ data, isLoading: false, error: null });
      },
      (error: FirestoreError) => {
        setState({ error, isLoading: false });
        const path = (query as any)._query.path.canonicalString();
        const permissionError = new FirestorePermissionError({
          operation: 'list',
          path,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [isFirebaseReady, memoizedQuery]);

  return state;
}
