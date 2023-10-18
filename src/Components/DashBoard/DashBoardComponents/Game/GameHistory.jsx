import React, { useEffect, useState } from 'react';
import { auth, database } from '../../../../Authentication/firebase';
import { get, ref } from 'firebase/database';
import PlayerData from './Try';

export default function GameHistory() {
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const snapshot = await get(ref(database));
          const data = snapshot.val();
      
          console.log('Fetched data from Firebase:', data);
      
          let foundUserRole = null;
          let foundUserEmail = null;
      
          for (const role in data) {
            if (data[role][auth.currentUser.uid]) {
              foundUserRole = role;
              foundUserEmail = auth.currentUser.email;
              setCurrentUserID(auth.currentUser.uid);
              break;
            }
          }
      
          console.log('Found User Role:', foundUserRole);
          console.log('Found User Email:', foundUserEmail);
      
          setUserRole(foundUserRole);
          setUserEmail(foundUserEmail);
      
          if (foundUserRole) {
            const userRoleData = data[foundUserRole];
      
            console.log('User Role Data:', userRoleData);
      
            // Check if the user has data for their role
            if (userRoleData && auth.currentUser.uid in userRoleData) {
              const userDataForUser = userRoleData[auth.currentUser.uid];
      
              console.log('User Data for User:', userDataForUser);
      
              // Check if the user has the required ID
              if (userDataForUser && 'adminID' in userDataForUser) {
                const adminOrDistributorID = userDataForUser.adminID;
      
                console.log('Admin or Distributor ID:', adminOrDistributorID);
      
                // Check if the admin or distributor ID is present
                if (adminOrDistributorID) {
                  const playerSnapshot = await get(ref(database, `Player/${adminOrDistributorID}`));
      
                  const playerData = playerSnapshot.val();
      
                  console.log('Player Data:', playerData);
      
                  // Assuming the player data has a 'bet' field
                  setUserData(playerData);
                } else {
                  console.error('Admin or Distributor ID not found for the user.');
                }
              } else {
                console.error('User data does not contain key: adminID');
              }
            } else {
              console.error(`Role data not found for role: ${foundUserRole}`);
            }
      
            setLoading(false);
          } else {
            console.error('User role not found.');
          }
      
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data from Firebase:', error.message);
          setLoading(false);
        }
      };
      
    fetchData();
  }, [searchTerm]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Assuming you have betIds and betDetails fetched from Firebase
  const betIds = userData?.bet ? Object.keys(userData.bet) : [];
  const betDetails = userData?.bet || [];

  // Pagination logic
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const filteredBetIds = betIds.filter((betId) => {
    const bet = betDetails[betId];
    const searchTermLower = searchTerm.toLowerCase();

    return (
      betId.includes(searchTermLower) ||
      bet.chapa.toString().includes(searchTermLower) ||
      bet.kata.toString().includes(searchTermLower) ||
      bet.result.includes(searchTermLower) ||
      bet.time.includes(searchTermLower)
    );
  });

  const currentBetIds = filteredBetIds.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when changing the search term
  };

  return (
    <div>
      <h2>Game History for {userData?.userName}</h2>

      <div className="mb-4">
        <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="search">
          Search:
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearch}
          className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
          placeholder="Search by Bet ID, Chapa, Kata, Result, or Time"
        />
      </div>

      <table className="table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Player Email</th>
            <th className="border px-4 py-2">Player Username</th>
            <th className="border px-4 py-2">Balance</th>
            <th className="border px-4 py-2">Bet ID</th>
            <th className="border px-4 py-2">Chapa</th>
            <th className="border px-4 py-2">Kata</th>
            <th className="border px-4 py-2">Result</th>
            <th className="border px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {currentBetIds.map((betId) => {
            const bet = betDetails[betId];

            return (
              <tr key={betId}>
                <td className="border px-4 py-2">{userEmail}</td>
                <td className="border px-4 py-2">{userData?.userName}</td>
                <td className="border px-4 py-2">{userData?.balance}</td>
                <td className="border px-4 py-2">{betId}</td>
                <td className="border px-4 py-2">{bet.chapa}</td>
                <td className="border px-4 py-2">{bet.kata}</td>
                <td className="border px-4 py-2">{bet.result}</td>
                <td className="border px-4 py-2">{bet.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4">
        <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="rowsPerPage">
          Rows per page:
        </label>
        <select
          id="rowsPerPage"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
        >
          {[5, 10, 15, 20, 25].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <div className="mt-2 flex justify-center space-x-2">
          {/* Centering the pagination buttons horizontally */}
          {Array.from({ length: Math.ceil(filteredBetIds.length / rowsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`${
                currentPage === index + 1 ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              } p-2 border rounded hover:bg-gray-200 focus:outline-none focus:ring focus:border-blue-500`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <PlayerData />
    </div>
  );
}
