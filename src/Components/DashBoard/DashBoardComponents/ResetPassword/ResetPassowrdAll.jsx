import React, { useEffect, useState } from 'react';
import { child, get, ref } from 'firebase/database';
import { auth } from '../../../../Authentication/firebase';
import { database } from '../../../../Authentication/firebase';
import { updatePassword } from "firebase/auth";

export default function ResetPasswordAll() {
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedUserOption, setSelectedUserOption] = useState('');
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
        if (selectedUserOption && selectedOption) {
            try {
                const userRef = ref(database, selectedOption + '/' + selectedUserOption);
                const snapshot = await get(userRef);
                const userDetails = snapshot.val();

                if (userDetails) {
                    const { blocked_history, blocked } = userDetails;
                    const status = blocked ? 'Blocked' : 'Unblocked';

                    const blockedHistoryDetails = [];

                    if (blocked_history) {
                        for (const historyKey in blocked_history) {
                            const historyEntry = blocked_history[historyKey];
                            const historyStatus = Object.keys(historyEntry)[0];
                            const entryDetails = historyEntry[historyStatus];
                            const time = entryDetails.time;
                            const blockedBy = entryDetails.blockedBy;
                            blockedHistoryDetails.push({ status: historyStatus, time, blockedBy });
                        }
                    }

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

    const handleResetPassword = async () => {
        if (selectedOption && selectedUserOption) {
            try {
                // Assuming you have the user's email, you need to fetch it from the database
                const userRef = ref(database, selectedOption + '/' + selectedUserOption);
                const snapshot = await get(userRef);
                const userDetails = snapshot.val();

                if (userDetails) {
                    const email = userDetails.email; // Assuming you have the user's email
                    const newPassword = "abcdefgh"; // You need to define a function to generate a new password
                    // Reset the password using Firebase Authentication
                    await updatePassword(auth.currentUser, newPassword);
                    alert(`Password reset for ${email}. New password: ${newPassword}`);
                }
            } catch (error) {
                console.error('Error resetting password:', error.message);
                alert('Password reset failed.');
            }
        }
    };

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
                        <option value="" disabled>
                            Select Role
                        </option>
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
                        <option value="" disabled>
                            Select User
                        </option>
                        {currentUsers.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleResetPassword}
                    disabled={!selectedOption || !selectedUserOption}
                    className={`p-2 rounded bg-blue-500 text-white ${!selectedOption || !selectedUserOption ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                    Reset Password
                </button>
            </div>
        </div>
    );
}
