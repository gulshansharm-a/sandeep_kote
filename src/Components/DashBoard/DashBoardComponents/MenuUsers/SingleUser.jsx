import React, { useEffect, useState } from 'react';
import { child, get, ref } from 'firebase/database';
import { database } from "../../../../Authentication/firebase";

const SingleUser = ({ selectedEmail, selectedRole }) => {
    const [subUsers, setSubUsers] = useState([]);

    useEffect(() => {
        const fetchSubUsers = async () => {
            try {
                let snapshot;

                // Fetch sub-users based on the selected role and email
                switch (selectedRole) {
                    case 'Agent':
                        snapshot = await get(child(ref(database), 'Player'));
                        break;
                    // Add other cases based on your requirements

                    default:
                        // Handle default case or throw an error
                        throw new Error(`Unhandled role: ${selectedRole}`);
                }

                const subUsersData = Object.entries(snapshot.val())
                    .filter(([userId, userData]) => userData.agentID === selectedEmail)
                    .map(([userId, userData]) => ({
                        ...userData,
                        userId,
                    }));

                setSubUsers(subUsersData);
            } catch (error) {
                console.error('Error fetching sub-users from Firebase:', error.message);
            }
        };

        if (selectedEmail && selectedRole) {
            fetchSubUsers();
        }
    }, [selectedEmail, selectedRole]);

    return (
        <div>
            <h2>Sub-Users under {selectedEmail}</h2>
            <ul>
                {subUsers.map((subUser) => (
                    <li key={subUser.userId}>
                        {/* Display sub-user details as needed */}
                        <p>Email: {subUser.email}</p>
                        <p>Username: {subUser.userName}</p>
                        <p>Balance: {subUser.balance}</p>
                        {/* Add other details you want to display */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SingleUser;
