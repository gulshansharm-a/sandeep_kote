// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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