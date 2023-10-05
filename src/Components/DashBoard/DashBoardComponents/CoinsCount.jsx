import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../../../Authentication/firebase';

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
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);

          if (userSnapshot.exists()) {
            const balance = userSnapshot.val().balance;
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
      const recipientQuery = await get(ref(database, `users/${recipientUid}`));

      if (recipientQuery.exists()) {
        const recipientData = recipientQuery.val();
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
      await set(ref(database, `users/${recipientUid}`), { balance: recipientBalance });

      // Update the user's balance by subtracting the transferred amount
      await set(ref(database, `users/${auth.currentUser.uid}`), { balance: updatedUserBalance });

      setUserBalance(updatedUserBalance);

      alert(`Coins transferred successfully!`);
    } catch (error) {
      console.error('Error transferring coins:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="lg:ml-40 mt-27 font-serif text-2xl">
      <h2 className="text-4xl">Coin Transfer</h2><br></br>
      <div>
        <label>Recipient ID: </label>
        <input type="text" className="border-2 border-amber-500" value={recipientUid} onChange={(e) => setRecipientUid(e.target.value)} />
      </div>
      <div><br></br>
        <label>Amount: </label>
        <input type="number" className="border-2 border-amber-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div><br></br>
      <div>
        <p>Balence left -{userBalance}</p>
      </div>
      <div>
        <button className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleTransfer}>Transfer Coins</button>
      </div><br></br><br></br>
    </div>
  );
};

export default CoinTransfer;
