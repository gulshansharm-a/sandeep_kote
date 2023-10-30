import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

const ResetPassword = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState(['Distributor', 'Agent']);
    const [users, setUsers] = useState([]);
    const database = getDatabase(); // Initialize your Firebase Realtime Database instance

    useEffect(() => {
        // Fetch roles when the component mounts
        const rolesRef = ref(database);
        get(rolesRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setRoles(Object.keys(snapshot.val()));
                }
            })
            .catch((error) => {
                console.error('Error fetching roles:', error.message);
            });
    }, []);

    useEffect(() => {
        // Fetch users for the selected role when the role changes
        if (selectedRole) {
            const usersRef = ref(database, selectedRole);
            get(usersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const usersData = snapshot.val();

                        const usersWithEmail = Object.keys(usersData).map((uid) => ({
                            uid,
                            email: usersData[uid].email, // Assuming 'email' is the key for email in your data
                        }));
                        setUsers(usersWithEmail);
                    } else {
                        setUsers([]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching users:', error.message);
                });
        }
    }, [selectedRole]);

    return (
        <div className="p-4">
            <div className="mb-4">
                <label htmlFor="roleSelect" className="block text-gray-900 font-bold text-lg">
                    Select Role:
                </label>
                <select
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                >
                    <option value="">Select a role</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Agent">Agent</option>
                    {/* {roles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))} */}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="userSelect" className="block text-gray-900 font-bold text-lg">
                    Select User:
                </label>
                <select
                    id="userSelect"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
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
        </div>
    );
};

export default ResetPassword;
