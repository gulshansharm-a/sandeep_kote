import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set, get } from 'firebase/database';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../../Auth/firebase";

export default function AddUsersForm() {
    const navigate = useNavigate();

    // the role of the user
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState("null");

    const [isAdmin, setIsAdmin] = useState(false);

    const [distributerID, setDistributorID] = useState("null")


    const [selectedRole, setRoles] = useState([]);  // Initialize roles state

    useEffect(() => {
        // Set up an observer to listen for changes in authentication state
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setUser(user);

            console.log(user.displayName);

            if (user.displayName === null) {
                setUser("Admin");
                setRoles("Distributor");
                console.log("done");
            }
            else if (user.displayName === "Distributor") {
                setDistributorID((user.uid))
                console.log(user.uid);
                setRoles("Agent");
                console.log("triggerd");
                setUser("Distributer");
                console.log("done");
            }
            else if (user.displayName === "Agent") {
                console.log("this is a agent");
                setIsAdmin(true);
                alert("No accesss");
                navigate('/dashboard');
            }
        });

        // Cleanup the observer on component unmount
        return () => unsubscribe();
    }, []);

    // console.log(distributerID);


    // else {
    //     roles = ["Agent"]
    // }

    // console.log(roles);

    const [email, setEmail] = useState(null);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState("sandeepKote");
    const [username, setUsername] = useState("sandeepKote");

    const [openModal, setOpenModal] = useState(false);


    const [currentIndex, setCurrentIndex] = useState(0);
    // const [selectedRole, setselectedRole] = useState(roles[currentIndex])

    console.log(selectedRole);


    const [isLoading, setIsLoading] = useState(false);

    // to get the uid of the current authenticated user
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user.uid);
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);



    const handleSignUp = async () => {
        try {
            setIsLoading(true);

            // Use the auth object directly from your imported configuration
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(userCredential.user, {
                displayName: selectedRole, // Replace with the desired display name
            });

            const userId = userCredential.user.uid;

            let userData = {
                uid: userId,
            }

            if (selectedRole === "Agent") {

                console.log("selectedRole === Agent");
                // Fetch the distributor's name from the database using the UID
                const distributorRef = ref(database, `Distributor/${currentUser}`);
                const distributorSnapshot = await get(distributorRef);

                if (distributorSnapshot.exists()) {
                    const distributorData = distributorSnapshot.val();
                    userData = {
                        uid: userId,
                        distributor: currentUser, // Use the current user's UID
                        distributorName: Object.keys(distributorData), // Replace 'name' with the actual field name in your database
                    };
                }
            }

            const userRef = ref(database, `${selectedRole}/${username}`);
            await set(userRef, userData);


            let userdbdata = {
                uid: userId,
                email: userCredential.user.email,
                balance: 1000,
                role: selectedRole
            }

            const userdb = ref(database, `users/${user.uid}`);
            await set(userdb, userdbdata);

            setOpenModal(true);
            setSuccess(true);

        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const [success, setSuccess] = useState(false);

    return (
        <>
            {isLoading ? <div>
                LOADING
            </div>
                : isAdmin ?  <div>no accesss</div>:
                <div>
                    <h1 className="text-gray-900 text-[40px] uppercase font-bold">Add user</h1>
                    <form onSubmit={(e) => {
                        e.preventDefault(); // Prevent the default form submission behavior
                        handleSignUp(); // Call your login function
                    }}>
                        <div className="mb-6">
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                                User name
                            </label>
                            <input
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                id="email"
                                className="shadow-sm bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                placeholder="user"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">
                                Email
                            </label>
                            <input
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                className="shadow-sm bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-grey-900">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-white sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required=""
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>


                        {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900">Role</label> */}
                        {/* <label htmlFor="countires" className="mt-7 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">
                            Role
                        </label> */}
                        {/* <select
                            onChange={handleRoleChange}
                            value={roles[currentIndex]}
                            id="countries"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {roles.map((role) => (
                                <option key={role}>{role}</option>
                            ))}
                        </select> */}


                        <button
                            type="submit"
                            className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Add as an {selectedRole}
                        </button>


                    </form>

                    {success && openModal ?
                        <div id="toast-success" className="mt-10 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                </svg>
                                <span className="sr-only">Check icon</span>
                            </div>
                            <div className="ml-3 text-sm font-normal">{username} added as {selectedRole}</div>
                            <button onClick={() => { setOpenModal(false) }} type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                        : <div>
                        </div>}


                </div>



            }
        </>
    );
}