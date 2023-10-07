import { useEffect, useState } from 'react';
import { ref, get, child } from 'firebase/database';
import UserCard from './UserCard';
import { database, auth } from '../../../../Authentication/firebase';

export default function UserCardList() {
    const [userRole, setUserRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
                            // You found the role, update your state or do whatever you need
                            console.log('User Role:', role);
                            setUserRole(role);
                            setCurrentUserID(user.uid);
                            break;
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
                if (!userRole) {
                    // If userRole is not yet set, return
                    return;
                }

                if (userRole === 'Admin') {
                    // If the user is an admin, fetch all distributors directly
                    const snapshot = await get(child(ref(database), 'Distributor'));
                    const distributors = Object.entries(snapshot.val())
                        .map(([distributorId, distributorData]) => ({
                            ...distributorData,
                            userId: distributorId,
                            role: 'Distributor',
                        }));

                    setUsers(distributors);
                } else if (userRole === 'Distributor') {
                    // If the user is a distributor, fetch agents under that distributor
                    const distributorId = currentUserID; // Replace with the actual distributor ID
                    const snapshot = await get(child(ref(database), userRole));
                    const agents = Object.entries(snapshot.val())
                        .flatMap(([agentId, agentData]) => {
                            if (agentData.distributerID === distributorId) {
                                return {
                                    ...agentData,
                                    userId: agentId,
                                    role: 'Agent',
                                };
                            }
                            return [];
                        });

                    setUsers(agents);
                }
                // Add similar logic for other roles if needed

            } catch (error) {
                console.error('Error fetching data from Firebase:', error.message);
            }
        };

        fetchData();
    }, [userRole, currentUserID]);

     // Paginate the user list
     const indexOfLastItem = currentPage * itemsPerPage;
     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
     const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
 
     const paginate = (pageNumber) => setCurrentPage(pageNumber);
 
     return (
         <div>
             {currentUsers.map((user) => (
                 <UserCard key={user.userId} {...user} />
             ))}
 
             {/* Pagination buttons */}
             <div className='flex flex-row gap-3'>
                 {Array.from({ length: Math.ceil(users.length / itemsPerPage) }).map((_, index) => (
                     <button key={index} onClick={() => paginate(index + 1)} className='bg-blue-500 rounded-sm p-3 mr-4'>
                         {index + 1}
                     </button>
                 ))}
             </div>
         </div>
     );
}
