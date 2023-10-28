import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

const CommissionHistory = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState(["Distributor", "Agent"]);
    const [users, setUsers] = useState([]);
    const [commissionHistory, setCommissionHistory] = useState([]);
    const database = getDatabase(); // Initialize your Firebase Realtime Database instance

    useEffect(() => {
        fetchUsersForRole(selectedRole);
    }, [selectedRole]);

    const fetchUsersForRole = (role) => {
        if (role) {
            const usersRef = ref(database, `${role}`);
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

    return (
        <div className="p-4">
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
                fetchCommissionHistory(e.target.value);
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
          <div>
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
                {commissionHistory.map((historyItem, index) => (
                  <tr key={index}>
                    <td className="p-3 border">{historyItem.Endpoint}</td>
                    <td className="p-3 border">{historyItem.com}</td>
                    <td className="p-3 border">{historyItem.t_s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
};

export default CommissionHistory;
