import React, { useEffect, useState } from 'react';
import { child, get, ref, update, push, set } from 'firebase/database';
import { auth } from '../../../../Authentication/firebase';
import { database } from '../../../../Authentication/firebase';


export default function BlockUsers() {
    const [selectedOption, setSelectedOption] = useState('Player');
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

    function getFormattedDate() {
        const currentTime = new Date();
        const dd = String(currentTime.getDate()).padStart(2, "0");
        const mm = String(currentTime.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const yyyy = currentTime.getFullYear();
        const hours = String(currentTime.getHours()).padStart(2, "0");
        const minutes = String(currentTime.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} - ${hours}:${minutes} IST`;
    }

    const toggleBlockStatus = async (user) => {
        console.log("triggered");


        const userRef = ref(database, `${selectedOption}/${user.userId}`);
        const currentBlockStatus = user.blocked || false;
        const timestamp = getFormattedDate();
        const blockedBy = auth.currentUser.email; // Get the email of the current user

        const confirmation = window.confirm(`Are you sure you want to ${currentBlockStatus ? 'unblock' : 'block'} ${user.email}?`);
        if (!confirmation) {
            // User canceled the action, do nothing
            return;
        }
        try {
            // Create or update a unique key in the user's blocked_history
            const historyRef = child(userRef, 'blocked_history');
            const newKey = push(historyRef).key;

            const updates = {};
            updates[newKey] = currentBlockStatus
                ? { unblocked: { time: timestamp, blockedBy } }
                : { blocked: { time: timestamp, blockedBy } };

            await update(historyRef, updates);

            // Update the user's block status
            await update(userRef, { blocked: !currentBlockStatus });

            alert(`${user.email} is now ${currentBlockStatus ? 'Unblocked' : 'Blocked'}`);
            const timer = setTimeout(() => {
                // Reload the page
                window.location.reload();
            }, 500);

            timer();
        } catch (error) {
            console.error('Error toggling block status:', error.message);
        }
    };


    return (
        <div>
            <div className='flex flex-row justify-between mt-20 m-5'>
                <h1 className="text-3xl font-bold text-gray-800">Block Users</h1>
                <a href='/dashboard/blockUsersHistory' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center'>
                    Block Users History
                </a>
            </div>

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
                <table className="w-full border mb-10">
                    <thead>
                        <tr>
                            <th className="p-3 border">
                                S.No
                            </th>
                            <th className="p-3 border">
                                {selectedOption} Email
                            </th>
                            <th className="p-3 border">
                                Username
                            </th>
                            <th className="p-3 border">
                                Blocked/Unblocked
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.userId}>
                                <td className="p-3 border">
                                    {indexOfFirstItem + index + 1}
                                </td>
                                <td className="p-3 border">
                                    {user.email}
                                </td>
                                <td className="p-3 border">
                                    {user.userName}
                                </td>
                                <td className="p-3 border">
                                    <button
                                        onClick={() => toggleBlockStatus(user)}
                                        className={`bg-${user.blocked ? 'red-600' : 'green-500'} text-white p-2 border rounded`}
                                    >
                                        {user.blocked ? 'Blocked' : 'unblocked'}
                                    </button>
                                </td>
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
