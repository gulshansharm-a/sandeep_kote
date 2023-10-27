
// const firebaseConfig = {
//   apiKey: "AIzaSyA-lRLBHee1IISE8t5pJywkP-YrHPKIvk4",
//   authDomain: "sandeepkote-c67f5.firebaseapp.com",
//   databaseURL: "https://sandeepkote-c67f5-default-rtdb.firebaseio.com",
//   projectId: "sandeepkote-c67f5",
//   storageBucket: "sandeepkote-c67f5.appspot.com",
//   messagingSenderId: "871561614523",
//   appId: "1:871561614523:web:3b12ae93e7490723ddc59e",
//   measurementId: "G-645LW1SWKT"
// };

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const CoinCount = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [adminBalance, setAdminBalance] = useState(null);
  const [standing, setStanding] = useState(null);
  const [earning, setEarning] = useState(null);
  const [earningPercentage, setEarningPercentage] = useState(null);
  const [kata, setKata] = useState(null);
  const [chapa, setChapa] = useState(null);
  const [earningPercentageInput, setEarningPercentageInput] = useState('');
  const [remainingTime, setRemainingTime] = useState(null);

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
  const auth = getAuth();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoggedInUserId(userId);
      fetchAdminData(userId);
      fetchTimerData();
    }
  }, []);
  const setCustomBet = async (betValue) => {
    try {
        // Update the database with the chosen bet value
        await set(ref(database, `customBet`), betValue);
        console.log(`customBet set to: ${betValue}`);
        alert(`customBet updated to: ${betValue}`);
    } catch (error) {
        console.error('Error setting customBet:', error.message);
        alert('Error updating customBet. Please try again.');
    }
};

  const fetchAdminData = async (userId) => {
    try {
      const adminSnapshot = await get(ref(database, `/`));
      const adminData = adminSnapshot.val();
      if (adminData) {
        setAdminBalance(adminData.balance || null);
        setStanding(adminData.standing || null);
        setEarning(adminData.earning || null);
        setEarningPercentage(adminData.earningPercentage || null);
        setEarningPercentageInput(adminData.earningPercentage || '');
        setKata(adminData.kata || null);
        setChapa(adminData.chapa || null);
      } else {
        console.error('The logged-in user is not an admin.');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error.message);
    }
  };

  const fetchTimerData = async () => {
    try {
      const timerSnapshot = await get(ref(database, 'timer/time'));
      const timestamp = timerSnapshot.val();
      const currentTime = Date.now();
      const elapsedTime = currentTime - timestamp;
      setRemainingTime(60000 - elapsedTime);
    } catch (error) {
      console.error('Error fetching timer data:', error.message);
    }
  };
  
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 0) {
          fetchTimerData();  // Fetch the updated timer value
          return 60000;  // Reset timer to 60 seconds
        }
        return prevTime - 1000;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, []);

const handleEarningPercentageChange = async (e) => {
  const value = parseFloat(e.target.value);
  console.log(`Trying to set earning percentage to: ${value}`); // Logging

  if (value >= 0 && value <= 100) {
      setEarningPercentageInput(value);
      try {
          await set(ref(database, `earningPercentage`), value);
          setEarningPercentage(value);
          alert('Earning percentage updated successfully.');
      } catch (error) {
          console.error('Error updating earning percentage:', error.message); // Enhanced error logging
          alert('Error updating earning percentage. Please try again.');
      }
  }
};


  const updateEarningPercentage = async () => {
    try {
      await set(ref(database, `admin/${loggedInUserId}/earningPercentage`), parseFloat(earningPercentageInput));
      setEarningPercentage(earningPercentageInput);
    } catch (error) {
      console.error('Error updating earning percentage:', error.message);
    }
  };
  const handleCalculateCommissions = async () => {
    console.log("clickeddd");
    try {
      const response = await fetch('http://localhost:3000/calculate-commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // You can include a request body if needed
        // body: JSON.stringify({ /* your data here */ }),
      });

      if (response.ok) {
        // The request was successful, you can add any further handling here.
        console.log('Commissions calculated and updated successfully.');
      } else {
        // Handle any errors here.
        console.error('Error calculating commissions.');
      }
    } catch (error) {
      console.error('An error occurred while sending the request:', error);
    }
  };
  return (
    <div>
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row justify-end'>
          <button onClick={handleCalculateCommissions} className="m-10 px-4 py-2 bg-red-500 text-white rounded text-sm lg:text-base">Commission</button>
        </div>


      </div>



      <div className="flex flex-col lg:flex-row h-[75vh] px-4 lg:px-10 items-center justify-center">

        {/* Left Side (Admin Details) */}
        <div className="lg:flex-1 pr-0 lg:pr-10 mb-6 lg:mb-0">
          <p className="text-2xl lg:text-3xl mb-2 lg:mb-6">Standing: {standing || 'Loading...'}</p>
          <p className="text-2xl lg:text-3xl mb-2 lg:mb-6">Earning: {earning || 'Loading...'}</p>
          <p className="text-2xl lg:text-3xl mb-2 lg:mb-6">Earning Percentage: {earningPercentage || 'Loading...'}</p>
          <div className="mb-2 lg:mb-6 flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              value={earningPercentageInput}
              onChange={handleEarningPercentageChange}
              className="mr-2 lg:mr-4 px-4 py-2 border border-gray-300 rounded focus:outline-none text-sm lg:text-base"
            />
            <button onClick={updateEarningPercentage} className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 text-white rounded text-sm lg:text-base">Update Percentage</button>
          </div>
        </div>

        {/* Spacer */}
        <div className="w-0 lg:w-10"></div>

        {/* Right Side */}
        <div className="lg:flex-1 flex flex-col items-center justify-start">

          {/* Chapa and Kata circles */}
          <div className="flex flex-row lg:flex-row mb-4 lg:mb-8">
            <div className="coin h-30 lg:h-48 w-48 lg:w-48 flex flex-col items-center justify-center mb-2 lg:mb-0 lg:mr-4">
              {/* ... (same as before) */}
              <img
                className="top-0 left-0 w-full h-full"
                src="https://res.cloudinary.com/dzhdarh4q/image/upload/v1696779744/qdytcjqof9xrsomcm0r9.jpg"
                alt="Chapa"
              />
              <p className="text-2xl text-black">Chapa {chapa || 'Loading...'}</p>
            </div>
            <div className="coin h-30 lg:h-48 w-48 lg:w-48 flex flex-col items-center justify-center">
              {/* ... (same as before) */}
              <img
                className="top-0 left-0 w-full h-full"
                src="https://res.cloudinary.com/dzhdarh4q/image/upload/v1696778738/k7spz6emh3wu91uosgwt.jpg"
                alt="Kata"
              />
              <p className="text-2xl text-black">Kata {kata || 'Loading...'}</p>
            </div>
          </div>

          {/* Timer */}
          <p className="mb-4 lg:mb-8 text-2xl lg:text-3xl">{remainingTime ? Math.floor(remainingTime / 1000) : 'Loading...'}</p>

          {/* Chapa and Kata buttons */}
          <div className="flex">
            <button onClick={() => setCustomBet("chapa")} className="mr-2 lg:mr-4 px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 text-white rounded text-sm lg:text-base">Chapa</button>
            <button onClick={() => setCustomBet("kata")} className="ml-2 lg:ml-4 px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 text-white rounded text-sm lg:text-base">Kata</button>
          </div>

        </div>
      </div>
    </div>


  );


};

export default CoinCount;
