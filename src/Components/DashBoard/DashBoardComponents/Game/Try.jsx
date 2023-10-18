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

const PlayerData = () => {
  const [playerData, setPlayerData] = useState([]);

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

  return (
    <div className="lg:ml-20 mt-5 font-serif">
      <h2>Player Data:</h2>
      <table>
        <thead>
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Chapa</th>
            <th className="p-2 border">Kata</th>
            <th className="p-2 border">Result</th>
            <th className="p-2 border">Time</th>
          </tr>
        </thead>
        <tbody>
          {playerData.map((player, index) => (
            <tr key={index}>
              <td className="p-2 border">{player.email}</td>
              <td className="p-2 border">{player.chapa}</td>
              <td className="p-2 border">{player.kata}</td>
              <td className="p-2 border">{player.result}</td>
              <td className="p-2 border">{player.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerData;
