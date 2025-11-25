'use client';
import { useMemo } from 'react';
import { onAuthStateChanged, type User, getAuth, signInAnonymously } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useFirebase, useUser, useAuth, useFirestore, useMemoFirebase, onUserChange } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

function initializeFirebase() {
  const firebase = useFirebase();
  if (!firebase) {
    throw new Error('Firebase not initialized');
  }
  return firebase;
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

export {
  useUser,
  useAuth,
  useFirestore,
  initializeFirebase,
  useMemoFirebase,
  onUserChange,
  useCollection,
  useDoc,
};
