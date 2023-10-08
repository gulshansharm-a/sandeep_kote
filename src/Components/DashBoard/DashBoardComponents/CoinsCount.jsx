// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { onAuthStateChanged } from 'firebase/auth';
// import { getDatabase, ref, get, set } from 'firebase/database';
// import { auth } from "../../../Authentication/firebase";
// import TransactionHistory from './TransactionHistory';

// const CoinCount = () => {
//   const [adminBalance, setAdminBalance] = useState(null);
//   const [distributorBalance, setDistributorBalance] = useState(null);
//   const [agentBalance, setAgentBalance] = useState(null);
//   const [playerBalance, setPlayerBalance] = useState(null);
//   const [transferAmount, setTransferAmount] = useState('');
//   const [targetEmail, setTargetEmail] = useState('');
//   const [recipientBalance, setRecipientBalance] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [transactions, setTransactions] = useState([]);

//   const firebaseConfig = {
//     apiKey: "AIzaSyA-lRLBHee1IISE8t5pJywkP-YrHPKIvk4",
//     authDomain: "sandeepkote-c67f5.firebaseapp.com",
//     databaseURL: "https://sandeepkote-c67f5-default-rtdb.firebaseio.com",
//     projectId: "sandeepkote-c67f5",
//     storageBucket: "sandeepkote-c67f5.appspot.com",
//     messagingSenderId: "871561614523",
//     appId: "1:871561614523:web:3b12ae93e7490723ddc59e",
//     measurementId: "G-645LW1SWKT"
//   };

//   const firebaseApp = initializeApp(firebaseConfig);
//   const database = getDatabase(firebaseApp);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         try {
//           const snapshot = await get(ref(database));

//           const data = snapshot.val();

//           for (const role in data) {
//             if (data[role][user.uid]) {
//               console.log('User Role:', role);
//               setUserRole(role);
//               setCurrentUserId(user.uid);
//               break;
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching data from Firebase:', error.message);
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (userRole === 'Admin') {
//       fetchAdminBalance();
//     } else if (userRole === 'Distributor') {
//       fetchDistributorBalance();
//     } else if (userRole === 'Agent') {
//       fetchAgentBalance();
//     } else if (userRole === 'Player') {
//       fetchPlayerBalance();
//     }
//   }, [userRole]);

//   const fetchAdminBalance = async () => {
//     try {
//       const snapshot = await get(ref(database, 'Admin/admin/balance'));
//       const balance = snapshot.val();
//       setAdminBalance(balance);
//     } catch (error) {
//       console.error('Error fetching admin balance:', error.message);
//     }
//   };

//   const fetchDistributorBalance = async () => {
//     try {
//       const snapshot = await get(ref(database, `Distributor/${currentUserId}/balance`));
//       const balance = snapshot.val();
//       setDistributorBalance(balance);
//     } catch (error) {
//       console.error('Error fetching distributor balance:', error.message);
//     }
//   };

//   const fetchAgentBalance = async () => {
//     try {
//       const snapshot = await get(ref(database, `Agent/${currentUserId}/balance`));
//       const balance = snapshot.val();
//       setAgentBalance(balance);
//     } catch (error) {
//       console.error('Error fetching agent balance:', error.message);
//     }
//   };

//   const fetchPlayerBalance = async () => {
//     try {
//       const snapshot = await get(ref(database, `Player/${currentUserId}/balance`));
//       const balance = snapshot.val();
//       setPlayerBalance(balance);
//     } catch (error) {
//       console.error('Error fetching player balance:', error.message);
//     }
//   };

//   const handleTargetEmailChange = (e) => {
//     setTargetEmail(e.target.value);
//   };

//   const fetchRecipientBalance = async (recipientRole) => {
//     try {
//       let recipientBalance = null;

//       if (recipientRole === 'Distributor') {
//         const recipientSnapshot = await get(ref(database, 'Distributor'));
//         const recipientData = recipientSnapshot.val();
//         for (const recipientUid in recipientData) {
//           if (recipientData[recipientUid]?.email === targetEmail) {
//             recipientBalance = recipientData[recipientUid]?.balance;
//             break;
//           }
//         }
//       } else if (recipientRole === 'Agent') {
//         const recipientSnapshot = await get(ref(database, 'Agent'));
//         const recipientData = recipientSnapshot.val();
//         for (const recipientUid in recipientData) {
//           if (recipientData[recipientUid]?.email === targetEmail) {
//             recipientBalance = recipientData[recipientUid]?.balance;
//             break;
//           }
//         }
//       }

//       if (recipientBalance !== null) {
//         setRecipientBalance(recipientBalance);
//       } else {
//         console.error('Recipient not found with the entered email.');
//       }
//     } catch (error) {
//       console.error('Error fetching recipient balance:', error.message);
//     }
//   };

//   const handleTransferAmountChange = (e) => {
//     setTransferAmount(e.target.value);
//   };

//   const transferMoney = async (recipientRole) => {
//     try {
//       const transferAmountNumber = parseFloat(transferAmount);
//       if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
//         console.error('Invalid transfer amount');
//         return;
//       }

//       if (userRole === 'Admin') {
//         const updatedAdminBalance = adminBalance - transferAmountNumber;
//         await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);
//         fetchAdminBalance();
//       } else if (userRole === 'Distributor') {
//         const updatedDistributorBalance = distributorBalance - transferAmountNumber;
//         await set(ref(database, `Distributor/${currentUserId}/balance`), updatedDistributorBalance);
//         fetchDistributorBalance();

//         if (recipientRole === 'Agent') {
//           const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
//           const agentBalance = agentSnapshot.val();
//           const updatedAgentBalance = agentBalance + transferAmountNumber;
//           await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
//           fetchAgentBalance();
//         } else if (recipientRole === 'Player') {
//           const playerSnapshot = await get(ref(database, 'Player/PLAYER_UID/balance'));
//           const playerBalance = playerSnapshot.val();
//           const updatedPlayerBalance = playerBalance + transferAmountNumber;
//           await set(ref(database, 'Player/PLAYER_UID/balance'), updatedPlayerBalance);
//           fetchPlayerBalance();
//         }
//       } else if (userRole === 'Agent') {
//         const updatedAgentBalance = agentBalance - transferAmountNumber;
//         await set(ref(database, `Agent/${currentUserId}/balance`), updatedAgentBalance);
//         fetchAgentBalance();

//         if (recipientRole === 'Distributor') {
//           const distributorSnapshot = await get(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'));
//           const distributorBalance = distributorSnapshot.val();
//           const updatedDistributorBalance = distributorBalance + transferAmountNumber;
//           await set(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'), updatedDistributorBalance);
//           fetchDistributorBalance();
//         } else if (recipientRole === 'Player') {
//           const playerSnapshot = await get(ref(database, 'Player/PLAYER_UID/balance'));
//           const playerBalance = playerSnapshot.val();
//           const updatedPlayerBalance = playerBalance + transferAmountNumber;
//           await set(ref(database, 'Player/PLAYER_UID/balance'), updatedPlayerBalance);
//           fetchPlayerBalance();
//         }
//       } else if (userRole === 'Player') {
//         const updatedPlayerBalance = playerBalance - transferAmountNumber;
//         await set(ref(database, `Player/${currentUserId}/balance`), updatedPlayerBalance);
//         fetchPlayerBalance();

//         if (recipientRole === 'Agent') {
//           const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
//           const agentBalance = agentSnapshot.val();
//           const updatedAgentBalance = agentBalance + transferAmountNumber;
//           await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
//           fetchAgentBalance();
//         } else if (recipientRole === 'Distributor') {
//           const distributorSnapshot = await get(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'));
//           const distributorBalance = distributorSnapshot.val();
//           const updatedDistributorBalance = distributorBalance + transferAmountNumber;
//           await set(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'), updatedDistributorBalance);
//           fetchDistributorBalance();
//         }
//       }

//       if (recipientBalance !== null) {
//         let updatedRecipientBalance = recipientBalance + transferAmountNumber;

//         if (recipientRole === 'Distributor') {
//           await set(ref(database, `Agent/AGENT_UID/balance`), updatedRecipientBalance);
//         } else if (recipientRole === 'Agent') {
//           await set(ref(database, `Player/PLAYER_UID/balance`), updatedRecipientBalance);
//         } else if (recipientRole === 'Player') {
//           await set(ref(database, `Agent/AGENT_UID/balance`), updatedRecipientBalance);
//         }

//         setRecipientBalance(updatedRecipientBalance);
//       }

//       // Capture transaction details
//       const transactionDetails = {
//         amount: transferAmountNumber,
//         transactionType: 'Transfer',
//         recipientRole: recipientRole,
//         recipientEmail: targetEmail,
//         timestamp: new Date().toISOString(),
//       };

//       // Update transactions state with the new transaction
//       setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);
//     } catch (error) {
//       console.error('Error transferring money:', error.message);
//     }
//   };

//   const handleTransferToAdmin = async () => {
//     try {
//       const transferAmountNumber = parseFloat(transferAmount);
//       if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
//         console.error('Invalid transfer amount');
//         return;
//       }

//       if (userRole === 'Distributor') {
//         const updatedDistributorBalance = distributorBalance - transferAmountNumber;
//         await set(ref(database, `Distributor/${currentUserId}/balance`), updatedDistributorBalance);
//         fetchDistributorBalance();

//         const adminSnapshot = await get(ref(database, 'Admin/admin/balance'));
//         const adminBalance = adminSnapshot.val();
//         const updatedAdminBalance = adminBalance + transferAmountNumber;
//         await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);
//         fetchAdminBalance();
//       }
//     } catch (error) {
//       console.error('Error transferring money to admin:', error.message);
//     }
//   };

//   const handleTransferToAgent = async () => {
//     try {
//       const transferAmountNumber = parseFloat(transferAmount);
//       if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
//         console.error('Invalid transfer amount');
//         return;
//       }

//       const updatedPlayerBalance = playerBalance - transferAmountNumber;
//       await set(ref(database, `Player/${currentUserId}/balance`), updatedPlayerBalance);
//       fetchPlayerBalance();

//       const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
//       const agentBalance = agentSnapshot.val();
//       const updatedAgentBalance = agentBalance + transferAmountNumber;
//       await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
//       fetchAgentBalance();

//       // Capture transaction details
//       const transactionDetails = {
//         amount: transferAmountNumber,
//         transactionType: 'Transfer',
//         recipientRole: 'Agent',
//         recipientEmail: '', // You may update this with the actual agent's email
//         timestamp: new Date().toISOString(),
//       };

//       // Update transactions state with the new transaction
//       setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);
//     } catch (error) {
//       console.error('Error transferring money to agent:', error.message);
//     }
//   };
//   return (
//     <div>
//       <h2 className="lg:ml-40 mt-40 font-serif text-2xl">Balance Deduction</h2>
//       {userRole === 'Admin' && (
//         <div>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Admin Balance: {adminBalance !== null ? adminBalance : 'Loading...'}</p>
//           <input
//             type="text"
//             placeholder="Enter recipient email"
//             value={targetEmail}
//             onChange={handleTargetEmailChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => fetchRecipientBalance('Distributor')}
//           >
//             Fetch Recipient Balance
//           </button>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={transferAmount}
//             onChange={handleTransferAmountChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => transferMoney('Distributor')}
//           >
//             Transfer Money to Distributor
//           </button>
//           <br />
//         </div>
//       )}
//       {userRole === 'Distributor' && (
//         <div>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Distributor Balance: {distributorBalance !== null ? distributorBalance : 'Loading...'}</p>
//           <input
//             type="text"
//             placeholder="Enter recipient email"
//             value={targetEmail}
//             onChange={handleTargetEmailChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => fetchRecipientBalance('Agent')}
//           >
//             Fetch Recipient Balance
//           </button>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={transferAmount}
//             onChange={handleTransferAmountChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => transferMoney('Agent')}
//           >
//             Transfer Money to Agent
//           </button>
//           <br />
//           <input
//             type="number"
//             placeholder="Enter amount to transfer to Admin"
//             value={transferAmount}
//             onChange={handleTransferAmountChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={handleTransferToAdmin}
//           >
//             Transfer to Admin
//           </button>
//           <TransactionHistory transactions={transactions} />
//         </div>
//       )}
//       {userRole === 'Agent' && (
//         <div>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Agent Balance: {agentBalance !== null ? agentBalance : 'Loading...'}</p>
//           <input
//             type="text"
//             placeholder="Enter recipient email"
//             value={targetEmail}
//             onChange={handleTargetEmailChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => fetchRecipientBalance('Distributor')}
//           >
//             Fetch Recipient Balance (Distributor)
//           </button>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={transferAmount}
//             onChange={handleTransferAmountChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => transferMoney('Distributor')}
//           >
//             Transfer Money to Distributor
//           </button>
//           <br />
          
//           <TransactionHistory transactions={transactions} />
//         </div>
//       )}
//       {userRole === 'Player' && (
//         <div>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Player Balance: {playerBalance !== null ? playerBalance : 'Loading...'}</p>
//           <input
//             type="text"
//             placeholder="Enter recipient email"
//             value={targetEmail}
//             onChange={handleTargetEmailChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => fetchRecipientBalance('Agent')}
//           >
//             Fetch Recipient Balance (Agent)
//           </button>
//           <p className="lg:ml-40 mt-27 font-serif text-2xl">Recipient Balance: {recipientBalance !== null ? recipientBalance : 'Loading...'}</p>
//           <input
//             type="number"
//             placeholder="Enter amount"
//             value={transferAmount}
//             onChange={handleTransferAmountChange}
//             className="lg:ml-40 mt-27 px-2 py-1"
//           />
//           <button
//             className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             onClick={() => transferMoney('Agent')}
//           >
//             Transfer Money to Agent
//           </button>
//           <br />
//           <TransactionHistory transactions={transactions} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoinCount;


import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { auth } from "../../../Authentication/firebase";
import TransactionHistory from './TransactionHistory';

const CoinCount = () => {
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
      const snapshot = await get(ref(database, 'Admin/admin/balance'));
      const balance = snapshot.val();
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
      if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
        console.error('Invalid transfer amount');
        return;
      }

      if (userRole === 'Admin') {
        const updatedAdminBalance = adminBalance - transferAmountNumber;
        await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);
        fetchAdminBalance();
      } else if (userRole === 'Distributor') {
        const updatedDistributorBalance = distributorBalance - transferAmountNumber;
        await set(ref(database, `Distributor/${currentUserId}/balance`), updatedDistributorBalance);
        fetchDistributorBalance();

        if (recipientRole === 'Agent') {
          const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
          const agentBalance = agentSnapshot.val();
          const updatedAgentBalance = agentBalance + transferAmountNumber;
          await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
          fetchAgentBalance();
        } else if (recipientRole === 'Player') {
          const playerSnapshot = await get(ref(database, 'Player/PLAYER_UID/balance'));
          const playerBalance = playerSnapshot.val();
          const updatedPlayerBalance = playerBalance + transferAmountNumber;
          await set(ref(database, 'Player/PLAYER_UID/balance'), updatedPlayerBalance);
          fetchPlayerBalance();
        }
      } else if (userRole === 'Agent') {
        const updatedAgentBalance = agentBalance - transferAmountNumber;
        await set(ref(database, `Agent/${currentUserId}/balance`), updatedAgentBalance);
        fetchAgentBalance();

        if (recipientRole === 'Distributor') {
          const distributorSnapshot = await get(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'));
          const distributorBalance = distributorSnapshot.val();
          const updatedDistributorBalance = distributorBalance + transferAmountNumber;
          await set(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'), updatedDistributorBalance);
          fetchDistributorBalance();
        } else if (recipientRole === 'Player') {
          const playerSnapshot = await get(ref(database, 'Player/PLAYER_UID/balance'));
          const playerBalance = playerSnapshot.val();
          const updatedPlayerBalance = playerBalance + transferAmountNumber;
          await set(ref(database, 'Player/PLAYER_UID/balance'), updatedPlayerBalance);
          fetchPlayerBalance();
        }
      } else if (userRole === 'Player') {
        const updatedPlayerBalance = playerBalance - transferAmountNumber;
        await set(ref(database, `Player/${currentUserId}/balance`), updatedPlayerBalance);
        fetchPlayerBalance();

        if (recipientRole === 'Agent') {
          const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
          const agentBalance = agentSnapshot.val();
          const updatedAgentBalance = agentBalance + transferAmountNumber;
          await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
          fetchAgentBalance();
        } else if (recipientRole === 'Distributor') {
          const distributorSnapshot = await get(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'));
          const distributorBalance = distributorSnapshot.val();
          const updatedDistributorBalance = distributorBalance + transferAmountNumber;
          await set(ref(database, 'Distributor/DISTRIBUTOR_UID/balance'), updatedDistributorBalance);
          fetchDistributorBalance();
        }
      }

      if (recipientBalance !== null) {
        let updatedRecipientBalance = recipientBalance + transferAmountNumber;

        if (recipientRole === 'Distributor') {
          await set(ref(database, `Agent/AGENT_UID/balance`), updatedRecipientBalance);
        } else if (recipientRole === 'Agent') {
          await set(ref(database, `Player/PLAYER_UID/balance`), updatedRecipientBalance);
        } else if (recipientRole === 'Player') {
          await set(ref(database, `Agent/AGENT_UID/balance`), updatedRecipientBalance);
        }

        setRecipientBalance(updatedRecipientBalance);
      }

      // Capture transaction details
      const transactionDetails = {
        amount: transferAmountNumber,
        transactionType: 'Transfer',
        recipientRole: recipientRole,
        recipientEmail: targetEmail,
        timestamp: new Date().toISOString(),
      };

      // Update transactions state with the new transaction
      setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);
    } catch (error) {
      console.error('Error transferring money:', error.message);
    }
  };

  const handleTransferToAdmin = async () => {
    try {
      const transferAmountNumber = parseFloat(transferAmount);
      if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
        console.error('Invalid transfer amount');
        return;
      }

      if (userRole === 'Distributor') {
        const updatedDistributorBalance = distributorBalance - transferAmountNumber;
        await set(ref(database, `Distributor/${currentUserId}/balance`), updatedDistributorBalance);
        fetchDistributorBalance();

        const adminSnapshot = await get(ref(database, 'Admin/admin/balance'));
        const adminBalance = adminSnapshot.val();
        const updatedAdminBalance = adminBalance + transferAmountNumber;
        await set(ref(database, 'Admin/admin/balance'), updatedAdminBalance);
        fetchAdminBalance();
      }
    } catch (error) {
      console.error('Error transferring money to admin:', error.message);
    }
  };

  const handleTransferToAgent = async () => {
    try {
      const transferAmountNumber = parseFloat(transferAmount);
      if (isNaN(transferAmountNumber) || transferAmountNumber <= 0) {
        console.error('Invalid transfer amount');
        return;
      }

      const updatedPlayerBalance = playerBalance - transferAmountNumber;
      await set(ref(database, `Player/${currentUserId}/balance`), updatedPlayerBalance);
      fetchPlayerBalance();

      const agentSnapshot = await get(ref(database, 'Agent/AGENT_UID/balance'));
      const agentBalance = agentSnapshot.val();
      const updatedAgentBalance = agentBalance + transferAmountNumber;
      await set(ref(database, 'Agent/AGENT_UID/balance'), updatedAgentBalance);
      fetchAgentBalance();

      // Capture transaction details
      const transactionDetails = {
        amount: transferAmountNumber,
        transactionType: 'Transfer',
        recipientRole: 'Agent',
        recipientEmail: '', // You may update this with the actual agent's email
        timestamp: new Date().toISOString(),
      };

      // Update transactions state with the new transaction
      setTransactions((prevTransactions) => [...prevTransactions, transactionDetails]);
    } catch (error) {
      console.error('Error transferring money to agent:', error.message);
    }
  };



  return (
    <div>
      <h2 className="lg:ml-40 mt-40 font-serif text-2xl">Balance Deduction</h2>
      {userRole === 'Admin' && (
        <div>
          <p className="lg:ml-40 mt-27 font-serif text-2xl">Admin Balance: {adminBalance !== null ? adminBalance : 'Loading...'}</p>
          <input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="lg:ml-40 mt-27 px-2 py-1"
          />
          <button
            className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Recipient Balance
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
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>
          <button
            className="lg:ml-40 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleTransferToAdmin}
          >
            Transfer to Admin
          </button>
        </div>
      )}

      {userRole === 'Distributor' && (
        <div>
          <p className="lg:ml-40 mt-27 font-serif text-2xl">Distributor Balance: {distributorBalance !== null ? distributorBalance : 'Loading...'}</p>
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
            Fetch Recipient Balance
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
          <button
            className="lg:ml-40 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleTransferToAdmin}
          >
            Transfer to Admin
          </button>
        </div>
      )}

      {userRole === 'Agent' && (
        <div>
          <p className="lg:ml-40 mt-27 font-serif text-2xl">Agent Balance: {agentBalance !== null ? agentBalance : 'Loading...'}</p>
          <input
            type="text"
            placeholder="Enter recipient email"
            value={targetEmail}
            onChange={handleTargetEmailChange}
            className="lg:ml-40 mt-27 px-2 py-1"
          />
          <button
            className="lg:ml-40 mt-27 mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => fetchRecipientBalance('Distributor')}
          >
            Fetch Recipient Balance
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
            onClick={() => transferMoney('Distributor')}
          >
            Transfer to Distributor
          </button>
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
            Fetch Recipient Balance
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

      <div>
        <h2 className="lg:ml-40 mt-40 font-serif text-2xl">Transaction History</h2>
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
};

export default CoinCount;
