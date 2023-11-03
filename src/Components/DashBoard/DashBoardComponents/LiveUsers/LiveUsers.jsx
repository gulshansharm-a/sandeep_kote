import React, { useEffect, useState } from 'react';
import { child, get, ref } from 'firebase/database';
import { auth } from '../../../../Authentication/firebase';
import { database } from '../../../../Authentication/firebase';

export default function LiveUsers() {
    const [selectedOption, setSelectedOption] = useState('Player');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentAuthUser, setcurrentAuthUser] = useState('');
    const [options, setOptions] = useState(['Player']);

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

                const usersData = Object.entries(snapshot.val() || {}).map(([userId, userData]) => ({
                    ...userData,
                    userId,
                    role: selectedOption,
                }));

                const playerUIDs = await fetchPlayerUIDs();

                const filteredUsers = usersData.filter((user) => {
                    return playerUIDs.includes(user.userId);
                });

                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching data from Firebase:', error.message);
            }
        };

        fetchData();
    }, [selectedOption, currentAuthUser]);

    const fetchPlayerUIDs = async () => {
        try {
            const betSnapshot = await get(child(ref(database), 'bet'));
            const playerUIDs = Object.keys(betSnapshot.val() || {});
            return playerUIDs;
        } catch (error) {
            console.error('Error fetching player UIDs from Firebase:', error.message);
            return [];
        }
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
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const filteredUsers = users.filter((user) =>
        user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <div className='flex flex-row mt-20 m-5 place-items-center'>
                <div className='rounded-full h-2 w-2 bg-red-700 ml-2 mr-5 animate-ping'></div>
                <h1 className="text-3xl font-bold text-gray-800">Live Users</h1>
            </div>

            <div className="p-4">
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
                        placeholder="Search Players"
                    />
                </div>
                {filteredUsers.length === 0 ? (
                    <div className="bg-gray-800 p-5 rounded-lg">
                        <p className="text-white">No Live Users</p>
                    </div>
                ) : (
                    <table className="w-full border mb-10">
                        <thead className='text-white bg-gray-800'>
                            <tr>
                                <th className="p-3 border">S.No</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border">Username</th>
                                <th className="p-3 border">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={user.userId}>
                                    <td className="p-3 border">{indexOfFirstItem + index + 1}</td>
                                    <td className="p-3 border">{user.email}</td>
                                    <td className="p-3 border">{user.userName}</td>
                                    <td className="p-3 border">{user.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
