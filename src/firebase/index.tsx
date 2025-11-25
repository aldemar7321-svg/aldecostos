'use client';
import { useMemo } from 'react';
import { onAuthStateChanged, type User, getAuth, signInAnonymously } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useFirebase, useUser, useAuth, useFirestore, useMemoFirebase, onUserChange } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';


function initializeFirebase() {
  const firebase = useFirebase();
  if (!firebase) {
    throw new Error('Firebase not initialized');
  }
  return firebase;
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
