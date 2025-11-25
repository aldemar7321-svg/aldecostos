'use client';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getFirestore,
} from 'firebase/firestore';

import { initializeFirebase } from '.';

export function onUserChange(callback: (user: User | null) => void) {
  const { auth } = initializeFirebase();
  return onAuthStateChanged(auth, callback);
}

export async function initiateAnonymousSignIn() {
    const auth = getAuth();
    const firestore = getFirestore();
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { 
          uid: user.uid,
          isAnonymous: user.isAnonymous
        }, { merge: true });
      }
      return userCredential;
    } catch (e: any) {
      console.error("Anonymous sign-in failed", e);
      throw e;
    }
  }
