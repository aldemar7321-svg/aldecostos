'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      // User created successfully, now create their user document in Firestore.
      const user = userCredential.user;
      const db = getFirestore(authInstance.app);
      const userRef = doc(db, 'users', user.uid);

      // Use the non-blocking function to create the document.
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
      }, { merge: true });
    })
    .catch((error) => {
      // The onAuthStateChanged listener will handle UI updates, but you can log errors here if needed.
      console.error("Error during sign-up:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
