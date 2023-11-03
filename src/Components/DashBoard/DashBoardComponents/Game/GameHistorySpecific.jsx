import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { database } from '../../../../Authentication/firebase';

export default function GameHistorySpecific({ emailProp, UID }) {
  const [specific, setSpecific] = useState(true); // Set to true to show the specific player's history
  const [selectedEmail, setSelectedEmail] = useState(emailProp);
  const [selectedUID, setSelectedUID] = useState(UID);
  const [selectedRole, setSelectedRole] = useState('Player'); // Assuming 'Player' role, change it if needed
  const [currentUser, setCurrentUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows per page

  // Fetch user data and history for the specific player
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the specific player's data based on email and UID
        const userRef = ref(database, `${selectedRole}/${selectedUID}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();

        // Fetch the game history for the specific player
        const historyRef = ref(database, `${selectedRole}/${selectedUID}/bet`);
        const historySnapshot = await get(historyRef);
        const historyData = historySnapshot.val();

        // Set the current user and their game history
        setCurrentUser(userData);
        setUserHistory(historyData);
      } catch (error) {
        console.error('Error fetching data from Firebase:', error.message);
      }
    };

    fetchData();
  }, [selectedRole, selectedUID, selectedEmail]);

  // Calculate the range of items to display based on currentPage and rowsPerPage
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const userHistorySlice = userHistory
    ? Object.keys(userHistory).slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const totalPages = Math.ceil(Object.keys(userHistory).length / rowsPerPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page when changing rows per page
  };

  return (
    <div>
      <div>
        <div className='flex flex-row justify-between mt-20 m-5'>
          <h1 className="text-3xl font-bold text-gray-800">Game History of {selectedEmail}</h1>
        </div>
        <div className="p-4">
          <table className="mt-4 w-full border">
            <thead className='bg-gray-800 text-white'>
              <tr>
                <th className="p-3 border">S.No</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Chapa</th>
                <th className="p-3 border">Kata</th>
                <th className="p-3 border">Result</th>
                <th className="p-3 border">Date / Time</th>
                <th className="p-3 border">Bet ID</th>
              </tr>
            </thead>
            <tbody>
              {userHistorySlice.map((betId, index) => {
                const bet = userHistory[betId];
                return (
                  <tr key={betId}>
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{selectedEmail}</td>
                    <td className="p-3 border">{bet.chapa || '-'}</td>
                    <td className="p-3 border">{bet.kata || '-'}</td>
                    <td className="p-3 border">{bet.result || '-'}</td>
                    <td className="p-3 border">{bet.time || '-'}</td>
                    <td className="p-3 border">{betId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`bg-gray-900 p-2 text-white border rounded hover:bg-gray-700 focus:outline-none focus:ring focus:border-blue-500 ${
                  currentPage === index + 1 ? 'bg-gray-700' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        {/* <div className="mt-2 text-center text-gray-600">
          Page {currentPage} of {totalPages}
        </div> */}
        <div className="mt-2 ml-5">
          <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="rowsPerPage">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            {[1,2,5, 10, 15, 20, 25].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
