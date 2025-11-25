import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
// TODO: Replace the values below with your specific Firebase Project configuration.
// You can find these in the Firebase Console under Project Settings -> General.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);