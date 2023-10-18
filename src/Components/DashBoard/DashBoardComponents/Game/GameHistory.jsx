import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const GameHistory = () => {
  const [playerData, setPlayerData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const playerRef = ref(database, 'Player');

    const unsubscribe = onValue(playerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dataArray = Object.keys(data).map((uid) => {
          const player = data[uid];
          const betKey = Object.keys(player?.bet || {})[0];
          const betData = player?.bet?.[betKey] || {};

          return {
            email: player.email || '-',
            chapa: betData?.chapa || '-',
            kata: betData?.kata || '-',
            result: betData?.result || '-',
            time: betData?.time || '-',
          };
        });

        setPlayerData(dataArray);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [database]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const currentPlayers = playerData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="lg:ml-20 mt-5 font-serif">
      <h2 className='font-bold text-xl mt-10'>Game History</h2>
      <table className="mt-4 w-full border">
        <thead>
          <tr>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Chapa</th>
            <th className="p-3 border">Kata</th>
            <th className="p-3 border">Result</th>
            <th className="p-3 border">Time</th>
          </tr>
        </thead>
        <tbody>
          {currentPlayers.map((player, index) => (
            <tr key={index}>
              <td className="p-3 border">{player.email}</td>
              <td className="p-3 border">{player.chapa}</td>
              <td className="p-3 border">{player.kata}</td>
              <td className="p-3 border">{player.result}</td>
              <td className="p-3 border">{player.time}</td>
            </tr>
          ))}
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
          {Array.from({ length: Math.ceil(playerData.length / rowsPerPage) }).map((_, index) => (
            <button
              key={index + 1}
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
    </div>
  );
};

export default GameHistory;
