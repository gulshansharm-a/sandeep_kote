import { createUserWithEmailAndPassword } from "firebase/auth";
import { get, ref, set } from 'firebase/database';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../../../Authentication/firebase";

export default function AddUsersForm() {
    const navigate = useNavigate();

    // user name of the user
    const [userName, setUserName] = useState(null);

    // id of the user
    const [currentUserID, setCurrentUserID] = useState(null);

    // the role of the user
    const [userRole, setUserRole] = useState(null);

    // user that can be created
    const [createUserRole, setCreateUserRole] = useState(null);

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
                            console.log(user.uid);
                            console.log(createUserRole);

                            console.log(role);
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data from Firebase:', error.message);
                }

                if (userRole === "Admin") {
                    setCreateUserRole("Distributor");
                }
                else if (userRole === "Distributor") {
                    setCreateUserRole("Agent");
                }
                else if (userRole === "Agent") {
                    setCreateUserRole("Player");
                }
            }
        });

        // Cleanup the observer on component unmount
        return () => unsubscribe();
    }, [userRole]);

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [username, setUsername] = useState(null);

    const [openModal, setOpenModal] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        try {
          setIsLoading(true);
      
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
          let userData = {
            userName: username,
            email: email,
            pass: password,
          };
      
          if (createUserRole === "Distributor") {
            userData = {
              userName: username,
              email: email,
              pass: password,
              balance: 1000,
              adminID: currentUserID,
            };
          } else if (createUserRole === "Agent") {
            const distRef = ref(database, `Distributor/${currentUserID}`);
            const disSnapshot = await get(distRef);
      
            if (disSnapshot.exists()) {
              const disData = disSnapshot.val();
              userData = {
                ...userData,
                distributerID: currentUserID,
                adminID: disData.adminID,
              };
            }
          } else if (createUserRole === "Player") {
            const agentRef = ref(database, `Agent/${currentUserID}`);
            const agentSnapshot = await get(agentRef);
      
            if (agentSnapshot.exists()) {
              const agentData = agentSnapshot.val();
              userData = {
                ...userData,
                agentID: currentUserID,
                distributerID: agentData.distributerID,
                adminID: agentData.adminID,
              };
            } else {
              // Handle the case when the agent node doesn't exist
              console.error('Agent node not found');
            }
          }
      
          const userRef = ref(database, `${createUserRole}/${userCredential.user.uid}`);
          await set(userRef, userData);
      
          const timer = setTimeout(() => {
            // Reload the page
            window.location.reload();
          }, 2000);
      
          timer();
      
          setOpenModal(true);
          setSuccess(true);
        } catch (error) {
          console.error('Error during user registration:', error);
          // Handle the error, set an error message, etc.
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
            :
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
                            id="username"
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

                    <button
                        type="submit"
                        className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Add as an {createUserRole}
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
                        <div className="ml-3 text-sm font-normal">{username} added as {createUserRole}</div>
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