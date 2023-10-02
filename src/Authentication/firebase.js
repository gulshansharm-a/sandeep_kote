import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from 'firebase/firestore'; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDRNf_YlzJhIos4NRMnJ2AGMIkugJ0kV_M",
  authDomain: "coin-94280.firebaseapp.com",
  projectId: "coin-94280",
  storageBucket: "coin-94280.appspot.com",
  messagingSenderId: "726875973513",
  appId: "1:726875973513:web:0a4872c3220a4e7da2e358",
  measurementId: "G-ZBTVKV0CVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 