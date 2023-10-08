import React, { useEffect, useState } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from '../../../Authentication/firebase'; // Update this path

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const transactionsRef = ref(database, 'TransactionHistory');

    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.values(data);
        setTransactions(transactionsArray);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="lg:ml-40 mt-5 font-serif text-2xl">
      <h3>Transaction History:</h3>
      <ul>
        <thead>
        <tr>
                        <th className="p-3 border">Amount</th>
                        <th className="p-3 border">Type</th>
                        <th className="p-3 border">Recipient Role</th>
                        <th className="p-3 border">Recipient Email</th>
                        <th className="p-3 border">Timestamp</th>

                    </tr>
        </thead>
        <tbody>
        {transactions.map((transaction, index) => (
          <tr key={index}>
            
            <td className="p-3 border">{transaction.amount},{' '}</td> 
            <td className="p-3 border">{transaction.transactionType},{' '}</td> 
            <td className="p-3 border">{transaction.recipientRole},{' '}</td> 
            <td className="p-3 border">{transaction.recipientEmail},{' '}</td> 
            <td className="p-3 border">{transaction.timestamp}</td> 

          </tr>
        ))}
        </tbody>
      </ul>
    </div>
  );
};

export default TransactionHistory;
