import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { auth } from '../../Authentication/firebase';
import TransactionHistory from '../DashBoard/DashBoardComponents/TransactionHIstory';

const CoinTransfer = () => {
  const [adminBalance, setAdminBalance] = useState(null);
  const [distributorBalance, setDistributorBalance] = useState(null);
  const [agentBalance, setAgentBalance] = useState(null);
  const [playerBalance, setPlayerBalance] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [recipientBalance, setRecipientBalance] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(database));
          const data = snapshot.val();

          for (const role in data) {
            if (data[role][user.uid]) {
              console.log('User Role:', role);
              setUserRole(role);
              setCurrentUserId(user.uid);
              break;
            }
          }
        } catch (error) {
          console.error('Error fetching data from Firebase:', error.message);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    
    if (userRole === 'Admin') {
      fetchAdminBalance();
    } else if (userRole === 'Distributor') {
      fetchDistributorBalance();
    } else if (userRole === 'Agent') {
      fetchAgentBalance();
    } else if (userRole === 'Player') {
      fetchPlayerBalance();
    }
  }, [userRole]);

  const fetchAdminBalance = async () => {
    try {
      const adminSnapshot = await get(ref(database, 'Admin'));
      const uids = Object.keys(adminSnapshot.val()); // Get an array of UIDs
      const firstUid = uids[0]; // Get the first UID
      const balanceSnapshot = await get(ref(database, `Admin/${firstUid}/balance`));
      const balance = balanceSnapshot.val();
      setAdminBalance(balance);
    } catch (error) {
      console.error('Error fetching admin balance:', error.message);
    }
  };
  
  

  const fetchDistributorBalance = async () => {
    try {
      const snapshot = await get(ref(database, `Distributor/${currentUserId}/balance`));
      const balance = snapshot.val();
      setDistributorBalance(balance);
    } catch (error) {
      console.error('Error fetching distributor balance:', error.message);
    }
  };

  const fetchAgentBalance = async () => {
    try {
      const snapshot = await get(ref(database, `Agent/${currentUserId}/balance`));
      const balance = snapshot.val();
      setAgentBalance(balance);
    } catch (error) {
      console.error('Error fetching agent balance:', error.message);
    }
  };

  const fetchPlayerBalance = async () => {
    try {
      const snapshot = await get(ref(database, `Player/${currentUserId}/balance`));
      const balance = snapshot.val();
      setPlayerBalance(balance);
    } catch (error) {
      console.error('Error fetching player balance:', error.message);
    }
  };

  const handleTargetEmailChange = (e) => {
    setTargetEmail(e.target.value);
  };

  const fetchRecipientBalance = async (recipientRole) => {
    try {
      let recipientBalance = null;

      if (recipientRole === 'Distributor') {
        const recipientSnapshot = await get(ref(database, 'Distributor'));
        const recipientData = recipientSnapshot.val();
        for (const recipientUid in recipientData) {
          if (recipientData[recipientUid]?.email === targetEmail) {
            recipientBalance = recipientData[recipientUid]?.balance;
            break;
          }
        }
      } else if (recipientRole === 'Agent') {
        const recipientSnapshot = await get(ref(database, 'Agent'));
        const recipientData = recipientSnapshot.val();
        for (const recipientUid in recipientData) {
          if (recipientData[recipientUid]?.email === targetEmail) {
            recipientBalance = recipientData[recipientUid]?.balance;
            break;
          }
        }
      } else if (recipientRole === 'Player') {
        const recipientSnapshot = await get(ref(database, 'Player'));
        const recipientData = recipientSnapshot.val();
        for (const recipientUid in recipientData) {
          if (recipientData[recipientUid]?.email === targetEmail) {
            recipientBalance = recipientData[recipientUid]?.balance;
            break;
          }
        }
      }

      if (recipientBalance !== null) {
        setRecipientBalance(recipientBalance);
      } else {
        console.error('Recipient not found with the entered email.');
      }
    } catch (error) {
      console.error('Error fetching recipient balance:', error.message);
    }
  };

  const handleTransferAmountChange = (e) => {
    setTransferAmount(e.target.value);
  };

  const transferMoney = async (recipientRole) => {
    try {
      const transferAmountNumber = parseFloat(transferAmount);

      let senderBalancePath = null;
      let senderBalance = null;
      const adminSnapshot = await get(ref(database, 'Admin'));
      const uids = Object.keys(adminSnapshot.val()); // Get an array of UIDs
      const firstUid = uids[0]; // Get the first UID
      // Determine the sender's balance path based on the role
      if (userRole === 'Admin') {
     
        const balanceSnapshot = await get(ref(database, `Admin/${firstUid}/balance`));
        senderBalancePath = `Admin/${firstUid}/balance`;
      } else if (userRole === 'Distributor') {
        senderBalancePath = `Distributor/${currentUserId}/balance`;
      } else if (userRole === 'Agent') {
        senderBalancePath = `Agent/${currentUserId}/balance`;
      } else if (userRole === 'Player') {
        senderBalancePath = `Player/${currentUserId}/balance`;
      }

      // Fetch the sender's balance
      const senderSnapshot = await get(ref(database, senderBalancePath));
      senderBalance = senderSnapshot.val();

      // Check if the sender has sufficient balance
      if (senderBalance < transferAmountNumber) {
        console.error('Insufficient balance for transfer');
        return;
      }

      // Deduct the amount from the sender's balance
      const updatedSenderBalance = senderBalance - transferAmountNumber;
      await set(ref(database, senderBalancePath), updatedSenderBalance);

      // Fetch admin email separately
      let adminEmail = '';
      if (recipientRole === 'Admin') {
        const adminEmailSnapshot = await get(ref(database, `Admin/${firstUid}/email`));
        adminEmail = adminEmailSnapshot.val();
      }

      // Update transactions state with the new transaction
      const transactionDetails = {
        amount: transferAmountNumber,
        userRole: userRole,
        recipientRole: recipientRole,
        recipientEmail: recipientRole === 'Admin' ? adminEmail : targetEmail,
        currentUserEmail: auth.currentUser.email,
        timestamp: new Date().toISOString(),
      };

      setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);

      // Update recipient's balance
      let recipientUid = null;
      let recipientBalancePath = null;

      if (recipientRole === 'Distributor') {
        recipientUid = await findUserUid('Distributor', targetEmail);
        recipientBalancePath = `Distributor/${recipientUid}/balance`;
      } else if (recipientRole === 'Agent') {
        recipientUid = await findUserUid('Agent', targetEmail);
        recipientBalancePath = `Agent/${recipientUid}/balance`;
      } else if (recipientRole === 'Player') {
        recipientUid = await findUserUid('Player', targetEmail);
        recipientBalancePath = `Player/${recipientUid}/balance`;
      } else if (recipientRole === 'Admin') {
        const adminSnapshot = await get(ref(database, 'Admin'));
        const uids = Object.keys(adminSnapshot.val()); // Get an array of UIDs
        const firstUid = uids[0];
        recipientBalancePath = `Admin/${firstUid}/balance`;
      }

      const recipientSnapshot = await get(ref(database, recipientBalancePath));
      const recipientBalance = recipientSnapshot.val();
      const updatedRecipientBalance = recipientBalance + transferAmountNumber;
      await set(ref(database, recipientBalancePath), updatedRecipientBalance);

      // Store the transaction in the database
      const transactionsRef = ref(database, 'TransactionHistory');
      const newTransactionRef = push(transactionsRef);
      await set(newTransactionRef, transactionDetails);
    } catch (error) {
      console.error('Error transferring money:', error.message);
    }
  };

  const creditBalance = async (recipientRole, amount) => {
    try {
      let recipientUid = null;
      let recipientBalancePath = null;

      if (recipientRole === 'Distributor') {
        recipientUid = await findUserUid('Distributor', targetEmail);
        recipientBalancePath = `Distributor/${recipientUid}/balance`;
      } else if (recipientRole === 'Agent') {
        recipientUid = await findUserUid('Agent', targetEmail);
        recipientBalancePath = `Agent/${recipientUid}/balance`;
      } else if (recipientRole === 'Player') {
        recipientUid = await findUserUid('Player', targetEmail);
        recipientBalancePath = `Player/${recipientUid}/balance`;
      } else if (recipientRole === 'Admin') {
        recipientUid = 'admin'; // Admin has a fixed UID in this example
        const adminSnapshot = await get(ref(database, 'Admin'));
        const uids = Object.keys(adminSnapshot.val()); // Get an array of UIDs
        const firstUid = uids[0];
       
        recipientBalancePath = `Admin/${firstUid}/balance`;
      }

      const recipientSnapshot = await get(ref(database, recipientBalancePath));
      const recipientBalance = recipientSnapshot.val();
      const updatedRecipientBalance = recipientBalance + amount;
      await set(ref(database, recipientBalancePath), updatedRecipientBalance);

      return updatedRecipientBalance;
    } catch (error) {
      console.error('Error crediting balance:', error.message);
      throw error;
    }
  };

  const findUserUid = async (role, email) => {
    try {
      const usersSnapshot = await get(ref(database, role));
      const usersData = usersSnapshot.val();
      for (const userUid in usersData) {
        if (usersData[userUid]?.email === email) {
          return userUid;
        }
      }

      console.error(`User with email ${email} not found in role ${role}`);
      throw new Error('User not found');
    } catch (error) {
      console.error('Error finding user UID:', error.message);
      throw error;
    }
  };

  return (
    <div>
      <h2 className="ml-40 mt-40 font-serif text-2xl">Balance Deduction</h2>
      {userRole === 'Admin' && (
        <div>
          <p className="ml-40 mt-27 font-serif text-2xl">Admin Balance: {adminBalance !== null ? adminBalance : 'Loading...'}</p>
          <br></br><input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Distributor Balance
          <br></br></button>
          <br></br><p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br><input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>
          {/* <button
            className="lg:ml-40 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => creditBalance('Distributor', 100)} // Example: Credit 100 to the distributor's balance
          >
            Credit to Distributor
          </button> */}
        </div>
      )}

      {userRole === 'Distributor' && (
        <div>
          <br></br><p className="ml-40 mt-27 font-serif text-2xl">Distributor Balance: {distributorBalance !== null ? distributorBalance : 'Loading...'}</p>
          
          
          <br></br><input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Admin')}
          >
            Transfer to Admin
          </button>
          <br></br>
          <br></br><input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Agent')}
          >
            Fetch Agent Balance
          </button>
          <br></br><p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br><input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Agent')}
          >
            Transfer to Agent
          </button>
          {/* <button
            className="lg:ml-40 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => creditBalance('Agent', 50)} // Example: Credit 50 to the agent's balance
          >
            Credit to Agent
          </button> */}
        </div>
      )}

      {userRole === 'Agent' && (
        <div>
          <p className="ml-40 mt-27 font-serif text-2xl">Agent Balance: {agentBalance !== null ? agentBalance : 'Loading...'}</p>
          <br></br><input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Player')}
          >
            Fetch Player Balance
          </button>
          <br></br><p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br><input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Player')}
          >
            Transfer to Player
          </button>
          <br></br><input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Distributor Balance
          </button>
         <br></br> <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br><input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br><button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>

          {/* <button
            className="lg:ml-40 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => creditBalance('Player', 25)} // Example: Credit 25 to the player's balance
          >
            Credit to Player
          </button> */}
        </div>
      )}

      {userRole === 'Player' && (
        <div>
          
          <p className="lg:ml-40 mt-27 font-serif text-2xl">Player Balance: {playerBalance !== null ? playerBalance : 'Loading...'}</p>
          <input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="lg:ml-40 mt-27 px-2 py-1"
          />
          <button
            className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Agent')}
          >
            Fetch Agent Balance
          </button>
          <p className="lg:ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="lg:ml-40 mt-27 px-2 py-1"
          />
          <button
            className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Agent')}
          >
            Transfer to Agent
          </button>
        </div>
      )}

<TransactionHistory currentUserEmail={auth.currentUser} />
    </div>
  );
};

export default CoinTransfer;
