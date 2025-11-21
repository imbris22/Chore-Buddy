// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8tdkf5P_EYjTPlag-0yPCSjObIw3gJpU",
  authDomain: "chore-buddy-1.firebaseapp.com",
  projectId: "chore-buddy-1",
  storageBucket: "chore-buddy-1.firebasestorage.app",
  messagingSenderId: "766939123156",
  appId: "1:766939123156:web:896670bcd0faefd736da41",
  measurementId: "G-Q0TGKPFY17"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };