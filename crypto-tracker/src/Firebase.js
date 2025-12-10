// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUP1b8NbhNy6aUirebkauIF0oXi7Z_Sns",
  authDomain: "cryptotracker-13854.firebaseapp.com",
  projectId: "cryptotracker-13854",
  storageBucket: "cryptotracker-13854.firebasestorage.app",
  messagingSenderId: "827891018314",
  appId: "1:827891018314:web:3160dbf3ad1e17449ed4b3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
