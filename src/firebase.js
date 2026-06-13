import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

export const isFirebaseConfigured = requiredConfigKeys.every(
  key => Boolean(firebaseConfig[key])
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

if (!isFirebaseConfigured) {
  console.warn('Firebase no está configurado. Define las variables VITE_FIREBASE_* para activar el guardado en Firestore.');
}

export const db = app ? getFirestore(app) : null;
export const firestoreCollectionName =
  import.meta.env.VITE_FIREBASE_COLLECTION_NAME?.trim() || 'promocion_registros';