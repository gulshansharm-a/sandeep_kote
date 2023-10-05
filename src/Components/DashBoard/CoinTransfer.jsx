// CoinTransfer.js

import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../Authentication/firebase';
import { Button } from "@material-tailwind/react";
// import Button from 'react/components/Button';
const CoinTransfer = () => {
  const [recipientUid, setRecipientUid] = useState('');
  const [amount, setAmount] = useState('');
  const [userBalance, setUserBalance] = useState(null);
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userDoc);

          if (userDocSnapshot.exists()) {
            const balance = userDocSnapshot.data().balance;
            setUserBalance(balance);
          } else {
            console.warn('User document not found');
          }
        } else {
          console.error('User not authenticated');
        }
      } catch (error) {
        console.error('Error fetching user balance:', error.message);
      }
    };

    fetchUserBalance();
  }, []);

  const fetchRecipientDetails = async () => {
    try {
      const recipientQuery = await getDoc(doc(db, 'users', recipientUid));

      if (recipientQuery.exists()) {
        const recipientData = recipientQuery.data();
        setRecipient(recipientData);
      } else {
        console.warn('Recipient document not found for UID:', recipientUid);
      }
    } catch (error) {
      console.error('Error fetching recipient details:', error.message);
    }
  };

  useEffect(() => {
    if (recipientUid) {
      fetchRecipientDetails();
    }
  }, [recipientUid]);

  const handleTransfer = async () => {
    try {
      if (userBalance === null) {
        console.error('User balance not available');
        return;
      }

      const transferAmount = Number(amount);

      if (isNaN(transferAmount) || transferAmount <= 0) {
        console.error('Invalid transfer amount');
        return;
      }

      if (transferAmount > userBalance) {
        console.error('Insufficient balance');
        return;
      }

      if (!recipient) {
        console.error('Recipient details not available');
        // Fetch recipient details before proceeding
        await fetchRecipientDetails();

        // Check again if recipient details are now available
        if (!recipient) {
          console.error('Recipient details not available');
          return;
        }
      }

      const recipientBalance = recipient.balance + transferAmount;
      const updatedUserBalance = userBalance - transferAmount;

      // Update the recipient's balance by adding the transferred amount
      await updateDoc(doc(db, 'users', recipientUid), { balance: recipientBalance });

      // Update the user's balance by subtracting the transferred amount
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { balance: updatedUserBalance });

      setUserBalance(updatedUserBalance);

      alert(`Coins transferred successfully!`);
    } catch (error) {
      console.error('Error transferring coins:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div >
      <h2 className="lg:ml-96 mt-27">Coin Transfer</h2>
      <div>
        <label>Recipient UID: </label>
        <input type="text" value={recipientUid} onChange={(e) => setRecipientUid(e.target.value)} />
      </div>
      <div>
        <label>Amount: </label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      {/* {auth.currentUser ? ( */}
        <div>
          {/* <p>Your Balance: {userBalance !== null ? userBalance : 'Loading...'}</p> */}
          <p>Balence left -{userBalance}</p>
        </div>
      {/* // ) : null} */}
      <div >
        <button  className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleTransfer}>Transfer Coins</button>
      </div>
    </div>
  );
};

export default CoinTransfer;
