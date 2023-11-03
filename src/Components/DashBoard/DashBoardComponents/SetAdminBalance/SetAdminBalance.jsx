import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const AdminBalanceSetting = () => {
  const [adminBalance, setAdminBalance] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  const firebaseConfig = {
    apiKey: 'AIzaSyA-lRLBHee1IISE8t5pJywkP-YrHPKIvk4',
    authDomain: 'sandeepkote-c67f5.firebaseapp.com',
    databaseURL: 'https://sandeepkote-c67f5-default-rtdb.firebaseio.com',
    projectId: 'sandeepkote-c67f5',
    storageBucket: 'sandeepkote-c67f5.appspot.com',
    messagingSenderId: '871561614523',
    appId: '1:871561614523:web:3b12ae93e7490723ddc59e',
    measurementId: 'G-645LW1SWKT',
  };

  const firebaseApp = initializeApp(firebaseConfig);
  const database = getDatabase(firebaseApp);
  const auth = getAuth();

  const fetchAdminBalance = async () => {
    try {
      const adminSnapshot = await get(ref(database, 'Admin'));
      const uids = Object.keys(adminSnapshot.val());
      const firstUid = uids[0];
      const balanceSnapshot = await get(ref(database, `Admin/${firstUid}/balance`));
      const balance = balanceSnapshot.val();
      setAdminBalance(balance);
    } catch (error) {
      console.error('Error fetching admin balance:', error.message);
    }
  };

  useEffect(() => {
    fetchAdminBalance();
  }, []);

  const handleSetBalance = async () => {
    try {
      const adminSnapshot = await get(ref(database, 'Admin'));
      const uids = Object.keys(adminSnapshot.val());
      const firstUid = uids[0];
      await set(ref(database, `Admin/${firstUid}/balance`), parseFloat(newBalance));
      setAdminBalance(parseFloat(newBalance));
      setNewBalance('');
      alert('Admin balance updated successfully.');
    } catch (error) {
      console.error('Error setting admin balance:', error.message);
      alert('Error setting admin balance. Please try again.');
    }
  };

  return (
    <div className="lg:ml-40 mt-40 font-serif text-2xl">
      <h1>Admin Balance Setting</h1>
      <p>Current Admin Balance: {adminBalance}</p>
      <label>
        New Balance:
        <input
          type="number"
          placeholder="Enter amount"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          className="lg:ml-40 mt-27 px-2 py-1"
        />
      </label>
      <button className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSetBalance}>Set Balance</button>
    </div>
  );
};

export default AdminBalanceSetting;
