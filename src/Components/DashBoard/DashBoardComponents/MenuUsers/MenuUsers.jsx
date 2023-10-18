import { child, get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../../../../Authentication/firebase';
import { auth } from "../../../../Authentication/firebase";
import MenuUsersDist from './MenuUsersDist';
import MenuUsersAgent from './MenuUsersAgent';

export default function MenuUsers() {
    const [selectedOption, setSelectedOption] = useState('Distributor');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentAuthUser, setcurrentAuthUser] = useState('');

    // to find to role of current user
    useEffect(() => {
        // Set up an observer to listen for changes in authentication state
        const unsubscribe = auth.onAuthStateChanged(async (user) => {

            if (user) {
                try {
                    const snapshot = await get(ref(database));

                    const data = snapshot.val();

                    // Iterate through each role (admin, agent, dis, players)
                    for (const role in data) {
                        // Check if the UID exists in the current role
                        if (data[role][user.uid]) {
                            console.log(role);
                            setcurrentAuthUser(role);

                            console.log(role);
                            break;
                        }
                        else {
                            console.log("not found");
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data from Firebase:', error.message);
                }
            }
        });

        // Cleanup the observer on component unmount
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

                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching data from Firebase:', error.message);
            }
        };

        fetchData();
    }, [selectedOption]);

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

        const filteredUsers = users.filter((user) =>
            user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(searchTerm)
        );

        setSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to the first page when changing the search term
    };


    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const filteredUsers = users.filter((user) =>
        user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    let currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);


    const [dis, setDis] = useState({});
    const [agent, setAgent] = useState({});
    const [player, setPlayer] = useState({});

    useEffect(() => {
        const fetchEmails = async () => {
            const disData = {};
            const agentData = {};
            const playerData = {};

            await Promise.all(
                users.map(async (user) => {
                    let roleEmail1 = null;
                    let roleEmail2 = null;
                    let roleEmail3 = null;

                    if (selectedOption === 'Distributor') {
                        roleEmail1 = await getUserEmail('Admin', user.adminID);
                    } else if (selectedOption === 'Agent') {
                        roleEmail1 = await getUserEmail('Admin', user.adminID);
                        roleEmail2 = await getUserEmail('Distributor', user.distributorID);
                    } else if (selectedOption === 'Player') {
                        roleEmail1 = await getUserEmail('Admin', user.adminID);
                        roleEmail2 = await getUserEmail('Distributor', user.distributorID);
                        roleEmail3 = await getUserEmail('Agent', user.agentID);
                    }

                    // Set data for Distributor email
                    disData[user.userId] = roleEmail1;

                    // Set data for Agent email
                    agentData[user.userId] = roleEmail2;

                    // Set data for Player email
                    playerData[user.userId] = roleEmail3;
                })
            );

            setDis(disData);
            setAgent(agentData);
            setPlayer(playerData);
        };

        fetchEmails();
    }, [selectedOption, users]);

    const getUserEmail = async (role, uid) => {
        try {
            if (!uid) {
                console.error(`UID is undefined for role: ${role}`);
                return null; // or handle the case when UID is undefined
            }

            const userSnapshot = await get(ref(database, `${role}/${uid}`));

            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                return userData.email;
            } else {
                console.error(`${role} not found with UID:`, uid);
                return null; // or handle the case when user is not found
            }
        } catch (error) {
            console.error(`Error fetching ${role} data:`, error.message);
            return null; // or handle the error appropriately
        }
    };

    const [filterOptions, setFilterOptions] = useState({});

    const handleFilterChange = (columnName, value) => {
        console.log(`Filter Change: ${columnName} - ${value}`);
        setFilterOptions({ ...filterOptions, [columnName]: value });
    };


    const applyFilters = (user) => {
        const result = Object.keys(filterOptions).every((column) => {
            const filterValue = filterOptions[column]?.toLowerCase();
            const userColumnValue = user[column] && user[column].toString().toLowerCase();

            switch (selectedOption) {
                case 'Distributor':
                    return (
                        userColumnValue && userColumnValue.includes(filterValue) ||
                        dis[user.userId] && dis[user.userId].toLowerCase().includes(filterValue)
                    );
                case 'Agent':
                    return (
                        userColumnValue && userColumnValue.includes(filterValue) ||
                        dis[user.userId] && dis[user.userId].toLowerCase().includes(filterValue) ||
                        agent[user.userId] && agent[user.userId].toLowerCase().includes(filterValue)
                    );
                case 'Player':
                    return (
                        userColumnValue && userColumnValue.includes(filterValue) ||
                        dis[user.userId] && dis[user.userId].toLowerCase().includes(filterValue) ||
                        agent[user.userId] && agent[user.userId].toLowerCase().includes(filterValue) ||
                        player[user.userId] && player[user.userId].toLowerCase().includes(filterValue)
                    );
                default:
                    return userColumnValue && userColumnValue.includes(filterValue);
            }
        });

        console.log(`User ${user.email} passes filters: ${result}`);
        return result;
    };


    currentUsers = filteredUsers
        .filter(applyFilters)
        .slice(indexOfFirstItem, indexOfLastItem);


    return (
        <div>
            {currentAuthUser === "Admin" ?
                <div className="p-4">
                    <div className="w-full flex justify-end mt-4">
                        <a href='/dashboard/menuUsers/specific' className="bg-blue-500 text-white px-4 py-2 rounded">Search by Specific</a>
                    </div>
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
                            <option value="Admin">Admin</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Agent">Agent</option>
                            <option value="Player">Player</option>
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
                            placeholder="Search by email"
                        />
                    </div>

                    <table className='w-full border mb-10'>

                        <thead>
                            <tr>
                                <th className="p-3 border">
                                    <div className="filter-column">
                                        <label className="text-gray-700">Email:</label>
                                        <input
                                            type="text"
                                            value={filterOptions.email || ''}
                                            onChange={(e) => handleFilterChange('email', e.target.value)}
                                            className="ml-2 p-2 border rounded bg-gray-100 focus:outline-none focus:ring focus:border-blue-500"
                                            placeholder="Filter by Email"
                                        />
                                    </div>
                                </th>
                                <th className="p-3 border">
                                    <div className="filter-column">
                                        <label className="text-gray-700">Username:</label>
                                        <input
                                            type="text"
                                            value={filterOptions.userName || ''}
                                            onChange={(e) => handleFilterChange('userName', e.target.value)}
                                            className="ml-2 p-2 border rounded bg-gray-100 focus:outline-none focus:ring focus:border-blue-500"
                                            placeholder="Filter by Username"
                                        />
                                    </div>
                                </th>
                                <th className="p-3 border">
                                    <div className="filter-column">
                                        <label className="text-gray-700">Balance:</label>
                                        <input
                                            type="text"
                                            value={filterOptions.balance || ''}
                                            onChange={(e) => handleFilterChange('balance', e.target.value)}
                                            className="ml-2 p-2 border rounded bg-gray-100 focus:outline-none focus:ring focus:border-blue-500"
                                            placeholder="Filter by Balance"
                                        />
                                    </div>
                                </th>
                                {/* ... (other columns) */}
                            </tr>
                        </thead>
                    </table>


                    <table className="w-full border">

                        <thead>
                            <tr>
                                <th className="p-3 border">S.No</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border">Username</th>
                                <th className="p-3 border">Balance</th>
                                {selectedOption === 'Distributor' && <th className="p-3 border">Admin Email</th>}

                                {selectedOption === 'Agent' && <th className="p-3 border">Admin Email</th>}
                                {selectedOption === 'Agent' && <th className="p-3 border">Distributor Email</th>}

                                {selectedOption === 'Player' && <th className="p-3 border">Admin Email</th>}
                                {selectedOption === 'Player' && <th className="p-3 border">Distributor Email</th>}
                                {selectedOption === 'Player' && <th className="p-3 border">Agent Email</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={user.userId}>
                                    <td className="p-3 border">{indexOfFirstItem + index + 1}</td>
                                    <td className="p-3 border">{user.email}</td>
                                    <td className="p-3 border">{user.userName}</td>
                                    <td className="p-3 border">{user.balance}</td>
                                    {selectedOption === 'Distributor' && (
                                        <td className="p-3 border">{dis[user.userId]}</td>
                                    )}
                                    {selectedOption === 'Agent' && (
                                        <td className="p-3 border">{dis[user.userId]}</td>
                                    )}
                                    {selectedOption === 'Agent' && (
                                        <td className="p-3 border">{agent[user.userId]}</td>
                                    )}
                                    {selectedOption === 'Player' && (
                                        <td className="p-3 border">{dis[user.userId]}</td>
                                    )}
                                    {selectedOption === 'Player' && (
                                        <td className="p-3 border">{agent[user.userId]}</td>
                                    )}
                                    {selectedOption === 'Player' && (
                                        <td className="p-3 border">{player[user.userId]}</td>
                                    )}
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
                            {/* Centering the pagination buttons horizontally */}
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

                :

                currentAuthUser === "Distributor" ?

                    <div>
                        <MenuUsersDist />
                    </div>
                    :

                    <div>
                        <MenuUsersAgent />
                    </div>
            }
        </div>

    );



}
