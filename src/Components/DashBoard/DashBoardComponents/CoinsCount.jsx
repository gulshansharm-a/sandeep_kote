// BalanceDeduction.js

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const CoinCount = () => {

  const [adminBalance, setAdminBalance] = useState(null);
  const [agentBalance, setAgentBalance] = useState(null);
  const [distributorMainBalance, setDistributorMainBalance] = useState(null);

  // Initialize Firebase and database outside of the useEffect
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
    // Fetch initial balances
    fetchAdminBalance();
    fetchAgentBalance();
    fetchDistributorMainBalance();

    // Cleanup Firebase when component unmounts
    return () => {
      // Optionally, you might want to disconnect from Firebase here
    };
  }, []); // Empty dependency array to run this effect once on mount

  const fetchAdminBalance = async () => {
    try {
      const snapshot = await get(ref(database, 'Admin/admin/balance'));
      const balance = snapshot.val();
      setAdminBalance(balance);
    } catch (error) {
      console.error('Error fetching admin balance:', error.message);
    }
  };

  const fetchAgentBalance = async () => {
    try {
      const snapshot = await get(ref(database, 'Agent/agent001/balance'));
      const balance = snapshot.val();
      setAgentBalance(balance);
    } catch (error) {
      console.error('Error fetching agent balance:', error.message);
    }
  };

  const fetchDistributorMainBalance = async () => {
    try {
      const snapshot = await get(ref(database, 'Distributor/distributer main/balance'));
      const balance = snapshot.val();
      setDistributorMainBalance(balance);
    } catch (error) {
      console.error('Error fetching distributor main balance:', error.message);
    }
  };

  const deductBalance = async () => {
    try {
      // Fetch the current balances
      const adminSnapshot = await get(ref(database, 'Admin/admin/balance'));
      const distributorMainSnapshot = await get(ref(database, 'Distributor/distributer main/balance'));

      const currentAdminBalance = adminSnapshot.val();
      const currentDistributorMainBalance = distributorMainSnapshot.val();
      // Deduct 10 from Agent001's balance
      const updatedAdminBalance = currentAdminBalance - 10;
      const updatedDistributorMainBalance = currentDistributorMainBalance + 10;

      // Update the balance in the database
      await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);
      await set(ref(database, 'Distributor/distributer main/balance'), updatedDistributorMainBalance);
      // Fetch and display the updated balances
      fetchAdminBalance();
      fetchDistributorMainBalance();
    } catch (error) {
      console.error('Error deducting balance:', error.message);
    }
  };

  const sendToDistributorMain = async () => {
    try {
      // Fetch the current balances
      const agentSnapshot = await get(ref(database, 'Agent/agent001/balance'));
      const distributorMainSnapshot = await get(ref(database, 'Distributor/distributer main/balance'));

      const currentAgentBalance = agentSnapshot.val();
      const currentDistributorMainBalance = distributorMainSnapshot.val();

      // Deduct 10 from Agent001's balance
      const updatedAgentBalance = currentAgentBalance + 10;

      // Add 10 to DistributorMain's balance
      const updatedDistributorMainBalance = currentDistributorMainBalance - 10;

      // Update the balances in the database
      await set(ref(database, 'Agent/agent001/balance'), updatedAgentBalance);
      await set(ref(database, 'Distributor/distributer main/balance'), updatedDistributorMainBalance);

      // Fetch and display the updated balances
      fetchAgentBalance();
      fetchDistributorMainBalance();
    } catch (error) {
      console.error('Error sending to DistributorMain:', error.message);
    }
  };

  return (
    <div>
      <h2 className="lg:ml-40 mt-40 font-serif text-2xl">Balance Deduction</h2>
      <div>
        <p className="lg:ml-40 mt-27 font-serif text-2xl">Admin Balance: {adminBalance !== null ? adminBalance : 'Loading...'}</p>
        <p className="lg:ml-40 mt-27 font-serif text-2xl">Agent001 Balance: {agentBalance !== null ? agentBalance : 'Loading...'}</p>
        <p className="lg:ml-40 mt-27 font-serif text-2xl">DistributorMain Balance: {distributorMainBalance !== null ? distributorMainBalance : 'Loading...'}</p>
        <button className=" lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={deductBalance}>Transfer 10-Admin to Distributer</button><br></br>
        <button className=" lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={sendToDistributorMain}>Transfer 10-Distributor to Agent</button>
      </div>
    </div>
  );
};

export default CoinCount;
