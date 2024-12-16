// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaB3gJocIGBS3GmzCbIWA6VOCgaAg_I8g",
  authDomain: "ddsystem-d103f.firebaseapp.com",
  databaseURL: "https://ddsystem-d103f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ddsystem-d103f",
  storageBucket: "ddsystem-d103f.firebasestorage.app",
  messagingSenderId: "747534420711",
  appId: "1:747534420711:web:49a1cde1dc46e2d0673042"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtDatabase = getDatabase(app);
const auth = getAuth(app);

export { db, rtDatabase, auth, signInWithEmailAndPassword };