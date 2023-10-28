import React, { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

const CommissionHistory = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState(["Distributor", "Agent"]);
    const [users, setUsers] = useState([]);
    const [commissionHistory, setCommissionHistory] = useState([]);
    const database = getDatabase(); // Initialize your Firebase Realtime Database instance

    const fetchUsersForRole = (role) => {
        if (role) {
            const usersRef = ref(database, `${role}`);
            // console.log(usersRef);
            get(usersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        console.log("user are there");
                        setUsers(Object.keys(snapshot.val()));
                    } else {
                        console.log("user are not there");
                        setUsers([]); // No users for the selected role
                    }
                })
                .catch((error) => {
                    console.error('Error fetching users:', error.message);
                });
        }
    };

    const fetchCommissionHistory = (user) => {
        if (user) {
            const userRef = ref(database, `${selectedRole}/${user}/commissionHistory`);
            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setCommissionHistory(Object.values(snapshot.val()));
                    } else {
                        setCommissionHistory([]); // No commission history for the selected user
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
                // Fetch users when a role is selected
                fetchUsersForRole(e.target.value);
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
                // Fetch commission history when a user is selected
                fetchCommissionHistory(e.target.value);
              }}
              className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
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
