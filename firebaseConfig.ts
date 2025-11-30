import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURATION REQUIRED
// ------------------------------------------------------------------
// To make the Admin Panel receive applications across different devices,
// you MUST replace the placeholder strings below with your actual 
// Firebase project keys.
//
// 1. Go to https://console.firebase.google.com/
// 2. Create a project (or use an existing one).
// 3. Go to Project Settings > General > Your apps > SDK setup and configuration.
// 4. Copy the "firebaseConfig" object properties into the fields below.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot };
