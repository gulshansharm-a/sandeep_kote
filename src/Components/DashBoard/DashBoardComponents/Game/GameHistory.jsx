import React, { useEffect, useState } from 'react';
import { child, get, ref } from 'firebase/database';
import { auth } from '../../../../Authentication/firebase';
import { database } from '../../../../Authentication/firebase';
import MenuUserSpecific from '../MenuUsers/MenuUserSpecific';

export default function GameHistory() {
  const [selectedOption, setSelectedOption] = useState('Player');
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAuthUser, setcurrentAuthUser] = useState('');
  const [options, setOptions] = useState(['Player']);
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Use the userOptions to set the initial selectedOption
  useEffect(() => {
    if (currentAuthUser === "Admin")
      setOptions(['Player']);
    else if (currentAuthUser === "Distributor")
      setOptions(['Player']);
    else if (currentAuthUser === "Agent")
      setOptions(['Player']);
  }, [currentAuthUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(database));

          const data = snapshot.val();

          for (const role in data) {
            if (data[role][user.uid]) {
              setcurrentAuthUser(role);
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

    const fetchData = async () => {
      try {
        let snapshot;

        switch (selectedOption) {
          case 'Admin':
            snapshot = await get(child(ref(database), 'Admin'));
            break;
          case 'Distributor':
            snapshot = await get(child(ref(database), 'Distributor'));
            break;
          case 'Agent':
            snapshot = await get(child(ref(database), 'Agent'));
            break;
          case 'Player':
            snapshot = await get(child(ref(database), 'Player'));
            break;
          default:
            snapshot = await get(child(ref(database), 'Admin'));
        }

        const usersData = Object.entries(snapshot.val())
          .map(([userId, userData]) => ({
            ...userData,
            userId,
            role: selectedOption,
          }));

        const filteredUsersPromises = usersData.map(async (user) => {
          if (currentAuthUser === 'Admin') {
            return user.bet !== undefined;
          } else if (currentAuthUser === 'Distributor') {
            if (user.distributorID === auth.currentUser.uid) {
              return user.bet !== undefined;
            }
          } else if (currentAuthUser === 'Agent') {
            if (user.agentID === auth.currentUser.uid) {
              return user.bet !== undefined;
            }
          }
          return false;
        });

        const filteredUsersResults = await Promise.all(filteredUsersPromises);

        const filteredUsers = usersData.filter((user, index) => filteredUsersResults[index]);

        setUsers(filteredUsers);

        console.log(users);
      } catch (error) {
        console.error('Error fetching data from Firebase:', error.message);
      }
    };

    fetchData();
  }, [selectedOption, currentAuthUser]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();

    setSearchTerm(searchTerm);
    setCurrentPage(1); // Reset to the first page when changing the search term
  };

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const filteredUsers = users.filter((user) =>
    user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const [userEmails, setUserEmails] = useState({});

  useEffect(() => {
    // Fetch user emails when the component mounts
    const fetchUserEmails = async () => {
      const emails = {};
      try {
        // console.log('Fetching user emails for:', selectedOption);
        const role = selectedOption;
        // console.log('Current users:', users);
        const usersToFetchEmails = users.filter((user) => !userEmails[user.userId]);
        // console.log('Users to fetch emails for:', usersToFetchEmails);

        for (const user of usersToFetchEmails) {
          const uid = user.userId;
          const userSnapshot = await get(ref(database, `${role}/${uid}`));

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            emails[uid] = userData.email;
          } else {
            console.error(`${role} not found with UID:`, uid);
          }
        }

        // console.log('Fetched user emails:', emails);

        setUserEmails((prevUserEmails) => ({
          ...prevUserEmails,
          ...emails,
        }));
      } catch (error) {
        // console.error(`Error fetching user emails:`, error.message);
      }
    };

    fetchUserEmails();
  }, [selectedOption, users]);

  const [specific, setSpecific] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUID, setSelectedUID] = useState(null);

  function handleEmailClick(email, role, uid) {
    console.log(role);
    console.log(email);
    console.log(uid);
    setSelectedEmail(email);
    setSelectedRole(role);
    setSelectedUID(uid);
    setSpecific(true);
  }

  console.log(currentUsers);

  const filterByTime = (betTime, timeFilter) => {
    const today = new Date();
    const betDateArray = betTime.split(' - '); // Split the date and time parts
    const dateString = betDateArray[0]; // Extract the date part
    const timeString = betDateArray[1]; // Extract the time part

    const [day, month, year] = dateString.split('/').map(Number); // Extract day, month, year
    const [time, timezone] = timeString.split(' '); // Extract time and timezone
    const [hour, minute] = time.split(':').map(Number); // Extract hour and minute

    const betDate = new Date(year, month - 1, day, hour, minute);

    switch (timeFilter) {
      case 'All Time':
        return true;

      case 'today':
        return (
          betDate.getDate() === today.getDate() &&
          betDate.getMonth() === today.getMonth() &&
          betDate.getFullYear() === today.getFullYear()
        );

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return (
          betDate.getDate() === yesterday.getDate() &&
          betDate.getMonth() === yesterday.getMonth() &&
          betDate.getFullYear() === yesterday.getFullYear()
        );

      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return betDate >= startOfWeek && betDate < endOfWeek;

      case 'lastTwoWeeks':
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        return betDate >= twoWeeksAgo && betDate <= today;

      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return betDate >= startOfMonth && betDate <= endOfMonth;

      case 'lastTwoMonths':
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        return betDate >= twoMonthsAgo && betDate <= endOfLastMonth;

      // Add more cases for other time filters as needed

      default:
        return true;
    }
  };


  return (
    <div>
      {specific ?
        <div>
          <div>
            <MenuUserSpecific email={selectedEmail} role={selectedRole} UID={selectedUID} />
          </div>
        </div>
        :
        <div>
          <div className='flex flex-row justify-between mt-20 m-5'>
            <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
          </div>
          <div className="p-4">
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
                placeholder={`Search ${selectedOption}`}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="timeRangeSelect" className="block text-gray-900 font-bold text-lg">
                Select Time Range:
              </label>
              <select
                id="timeRangeSelect"
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                }}
                className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
              >
                <option value="All Time">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastTwoWeeks">Last 2 weeks</option>
                <option value="thisMonth">This month</option>
                <option value="lastTwoMonths">Last 2 month</option>
                {/* Add other time range options */}
              </select>
            </div>
            <table className="mt-4 w-full border">
              <thead className='text-white bg-gray-800'>
                <tr>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Chapa</th>
                  <th className="p-3 border">Kata</th>
                  <th className="p-3 border">Result</th>
                  <th className="p-3 border">Date / Time</th>
                  <th className="p-3 border">Bet ID</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <React.Fragment key={user.userId}>
                    {Object.keys(user.bet || {}).map((betId) => {
                      const bet = user.bet[betId];
                      if (bet.time) {
                        if (filterByTime(bet.time, timeFilter)) {
                          return (
                            <tr key={betId}>
                              <td>{user.email}</td>
                              <td className="p-3 border">{bet.chapa || '-'}</td>
                              <td className="p-3 border">{bet.kata || '-'}</td>
                              <td className="p-3 border">{bet.result || '-'}</td>
                              <td className="p-3 border">{bet.time || '-'}</td>
                              <td className="p-3 border">{betId}</td>
                            </tr>
                          );
                        }
                      }
                      return null;
                    })}
                  </React.Fragment>
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
                {[1, 2, 5, 10, 15, 20, 25, 30].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex justify-center space-x-2">
                {Array.from({ length: Math.ceil(filteredUsers.length / rowsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className="bg-gray-900 p-2 text-white border rounded hover:bg-gray-700 focus:outline-none focus:ring focus:border-blue-500"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
