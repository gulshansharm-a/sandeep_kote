import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { database } from '../../../../Authentication/firebase';

const MenuUserSpecific = () => {
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedSubRole, setSelectedSubRole] = useState('');
    const [subUsers, setSubUsers] = useState([]);
    const [isAdminDisabled, setIsAdminDisabled] = useState(false);
    const [roleOptions, setRoleOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    const getSubUserRoles = (role) => {
        switch (role) {
            case 'Admin':
                return ['Distributor', 'Agent', 'Player'];
            case 'Distributor':
                return ['Agent', 'Player'];
            case 'Agent':
                return ['Player'];
            default:
                return [];
        }
    };

    const fetchSubUsers = async () => {
        try {
            console.log('Selected Email:', selectedEmail);
            console.log('Selected Role:', selectedRole);
            console.log('Selected Sub-Role:', selectedSubRole);
    
            if (!selectedEmail || !selectedRole || !selectedSubRole) {
                console.log('Email, role, or sub-role missing');
                return;
            }
    
            // Fetch the UID of the selected user email
            const userRoleSnapshot = await get(child(ref(database), selectedRole));
            const userRoleID = Object.entries(userRoleSnapshot.val() || {}).find(
                ([uid, userData]) => userData.email === selectedEmail
            )?.[0];
    
            if (!userRoleID) {
                console.log(`${selectedRole} ID not found for email:`, selectedEmail);
                return;
            }
    
            console.log('User Role ID:', userRoleID);
    
            // Fetch sub-users based on the selected role
            const subUsersPath = selectedSubRole; // Assuming sub-users are stored directly under the selected sub-role
            const snapshot = await get(child(ref(database), subUsersPath));
    
            console.log('All Sub-Users Data:', snapshot.val());
    
            const idFieldName =
                selectedRole === 'Distributor' ? 'distributorID' : selectedRole === 'Agent' ? 'agentID' : '';
    
            const subUsersData = Object.entries(snapshot.val() || {})
                .filter(([_, userData]) => {
                    console.log('User Data:', userData);
                    console.log(userData[idFieldName]);
                    console.log(userRoleID);
                    return userData[idFieldName] === userRoleID;
                })
                .map(([subUserId, subUserData]) => ({
                    ...subUserData,
                    subUserId,
                }));
    
            console.log('Filtered Sub-Users Data:', subUsersData);
    
            setSubUsers(subUsersData);
        } catch (error) {
            console.error('Error fetching sub-users from Firebase:', error.message);
        }
    };
    

    const fetchRoleOptions = async () => {
        const availableRoles = ['Admin', 'Distributor', 'Agent', 'Player'];
        setRoleOptions(availableRoles);
    };

    const fetchUserOptions = async () => {
        try {
            // Check if selectedRole is valid before making the request
            if (!selectedRole) {
                console.error('Invalid selected role');
                return;
            }

            const userOptionsSnapshot = await get(child(ref(database), selectedRole));

            const users = Object.entries(userOptionsSnapshot.val() || {}).map(
                ([userId, userData]) => ({
                    userId,
                    email: userData.email,
                    // Add other user details as needed
                })
            );

            setUserOptions(users);
        } catch (error) {
            console.error('Error fetching user options from Firebase:', error.message);
        }
    };

    useEffect(() => {
        setIsAdminDisabled(!!selectedRole);
        fetchSubUsers();
    }, [selectedEmail, selectedRole, selectedSubRole]);

    useEffect(() => {
        fetchRoleOptions();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchUserOptions();
            setSelectedSubRole('');
        }
    }, [selectedRole]);

    const handleFetchSubUsers = () => {
        fetchSubUsers();
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Sub-Users</h2>

            <div className="mb-4">
                <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="userRole">
                    Select Role:
                </label>
                <select
                    id="userRole"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                >
                    <option value="" disabled>
                        Select Role
                    </option>
                    {roleOptions.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRole && (
                <div className="mb-4">
                    <label className="block text-gray-900 font-bold text-lg mb-2" htmlFor="selectedUser">
                        Select User:
                    </label>
                    <select
                        id="selectedUser"
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    >
                        <option value="" disabled>
                            Select User
                        </option>
                        {userOptions.map((user) => (
                            <option key={user.userId} value={user.email}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedRole && (
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
                        <option value="" disabled>
                            Select Sub-User Role
                        </option>
                        {getSubUserRoles(selectedRole).map((subUserRole) => (
                            <option key={subUserRole} value={subUserRole}>
                                {subUserRole}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                onClick={handleFetchSubUsers}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
            >
                Fetch Sub-Users
            </button>

            {subUsers.length > 0 ? (
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="p-3 border">S.No</th>
                            <th className="p-3 border">Email</th>
                            <th className="p-3 border">Username</th>
                            <th className="p-3 border">Balance</th> {/* New column for balance */}
                            {/* Add more columns as needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {subUsers.map((subUser, index) => (
                            <tr key={subUser.subUserId}>
                                <td className="p-3 border">{index + 1}</td>
                                <td className="p-3 border">{subUser.email}</td>
                                <td className="p-3 border">{subUser.userName}</td>
                                <td className="p-3 border">{subUser.balance}</td> {/* Display balance */}
                                {/* Add more columns as needed */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No data found</p>
            )}
        </div>
    );
};

export default MenuUserSpecific;
