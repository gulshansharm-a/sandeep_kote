// BalanceDeduction.js

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import currentRole from '../../Auth/Login'; // Assuming this import is correctly defined

const CoinCount = () => {
  console.log(currentRole);
  const [adminBalance, setAdminBalance] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [targetUserBalance, setTargetUserBalance] = useState(null);
  const [targetUserUid, setTargetUserUid] = useState(null);

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

  const firebaseApp = initializeApp(firebaseConfig);
  const database = getDatabase(firebaseApp);

  useEffect(() => {
    fetchAdminBalance();
    return () => {
      // Optionally, disconnect from Firebase here
    };
  }, []);

  const fetchAdminBalance = async () => {
    try {
      const snapshot = await get(ref(database, 'Admin/admin/balance'));
      const balance = snapshot.val();
      setAdminBalance(balance);
    } catch (error) {
      console.error('Error fetching admin balance:', error.message);
    }
  };

  const handleAmountChange = (e) => {
    setTransferAmount(e.target.value);
  };

  const handleEmailChange = (e) => {
    setTargetUserEmail(e.target.value);
  };

  const fetchTargetUserUid = async () => {
    try {
      const distributerSnapshot = await get(ref(database, 'Distributer'));
      const distributerData = distributerSnapshot.val();

      // Find the UID corresponding to the entered email
      let foundUid = null;
      for (const uid in distributerData) {
        if (distributerData[uid]?.email === targetUserEmail) {
          foundUid = uid;
          break;
        }
      }

      if (foundUid) {
        setTargetUserUid(foundUid);
        fetchTargetUserBalance(foundUid);
      } else {
        console.error('User not found with the entered email.');
      }
    } catch (error) {
      console.error('Error fetching target user UID:', error.message);
    }
  };

  const fetchTargetUserBalance = async (uid) => {
    try {
      const userSnapshot = await get(ref(database, `Distributer/${uid}/balance`));
      const userBalance = userSnapshot.val();
      setTargetUserBalance(userBalance);
    } catch (error) {
      console.error('Error fetching target user balance:', error.message);
    }
  };

  const deductBalance = async () => {
    try {
      // Validate if the transfer amount is a number
      const transferAmountNumber = parseFloat(transferAmount);
      if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
        console.error('Invalid transfer amount');
        return;
      }

      // Deduct the specified amount from Admin's balance
      const updatedAdminBalance = adminBalance - transferAmountNumber;

      // Update the balance in the Admin node
      await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);

      // Fetch and display the updated Admin balance
      fetchAdminBalance();

      // Deduct the specified amount from the target user's balance
      const updatedTargetUserBalance = targetUserBalance - transferAmountNumber;
      await set(ref(database, `Distributer/${targetUserUid}/balance`), updatedTargetUserBalance);

      // Fetch and display the target user balance
      fetchTargetUserBalance(targetUserUid);
    } catch (error) {
      console.error('Error deducting balance:', error.message);
    }
  };

  return (
    <div>
      <h2 className="lg:ml-40 mt-40 font-serif text-2xl">Balance Deduction</h2>
      <div>
        <p className="lg:ml-40 mt-27 font-serif text-2xl">Admin Balance: {adminBalance !== null ? adminBalance : 'Loading...'}</p>
        <input
          type="text"
          placeholder="Enter target user email"
          value={targetUserEmail}
          onChange={handleEmailChange}
          className="lg:ml-40 mt-27 px-2 py-1"
        />
        <p className="lg:ml-40 mt-27 font-serif text-2xl">Target User Balance: {targetUserBalance !== null ? targetUserBalance : 'Loading...'}</p>
        <input
          type="number"
          placeholder="Enter amount"
          value={transferAmount}
          onChange={handleAmountChange}
          className="lg:ml-40 mt-27 px-2 py-1"
        />
        <button
          className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={fetchTargetUserUid}
        >
          Fetch Target User UID
        </button>
        <button
          className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={deductBalance}
        >
          Transfer from Admin to Target Distributer
        </button>
        <br></br>
      </div>
    </div>
  );
};

export default CoinCount;
