import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app); 

export {app, auth, db, database, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, collection, doc, setDoc, getDoc, onSnapshot, updateDoc };

