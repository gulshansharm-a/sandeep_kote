import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

const CommissionHistory = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState(["Distributor", "Agent"]);
    const [users, setUsers] = useState([]);
    const [commissionHistory, setCommissionHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const database = getDatabase(); // Initialize your Firebase Realtime Database instance

    useEffect(() => {
        fetchUsersForRole(selectedRole);
    }, [selectedRole]);

    useEffect(() => {
        fetchCommissionHistory(selectedUser);
    }, [selectedUser]);

    const fetchUsersForRole = (role) => {
        if (role) {
            const usersRef = ref(database, role);
            get(usersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const userArray = Object.keys(userData).map((uid) => ({
                            uid,
                            email: userData[uid].email, // Assuming the user data has an 'email' field
                        }));
                        setUsers(userArray);
                    } else {
                        setUsers([]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching users:', error.message);
                });
        }
    };

    const fetchCommissionHistory = (uid) => {
        if (uid) {
            const userRef = ref(database, `${selectedRole}/${uid}/commissionHistory`);
            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setCommissionHistory(Object.values(snapshot.val()));
                    } else {
                        setCommissionHistory([]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching commission history:', error.message);
                });
        }
    };

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const filteredCommissionHistory = commissionHistory.filter((historyItem) => (
        (typeof historyItem.Endpoint === 'string' && historyItem.Endpoint.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof historyItem.com === 'string' && historyItem.com.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof historyItem.t_s === 'string' && historyItem.t_s.toLowerCase().includes(searchTerm.toLowerCase()))
    ));

    const currentCommissionHistory = filteredCommissionHistory.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="">
            <div className='flex flex-row justify-between mt-20 m-5'>
                <h1 className="text-3xl font-bold text-gray-800">Commission History</h1>
            </div>
            <div className='p-4'>
                <div className="mb-4">
                    <label htmlFor="roleSelect" className="block text-gray-900 font-bold text-lg">
                        Select Role:
                    </label>
                    <select
                        id="roleSelect"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                        }}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="userSelect" className="block text-gray-900 font-bold text-lg">
                        Select User:
                    </label>
                    <select
                        id="userSelect"
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.target.value);
                        }}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                            <option key={user.uid} value={user.uid}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="search" className="block text-gray-900 font-bold text-lg">
                        Search Commission History:
                    </label>
                    <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                        placeholder="Search by endpoint, commission, or timestamp"
                    />
                </div>
                <h2 className="text-2xl font-bold mb-4">Commission History</h2>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="p-3 border">Endpoint</th>
                            <th className="p-3 border">Commission</th>
                            <th className="p-3 border">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCommissionHistory.map((historyItem, index) => (
                            <tr key={index}>
                                <td className="p-3 border">{historyItem.Endpoint}</td>
                                <td className="p-3 border">{historyItem.com}</td>
                                <td className="p-3 border">{historyItem.t_s}</td>
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
                        onChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setCurrentPage(1);
                        }}
                        className="p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
                    >
                        {[5, 10, 15, 20, 25].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <div className="mt-2 flex justify-center space-x-2">
                        {Array.from({ length: Math.ceil(filteredCommissionHistory.length / rowsPerPage) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`${currentPage === index + 1
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                    } p-2 border rounded focus:outline-none focus:ring focus:border-blue-500`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionHistory;
