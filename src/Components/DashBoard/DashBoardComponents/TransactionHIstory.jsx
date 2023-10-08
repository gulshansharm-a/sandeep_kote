// TransactionHistory.js
import React from 'react';

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="lg:ml-40 mt-5 font-serif text-2xl">
      <h3>Transaction History:</h3>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            <strong>Amount:</strong> {transaction.amount},{' '}
            <strong>Type:</strong> {transaction.transactionType},{' '}
            <strong>Recipient Role:</strong> {transaction.recipientRole},{' '}
            <strong>Recipient Email:</strong> {transaction.recipientEmail},{' '}
            <strong>Timestamp:</strong> {transaction.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
