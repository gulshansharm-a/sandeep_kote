import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { database } from '../../../../Authentication/firebase';

const MenuUserSpecific = () => {
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedSubRole, setSelectedSubRole] = useState('');
    const [subUsers, setSubUsers] = useState([]);
    const [isAdminDisabled, setIsAdminDisabled] = useState(false);

    const fetchSubUsers = async () => {
        try {
            if (!selectedEmail || !selectedRole || !selectedSubRole) {
                console.log(selectedEmail);
                console.log(selectedRole);
                console.log(selectedSubRole);
                console.log('Email, role, or sub-role missing');
                return;
            }

            let userRole;
            let subUsersPath;
            let userRoleID;

            switch (selectedRole) {
                case 'Admin':
                    userRole = 'Admin';
                    subUsersPath = 'Admin';
                    break;
                case 'Distributor':
                    userRole = 'Distributor';
                    subUsersPath = 'Distributor';
                    break;
                case 'Agent':
                    userRole = 'Agent';
                    subUsersPath = 'Agent';
                    break;
                default:
                    console.error('Invalid user role');
                    return;
            }

            const userRoleSnapshot = await get(child(ref(database), userRole));
            userRoleID = Object.entries(userRoleSnapshot.val() || {}).find(
                ([uid, userData]) => userData.email === selectedEmail
            )?.[0];

            if (!userRoleID) {
                console.log(`${userRole} ID not found for email:`, selectedEmail);
                return;
            }

            switch (selectedSubRole) {
                case 'Distributor':
                    subUsersPath = 'Distributor';
                    break;
                case 'Agent':
                    subUsersPath = 'Agent';
                    break;
                case 'Player':
                    subUsersPath = 'Player';
                    break;
                default:
                    console.error('Invalid sub-user role');
                    return;
            }

            const snapshot = await get(child(ref(database), subUsersPath));

            const subUsersData = Object.entries(snapshot.val() || {})
                .filter(([_, userData]) => userData[userRole.toLowerCase() + 'ID'] === userRoleID)
                .map(([subUserId, subUserData]) => ({
                    ...subUserData,
                    subUserId,
                }));

            setSubUsers(subUsersData);
        } catch (error) {
            console.error('Error fetching sub-users from Firebase:', error.message);
        }
    };

    useEffect(() => {
        // Disable Admin option if selectedRole is not empty
        setIsAdminDisabled(!!selectedRole);

        // Fetch sub-users on component mount
        fetchSubUsers();
    }, [selectedEmail, selectedRole, selectedSubRole]);

    const handleFetchSubUsers = () => {
        // Trigger fetching of sub-users
        fetchSubUsers();
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Sub-Users</h2>
            <div className="mb-4">
                <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="userEmail">
                    User Email:
                </label>
                <input
                    type="text"
                    id="userEmail"
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                    className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    placeholder="Enter user email"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="userRole">
                    User Role:
                </label>
                <select
                    id="userRole"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                >
                    <option value="Admin" disabled={selectedSubRole === 'Distributor'}>
                        Admin
                    </option>
                    <option value="Distributor">Distributor</option>
                    <option value="Agent" disabled={selectedSubRole !== 'Player'}>
                        Agent
                    </option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="subUserRole">
                    Sub-User Role:
                </label>
                <select
                    id="subUserRole"
                    value={selectedSubRole}
                    onChange={(e) => setSelectedSubRole(e.target.value)}
                    className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                >
                    <option value="Distributor">Distributor</option>
                    <option value="Agent">Agent</option>
                    <option value="Player">Player</option>
                </select>
            </div>
            <button
                onClick={handleFetchSubUsers}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
            >
                Fetch Sub-Users
            </button>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="p-3 border">S.No</th>
                        <th className="p-3 border">Email</th>
                        <th className="p-3 border">Username</th>
                        {/* Add more columns as needed */}
                    </tr>
                </thead>
                <tbody>
                    {subUsers.map((subUser, index) => (
                        <tr key={subUser.subUserId}>
                            <td className="p-3 border">{index + 1}</td>
                            <td className="p-3 border">{subUser.email}</td>
                            <td className="p-3 border">{subUser.userName}</td>
                            {/* Add more columns as needed */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
};

export default MenuUserSpecific;
