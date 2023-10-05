// Auth.js
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../Authentication/firebase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', user);

      // Add user information to Firestore
      const usersCollection = collection(db, 'users');
      const userDocRef = doc(usersCollection, user.uid);

      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        balance: 1000, // Initial balance
      });

      console.log('User details added to Firestore');

      alert('Account created successfully!');
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Signed in successfully!');
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert('Signed out successfully!');
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="lg:ml-40 mt-20 text-teal-400">
      {/* <h2>Authentication</h2> */}
      <div>
        {user ? (
          <div>
            <p className="font-serif text-2xl">Your Mail id    -     {user.email}!</p>
            <p className="font-serif text-2xl">Your id    -     {user.uid}</p>
            {/* <button onClick={handleSignOut}>Sign Out</button> */}
            <br></br><br></br>
          </div>
        ) : (
          <div>
            <label>Email: </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Password: </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
       
            <button onClick={handleSignUp}>Sign Up</button>
            <button onClick={handleSignIn}>Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
