

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBfebOWmMS-C5UwSOatnF6KeWO-naQGAug",
    authDomain: "zzqwesa.firebaseapp.com",
    projectId: "zzqwesa",
    storageBucket: "zzqwesa.appspot.com",
    messagingSenderId: "83977301588",
    appId: "1:83977301588:web:25d6fe7a66009ce91a47c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getFirestore(app);

export { auth, db, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, collection, doc, setDoc, getDoc, onSnapshot, updateDoc };

