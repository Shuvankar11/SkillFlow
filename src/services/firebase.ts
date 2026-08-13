import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Web Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAQ4PeN9OZogKdoHDGCnnlAbtOBVFOgUAM",
  authDomain: "skillflow-8c77f.firebaseapp.com",
  projectId: "skillflow-8c77f",
  storageBucket: "skillflow-8c77f.firebasestorage.app",
  messagingSenderId: "452946413552",
  appId: "1:452946413552:web:edb917cb71d7bbdcfcff35"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
