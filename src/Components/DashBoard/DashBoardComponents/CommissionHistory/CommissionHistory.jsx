import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import SelectOption from '@material-tailwind/react/components/Select/SelectOption';

// Utility function to parse timestamp
const parseTimestamp = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    try {
        const [datePart, timePart] = timestamp.split(' - ');
        const [day, month, year] = datePart.split('/');
        const [hoursMinutes, timeZone] = timePart.split(' ');

        const [hours, minutes] = hoursMinutes.split(':');

        // Replace IST with the actual offset +5:30
        const adjustedTimeZone = timeZone.replace('IST', '+5:30');

        // Adjust the format to "MM/DD/YYYY HH:mm TZ"
        const parsedDate = new Date(`${month}/${day}/${year} ${hours}:${minutes} ${adjustedTimeZone}`);

        if (isNaN(parsedDate.getTime())) {
            console.error("Invalid Date Format:", timestamp);
            return null;
        }

        return parsedDate;
    } catch (error) {
        console.error("Error parsing timestamp:", error.message);
        return null;
    }
};

const CommissionHistory = () => {
    const [selectedRole, setSelectedRole] = useState('Agent');
    const [selectedUser, setSelectedUser] = useState('');
    const [roles, setRoles] = useState(["Distributor", "Agent"]);
    const [users, setUsers] = useState([]);
    const [commissionHistory, setCommissionHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageTotals, setPageTotals] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedTimeRange, setSelectedTimeRange] = useState('');
    const database = getDatabase();

    const calculatePageTotal = (currentPageHistory) => {
        return currentPageHistory.reduce((total, historyItem) => {
            return total + parseFloat(historyItem.com);
        }, 0);
    };

    useEffect(() => {
        fetchUsersForRole(selectedRole);
    }, [selectedRole]);

    useEffect(() => {
        if (selectedUser) {
            fetchCommissionHistory(selectedUser, selectedTimeRange);
        }
    }, [selectedUser, selectedTimeRange]);


    const fetchUsersForRole = (role) => {
        if (role) {
            const usersRef = ref(database, role);
            get(usersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const userArray = Object.keys(userData).map((uid) => ({
                            uid,
                            email: userData[uid].email,
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

    const fetchCommissionHistory = (uid, timeRange) => {
        if (uid) {
            const userRef = ref(database, `${selectedRole}/${uid}/commissionHistory`);
            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const historyData = Object.values(snapshot.val());
                        const filteredHistory = filterHistoryByTimeRange(historyData, timeRange);
                        setCommissionHistory(filteredHistory);
                    } else {
                        setCommissionHistory([]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching commission history:', error.message);
                });
        }
    };

    const filterHistoryByTimeRange = (historyData, timeRange) => {
        const currentDate = new Date();

        switch (timeRange) {
            case 'today':
                return historyData.filter((historyItem) => {
                    const itemDate = parseTimestamp(historyItem.t_s);
                    return isSameDay(itemDate, currentDate);
                });
            case 'yesterday':
                const yesterday = new Date(currentDate);
                yesterday.setDate(currentDate.getDate() - 1);
                return historyData.filter((historyItem) => isSameDay(parseTimestamp(historyItem.t_s), yesterday));
            case 'thisWeek':
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                return historyData.filter((historyItem) => parseTimestamp(historyItem.t_s) >= startOfWeek);
            case 'lastTwoWeeks':
                const startOfLastTwoWeeks = new Date(currentDate);
                startOfLastTwoWeeks.setDate(currentDate.getDate() - 14);
                return historyData.filter((historyItem) => parseTimestamp(historyItem.t_s) >= startOfLastTwoWeeks);
            case 'thisMonth':
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                return historyData.filter((historyItem) => parseTimestamp(historyItem.t_s) >= startOfMonth);
            case 'lastTwoMonths':
                const startOfLastTwoMonths = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                return historyData.filter((historyItem) => parseTimestamp(historyItem.t_s) >= startOfLastTwoMonths);
            default:
                return historyData;
        }
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) {
            return false;
        }

        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const filteredCommissionHistory = commissionHistory.filter((historyItem) => (
        (typeof historyItem.Endpoint === 'string' && historyItem.Endpoint.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof historyItem.com === 'string' && historyItem.com.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof historyItem.t_s === 'string' && historyItem.t_s.toLowerCase().includes(searchTerm.toLowerCase()))
    ));

    const sortedCommissionHistory = filteredCommissionHistory.sort((a, b) => {
        const timestampA = parseTimestamp(a.t_s);
        const timestampB = parseTimestamp(b.t_s);

        if (timestampA && timestampB) {
            return timestampB - timestampA;
        } else {
            return 0;
        }
    });

    const currentCommissionHistory = sortedCommissionHistory.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const pageTotalsArray = Array.from({ length: Math.ceil(sortedCommissionHistory.length / rowsPerPage) }).map((_, index) => {
            const pageStartIndex = index * rowsPerPage;
            const pageEndIndex = pageStartIndex + rowsPerPage;
            const currentPageHistory = sortedCommissionHistory.slice(pageStartIndex, pageEndIndex);
            return calculatePageTotal(currentPageHistory);
        });
    
        setPageTotals(pageTotalsArray);
    }, [sortedCommissionHistory, rowsPerPage]);       
    
    useEffect(() => {
        const calculatedGrandTotal = pageTotals.reduce((total, pageTotal) => {
            return total + pageTotal;
        }, 0);
        setGrandTotal(calculatedGrandTotal);
    }, [pageTotals]);

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
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="userSelect" className="block text-gray-900 font-bold text-lg">
                        Select {selectedRole}:
                    </label>
                    <select
                        id="userSelect"
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.target.value);
                        }}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    >
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
                        placeholder="Search"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="timeRangeSelect" className="block text-gray-900 font-bold text-lg">
                        Select Time Range:
                    </label>
                    <select
                        id="timeRangeSelect"
                        value={selectedTimeRange}
                        onChange={(e) => {
                            setSelectedTimeRange(e.target.value);
                        }}
                        className="mt-1 p-2 border rounded w-full focus:outline-none focus:ring focus:border-blue-500"
                    >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="thisWeek">This Week</option>
                        <option value="lastTwoWeeks">Last 2 weeks</option>
                        <option value="thisMonth">This month</option>
                        <option value="lastTwoMonths">Last 2 month</option>
                        {/* Add other time range options */}
                    </select>
                </div>

                <h2 className="text-2xl font-bold mb-4">Commission History</h2>
                {filteredCommissionHistory.length > 0 ? (
                    <table className="w-full border">
                        <thead>
                            <tr className='text-white bg-gray-800'>
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
                        {grandTotal > 0 && (
                            <tfoot>
                                <tr className='text-white bg-gray-800'>
                                    <td className="p-3 border">Page Total:</td>
                                    <td className="p-3 border">{pageTotals[currentPage - 1]?.toFixed(2)}</td>
                                    <td className="p-3 border"></td>
                                </tr>
                                <tr className='text-white'>
                                    <td className="p-3 border bg-gray-800">Grand Total:</td>
                                    <td className="p-3 border bg-gray-800">{grandTotal.toFixed(2)}</td>
                                    <td className="p-3 border bg-gray-800"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                ) : (
                    <div className='bg-gray-800 p-5 rounded-lg'>
                        <p className='text-white'>No commision history</p>
                    </div>
                )}
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
                    {filteredCommissionHistory.length > rowsPerPage && (
                        <div className="mt-2 flex justify-center space-x-2">
                            {Array.from({ length: Math.ceil(filteredCommissionHistory.length / rowsPerPage) }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`${currentPage === index + 1
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-200 hover-bg-gray-300'
                                        } p-2 border rounded focus:outline-none focus:ring focus:border-blue-500`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default CommissionHistory;
