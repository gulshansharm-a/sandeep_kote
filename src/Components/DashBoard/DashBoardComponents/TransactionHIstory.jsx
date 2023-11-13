import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../Authentication/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchUserRole, setSearchUserRole] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [timeRange, setTimeRange] = useState('all');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const getCurrentUserEmail = () => {
    const auth = getAuth();

    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.email);
        } else {
          reject(new Error('User not authenticated'));
        }
      });

      return unsubscribe;
    });
  };

  useEffect(() => {
    getCurrentUserEmail()
      .then((email) => setCurrentUserEmail(email))
      .catch((error) => console.error(error));

    const transactionsRef = ref(database, 'TransactionHistory');

    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.values(data);
        const filteredTransactions = filterTransactionsByTime(transactionsArray, timeRange);
        const sortedTransactions = sortTransactions(filteredTransactions, sortOption, currentUserEmail);
        setTransactions(sortedTransactions);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sortOption, timeRange, currentUserEmail]);

  const sortTransactions = (data, option, currentUserEmail) => {
    return [...data].filter(
      (transaction) =>
        transaction.currentUserEmail === currentUserEmail ||
        transaction.recipientEmail === currentUserEmail
    ).sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      return option === 'latest' ? dateB - dateA : dateA - dateB;
    });
  };

  const filterTransactionsByTime = (data, range) => {
    const currentDate = new Date();

    switch (range) {
      case 'today':
        return data.filter((transaction) => isSameDay(new Date(transaction.timestamp), currentDate));

      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(currentDate.getDate() - 1);
        return data.filter((transaction) => isSameDay(new Date(transaction.timestamp), yesterday));

      case 'lastWeek':
        const lastWeek = new Date();
        lastWeek.setDate(currentDate.getDate() - 7);
        return data.filter((transaction) => new Date(transaction.timestamp) > lastWeek);

      case 'last2Weeks':
        const last2Weeks = new Date();
        last2Weeks.setDate(currentDate.getDate() - 14);
        return data.filter((transaction) => new Date(transaction.timestamp) > last2Weeks);

      case 'thisMonth':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return data.filter((transaction) => new Date(transaction.timestamp) > startOfMonth);

      case 'last2Months':
        const last2Months = new Date();
        last2Months.setMonth(currentDate.getMonth() - 2);
        return data.filter((transaction) => new Date(transaction.timestamp) > last2Months);

      default:
        return data;
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const searchRecipient = (recipientEmail) => {
    const filteredTransactions = transactions.filter((transaction) =>
      transaction.recipientEmail.includes(recipientEmail) || transaction.currentUserEmail.includes(recipientEmail)
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
        const filteredTransactions = filterTransactionsByTime(transactionsArray, timeRange);
        const sortedTransactions = sortTransactions(filteredTransactions, sortOption, currentUserEmail);
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
        <select
          className="text-white text-xs ml-2 bb bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="lastWeek">Last Week</option>
          <option value="last2Weeks">Last 2 Weeks</option>
          <option value="thisMonth">This Month</option>
          <option value="last2Months">Last 2 Months</option>
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
            <th className="p-3 border">Sent by</th>
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
              <td className="p-3 border">{transaction.currentUserEmail},</td>
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
