

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
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyPasswordCallback, setVerifyPasswordCallback] = useState(null);
  const [distributorEmails, setDistributorEmails] = useState([]);
const [agentEmails, setAgentEmails] = useState([]);
const [playerEmails, setPlayerEmails] = useState([]);

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
      const uids = Object.keys(adminSnapshot.val());
      const firstUid = uids[0];
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
      // Prompt the user to enter the password
      const enteredPassword = prompt('Enter your password:');
      if (!enteredPassword) {
        console.error('Password entry canceled. Money transfer aborted.');
        return;
      }
  
    
      const isPasswordCorrect = await verifyPassword(enteredPassword);
      if (!isPasswordCorrect) {
        console.error('Incorrect password. Money transfer aborted.');
        return;
      }
  
      // Proceed with the money transfer logic
      console.log('Password verified. Initiating money transfer...');
  
      const transferAmountNumber = parseFloat(transferAmount);
  
      // Fetch sender balance
      const senderBalancePath = `${userRole}/${currentUserId}/balance`;
      const senderSnapshot = await get(ref(database, senderBalancePath));
      const senderBalance = senderSnapshot.val();
  
      // Check if the sender has sufficient balance
      if (senderBalance < transferAmountNumber) {
        console.error('Insufficient balance for transfer');
        return;
      }
  
      // Deduct amount from sender's balance
      const updatedSenderBalance = senderBalance - transferAmountNumber;
      await set(ref(database, senderBalancePath), updatedSenderBalance);
  
      // Fetch recipient balance
      const recipientUid = await findUserUid(recipientRole, targetEmail);
      const recipientBalancePath = `${recipientRole}/${recipientUid}/balance`;
      const recipientSnapshot = await get(ref(database, recipientBalancePath));
      const recipientBalance = recipientSnapshot.val();
  
      // Credit amount to recipient's balance
      const updatedRecipientBalance = recipientBalance + transferAmountNumber;
      await set(ref(database, recipientBalancePath), updatedRecipientBalance);
      const adminSnapshot = await get(ref(database, 'Admin'));
      const uids = Object.keys(adminSnapshot.val()); // Get an array of UIDs
      const firstUid = uids[0]; // Get the first UID
      console.log(1);
      let adminEmail = '';
      if (recipientRole === 'Admin') {
        const adminEmailSnapshot = await get(ref(database, `Admin/${firstUid}/email`));
        adminEmail = adminEmailSnapshot.val();
      }
      const transactionDetails = {
        amount: transferAmountNumber,
        userRole: userRole,
        recipientRole: recipientRole,
        recipientEmail: recipientRole === 'Admin' ? adminEmail : targetEmail,
        currentUserEmail: auth.currentUser.email,
        timestamp: new Date().toISOString(),
      };
  
      setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);
      const transactionsRef = ref(database, 'TransactionHistory');
      const newTransactionRef = push(transactionsRef);
      await set(newTransactionRef, transactionDetails);
      
      // Display a success message
      alert('Money transferred successfully!');
  
      // Reset input values
      setTargetEmail('');
      setTransferAmount('');
  
    } catch (error) {
      console.error('Error transferring money:', error.message);
    }
   
    
  };
  

  const handleTransferButtonClick = (recipientRole) => {
    // Show the password modal
    setShowPasswordModal(true);

    // Handle the transfer after password verification
    const handleTransfer = async () => {
      setShowPasswordModal(false); // Close the password modal
      await transferMoney(recipientRole); // Initiate the money transfer
    };

    // Set the handleTransfer function as the callback for password verification
    setVerifyPasswordCallback(() => handleTransfer);
  };
  const fetchDistributorEmails = async () => {
    try {
      const distributorSnapshot = await get(ref(database, 'Distributor'));
      const emails = Object.values(distributorSnapshot.val()).map(distributor => distributor.email);
      setDistributorEmails(emails);
    } catch (error) {
      console.error('Error fetching distributor emails:', error.message);
    }
  };
  const fetchPlayerEmails = async () => {
    try {
      const playerSnapshot = await get(ref(database, 'Player'));
      const emails = Object.values(playerSnapshot.val()).map(player => player.email);
      setPlayerEmails(emails);
    } catch (error) {
      console.error('Error fetching player emails:', error.message);
    }
  };
  // Function to fetch agent emails
  const fetchAgentEmails = async () => {
    try {
      const agentSnapshot = await get(ref(database, 'Agent'));
      const emails = Object.values(agentSnapshot.val()).map(agent => agent.email);
      setAgentEmails(emails);
    } catch (error) {
      console.error('Error fetching agent emails:', error.message);
    }
  };

  // UseEffect to fetch distributor emails when the user role is Admin
  useEffect(() => {
    if (userRole === 'Admin' ||userRole === 'Agent' ) {
      fetchDistributorEmails();
    }
  }, [userRole]);

  // UseEffect to fetch agent emails when the user role is Distributor
  useEffect(() => {
    if (userRole === 'Distributor' || userRole === 'Player') {
      fetchAgentEmails();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'Agent') {
      fetchPlayerEmails();
    }
  }, [userRole]);
  const verifyPassword = async (enteredPassword) => {
    try {
      // Replace this with your actual password verification logic
      const r = `${userRole}/${currentUserId}/pass`;
     
      const correctPasswordt = await get(ref(database, r));
      const correctPassword = correctPasswordt.val();
     
      // Prompt the user to enter the password


      // Compare the entered password with the correct password
      const isPasswordCorrect = enteredPassword === correctPassword;

      if (isPasswordCorrect) {
        // If the password is correct, proceed with the money transfer
        // ...

        // Close the password modal
        setShowPasswordModal(false);
        return true;
      } else {
        console.error('Incorrect password. Money transfer aborted.');
        return false;
      }
    } catch (error) {
      console.error('Error verifying password:', error.message);
      return false;
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
        recipientUid = 'admin';
        const adminSnapshot = await get(ref(database, 'Admin'));
        const uids = Object.keys(adminSnapshot.val());
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
          <br></br>
          <select
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          >
            <option value="" disabled>Select recipient email</option>
            {distributorEmails.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Distributor Balance
          </button>
          <br></br>
          <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>
        </div>
      )}
  
      {userRole === 'Distributor' && (
        <div>
          <p className="ml-40 mt-27 font-serif text-2xl">Distributor Balance: {distributorBalance !== null ? distributorBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Admin')}
          >
            Transfer to Admin
          </button>
          <br></br>
          <br></br>
          <select
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          >
            <option value="" disabled>Select recipient email</option>
            {agentEmails.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Agent')}
          >
            Fetch Agent Balance
          </button>
          <br></br>
          <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Agent')}
          >
            Transfer to Agent
          </button>
        </div>
      )}
  
      {/* Role-specific code blocks for other user roles similar to Admin and Distributor */}
      {/* Role-specific code blocks for other user roles similar to Admin and Distributor */}
      {userRole === 'Agent' && (
        <div>
          <p className="ml-40 mt-27 font-serif text-2xl">Agent Balance: {agentBalance !== null ? agentBalance : 'Loading...'}</p>
          <br></br>
          <select
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          >
            <option value="" disabled>Select Player email</option>
            {playerEmails.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Player')}
          >
            Fetch Player Balance
          </button>
          <br></br>
          <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Player')}
          >
            Transfer to Player
          </button>


          <br></br>
          <select
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          >
            <option value="" disabled>Select Distributor email</option>
            {distributorEmails.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Distributor Balance
          </button>
          <br></br>
          <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>

        </div>
      )}
  
      {userRole === 'Player' && (
        <div>
          <p className="ml-40 mt-27 font-serif text-2xl">Player Balance: {playerBalance !== null ? playerBalance : 'Loading...'}</p>
          <br></br>
          <select
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="ml-40 mt-27 px-2 py-1"
          >
            <option value="" disabled>Select Distributor email</option>
            {agentEmails.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Agent')}
          >
            Fetch Agent Balance
          </button>
          <br></br>
          <p className="ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
          <br></br>
          <input
            type="number"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            className="ml-40 mt-27 px-2 py-1"
          />
          <br></br>
          <button
            className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => transferMoney('Agent')}
          >
            Transfer to Agent
          </button>
        </div>
      )}
  
      {/* TransactionHistory component */}
      <TransactionHistory currentUserEmail={auth.currentUser} />
  
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={verifyPassword}>Verify Password</button>
        </div>
      )}
    </div>
  );
  };
  

  


export default CoinTransfer;
