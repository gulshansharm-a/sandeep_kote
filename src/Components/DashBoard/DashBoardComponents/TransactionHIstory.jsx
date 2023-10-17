import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../Authentication/firebase'; // Update this path

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchUserRole, setSearchUserRole] = useState('');
  const [sortOption, setSortOption] = useState('latest');

  useEffect(() => {
    const transactionsRef = ref(database, 'TransactionHistory');

    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.values(data);
        const sortedTransactions = sortTransactions(transactionsArray, sortOption);
        setTransactions(sortedTransactions);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sortOption]);

  const sortTransactions = (data, option) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      return option === 'latest' ? dateB - dateA : dateA - dateB;
    });
  };

  const searchRecipient = (recipientEmail) => {
    const filteredTransactions = transactions.filter((transaction) =>
      transaction.recipientEmail.includes(recipientEmail)
    );

    setTransactions(filteredTransactions);
  };

  const searchByUserRole = () => {
    const searchTerm = searchUserRole.toLowerCase();

    const filteredTransactions = transactions.filter((transaction) => {
      if (searchTerm === 'distributor' && transaction.userRole.toLowerCase() === 'distributor') {
        return true;
      }

      if (searchTerm === 'agent' && transaction.userRole.toLowerCase() === 'agent') {
        return true;
      }

      if (searchTerm === 'player' && transaction.userRole.toLowerCase() === 'player') {
        return true;
      }

      return false;
    });

    setTransactions(filteredTransactions);
  };

  const resetTransactions = () => {
    const transactionsRef = ref(database, 'TransactionHistory');

    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.values(data);
        const sortedTransactions = sortTransactions(transactionsArray, sortOption);
        setTransactions(sortedTransactions);
      }
    });
  };

  return (
    <div className="lg:ml-20 mt-5 font-serif">
      <h3>Transaction History:</h3>
      <div className="flex my-3">
        <select
          className="text-white text-xs ml-2 bb bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="latest">Latest Date</option>
          <option value="oldest">Oldest Date</option>
        </select>
        <button
          className="text-white text-xs ml-2 bb bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => resetTransactions()}
        >
          Reset Transactions
        </button>
        <input
          type="text"
          placeholder="Search by Recipient Email"
          onChange={(e) => searchRecipient(e.target.value)}
          className="px-2 py-1 mr-2 ml-2"
        />
       
      </div>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="p-2 border">Amount</th>
            <th className="p-3 border">Recipient Role</th>
            <th className="p-3 border">Recipient Email</th>
            <th className="p-3 border">User Role</th>
            <th className="p-3 border">Date</th>
            <th className="p-3 border">Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td className="p-3 border">{transaction.amount},</td>
              <td className="p-3 border">{transaction.recipientRole},</td>
              <td className="p-3 border">{transaction.recipientEmail},</td>
              <td className="p-3 border">{transaction.userRole},</td>
              <td className="p-3 border">{new Date(transaction.timestamp).toLocaleDateString()},</td>
              <td className="p-3 border">{new Date(transaction.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
