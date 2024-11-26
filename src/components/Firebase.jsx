// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyBy_KaUEmqD2m4uz-CjfBMDN4Tos8xfc",
  authDomain: "groceryproductsystem.firebaseapp.com",
  databaseURL: "https://groceryproductsystem-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "groceryproductsystem",
  storageBucket: "groceryproductsystem.firebasestorage.app",
  messagingSenderId: "31533502396",
  appId: "1:31533502396:web:b82090808390c0f3a1a5b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtDatabase = getDatabase(app);
const auth = getAuth(app);

export { db, rtDatabase, auth, signInWithEmailAndPassword };