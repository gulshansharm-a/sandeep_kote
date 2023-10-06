import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth, database } from "../../../Auth/firebase";
import UserCard from './UserCard';

const Users = () => {
    const [distributors, setDistributors] = useState([]);
    const [userCards, setUserCards] = useState([]);

    useEffect(() => {
        const fetchDistributors = async () => {
            try {
                const distributorsRef = ref(database, 'Agent');
                const snapshot = await get(distributorsRef);

                if (snapshot.exists()) {
                    const distributorsData = snapshot.val();
                    const distributorNames = Object.keys(distributorsData);
                    setDistributors(distributorNames);
                } else {
                    console.log('No data found under Distributor');
                }
            } catch (error) {
                console.error('Error getting Distributor data:', error.message);
            }
        };

        const renderUserCards = async () => {
            const cards = [];
            for (const distributorName of distributors) {
                const userRef = ref(database, `Agent/${distributorName}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val();

                // console.log(userData);

                // console.log(distributors);

                cards.push(
                    <UserCard
                        key={distributorName}
                        distributorName={distributorName}
                        email={userData?.email}
                    />
                );
            }
            setUserCards(cards);
        };

        fetchDistributors();
        renderUserCards();
    }, [distributors]); // Dependency on distributors to trigger rendering when it changes

    return (
        <>
            <div className="ml-10 mt-20 w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">

                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-white ">Agents</h5>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        View all
                    </a>
                </div>
                {userCards}
            </div>
        </>
    );
};

export default Users;
