
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance)
    .then((userCredential) => {
      // User created successfully, now create their user document in Firestore.
      const user = userCredential.user;
      const db = getFirestore(authInstance.app);
      const userRef = doc(db, 'users', user.uid);

      setDoc(userRef, {
        id: user.uid,
        email: user.email, // This will be null for anonymous users
      });
    })
    .catch((error) => {
      // The onAuthStateChanged listener will handle UI updates, but you can log errors here if needed.
      console.error("Error during anonymous sign-in:", error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      // User created successfully, now create their user document in Firestore.
      const user = userCredential.user;
      const db = getFirestore(authInstance.app);
      const userRef = doc(db, 'users', user.uid);

      setDoc(userRef, {
        id: user.uid,
        email: user.email,
      });
    })
    .catch((error) => {
      // The onAuthStateChanged listener will handle UI updates, but you can log errors here if needed.
      console.error("Error during sign-up:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
