import React, { useEffect, useState } from 'react';
import { child, get, ref, update, push, set } from 'firebase/database';
import { auth } from '../../../../Authentication/firebase';
import { database } from '../../../../Authentication/firebase';


export default function BlockedHistory() {
    const [selectedOption, setSelectedOption] = useState('Player');
    const [selectedUserOption, setSelectedUserOption] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentAuthUser, setcurrentAuthUser] = useState('');
    const [options, setOptions] = useState(['Player']);

    // Use the userOptions to set the initial selectedOption
    useEffect(() => {
        if (currentAuthUser === "Admin")
            setOptions(['Admin', 'Distributor', 'Agent', 'Player']);
        else if (currentAuthUser === "Distributor")
            setOptions(['Agent', 'Player']);
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
                        return true;
                    } else if (currentAuthUser === 'Distributor') {
                        if (user.distributorID === auth.currentUser.uid) {
                            return true;
                        }
                    } else if (currentAuthUser === 'Agent') {
                        if (user.agentID === auth.currentUser.uid) {
                            return true;
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

    const handleSelectedUserChange = (event) => {
        setSelectedUserOption(event.target.value);
        console.log(event.target.value);
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

    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    // Function to fetch user details
    const fetchUserDetails = async () => {
        // Make sure selectedUserOption and selectedOption are not null
        if (selectedUserOption && selectedOption) {
            try {
                console.log(selectedUserOption);
                console.log(selectedOption);
                // Replace 'Player' with the role and 'KzmzYIVVpYVdIcHMUijCVO3Hgjv1' with the user ID
                const userRef = ref(database, selectedOption + '/' + selectedUserOption);
                const snapshot = await get(userRef);
                const userDetails = snapshot.val();

                if (userDetails) {
                    // Access user details including blocked history
                    const { blocked_history, blocked } = userDetails;
                    const status = blocked ? 'Blocked' : 'Unblocked';

                    // Initialize arrays to store blocked history details
                    const blockedHistoryDetails = [];

                    if (blocked_history) {
                        // Iterate through each entry in blocked_history
                        for (const historyKey in blocked_history) {
                            const historyEntry = blocked_history[historyKey];

                            // Extract details from the entry
                            const historyStatus = Object.keys(historyEntry)[0]; // 'blocked' or 'unblocked'
                            const entryDetails = historyEntry[historyStatus];

                            // Collect time and blockedBy
                            const time = entryDetails.time;
                            const blockedBy = entryDetails.blockedBy;

                            // Add the entry details to the array
                            blockedHistoryDetails.push({ status: historyStatus, time, blockedBy });
                        }
                    }

                    // Set the user details, including all blocked history entries
                    setSelectedUserDetails({
                        status,
                        blockedHistory: blockedHistoryDetails,
                    });
                }
            } catch (error) {
                console.error('Error fetching user details:', error.message);
            }
        }
    };

    // Fetch user details when selectedUserOption or selectedOption changes
    useEffect(() => {
        fetchUserDetails();
    }, [selectedUserOption, selectedOption]);


    return (
        <div>
            <div className="p-4">
                <div className="mb-4">
                    <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="userType">
                        Select User Type:
                    </label>
                    <select
                        id="userType"
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                        value={selectedOption}
                        onChange={handleOptionChange}
                    >
                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="userType">
                        Select User :
                    </label>
                    <select
                        id="userType"
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                        value={selectedUserOption}
                        onChange={handleSelectedUserChange}
                    >
                        {currentUsers.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
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
                        placeholder="Search by email"
                    />
                </div>
                <table className="w-full border mb-10">
                    <thead>
                        <tr>
                            <th className="p-3 border">
                                Status
                            </th>
                            <th className="p-3 border">
                                Time
                            </th>
                            <th className="p-3 border">
                                Blocked / Unblocked By
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedUserDetails &&
                            selectedUserDetails.blockedHistory.map((historyEntry, index) => (
                                <tr key={index}>
                                    <td className="p-3 border">
                                        {historyEntry.status}
                                    </td>
                                    <td className="p-3 border">
                                        {historyEntry.time}
                                    </td>
                                    <td className="p-3 border">
                                        {historyEntry.blockedBy}
                                    </td>
                                </tr>
                            ))
                        }
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
    );
}
