import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getDatabase } from 'firebase/database'; 

const firebaseConfig = {
  apiKey: "AIzaSyA-lRLBHee1IISE8t5pJywkP-YrHPKIvk4",
  authDomain: "sandeepkote-c67f5.firebaseapp.com",
  databaseURL: "https://sandeepkote-c67f5-default-rtdb.firebaseio.com",
  projectId: "sandeepkote-c67f5",
  storageBucket: "sandeepkote-c67f5.appspot.com",
  messagingSenderId: "871561614523",
  appId: "1:871561614523:web:3b12ae93e7490723ddc59e",
  measurementId: "G-645LW1SWKT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const  auth = getAuth(app);
export const db = getFirestore(app); 
export const database = getDatabase(app); 