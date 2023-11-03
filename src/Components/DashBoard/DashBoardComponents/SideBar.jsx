import { signOut, updatePassword } from "firebase/auth";
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { Button, Modal, TextInput, Label } from 'flowbite-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../../Authentication/firebase";

export default function SideBar() {

    // for logout popup
    const [openModal, setOpenModal] = useState(false);

    const [openModalReset, setOpenModalReset] = useState(false);


    const [mobile, setMobile] = useState(null);
    const [side, setSide] = useState(true);


    useEffect(() => {
        // Check if the screen width is less than a certain breakpoint (e.g., 768 pixels)
        const isMobile = window.innerWidth < 768;

        // Update the state only if it's different from the current state
        if (mobile !== isMobile) {
            setMobile(isMobile);
        }

    }, [mobile]);

    function handleSideClick() {
        setSide(!side);
    }

    // data

    const [user, setUser] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [role, setRole] = useState(null);


    const navigate = useNavigate();

    const handleLogOut = async () => {
        try {

            console.log("over");
            await signOut(auth);

            navigate('/login');

        } catch (error) {
            console.error("Error during logout:", error.message);
        }
    };

    const handleResetPassword = async () => {
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        
        const newPassword = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
    
        if (newPassword !== confirmPassword) {
            alert("Password and Confirm Password do not match. Please try again.");
            return;
        }
    
        if (auth.currentUser) {
            try {
                // Reauthenticate the user with their current email and password
                const user = auth.currentUser;
                const currentPassword = prompt("Please enter your current password:");
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
                await reauthenticateWithCredential(user, credential);
    
                // If reauthentication succeeds, update the password
                await updatePassword(user, newPassword);
                alert("Password reset successfully. Please log in with your new password.");
            } catch (error) {
                console.error("Error resetting password:", error.message);
                alert("Password reset failed.");
            }
        } else {
            alert("User not found.");
        }
        
        // Clear the password and confirm password fields
        passwordInput.value = "";
        confirmPasswordInput.value = "";
    };    


    const [currentUserID, setCurrentUserID] = useState(null);

    // the role of the user
    const [userRole, setUserRole] = useState(null);


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
                            console.log("triggeed");
                            setUserRole(role);
                            setUserEmail(user.email);
                            console.log(user.email);
                            setCurrentUserID(user.uid);

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

    return (
        <>
            <nav className="fixed top-0 z-50 w-full border-b bg-gray-800 border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm rounded-lg lg:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600">
                                <span className="sr-only">Open sidebar</span>
                                <svg onClick={handleSideClick} className="lg:hidden w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                            </button>
                            <div className="flex ml-2 md:mr-24">
                                <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 mr-3" alt="FlowBite Logo" />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-white">SUNVIBAL</span>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </nav>

            {/* for log out popup */}
            <Modal className="bg-gray-800 border-gray-700" dismissible show={openModal === true} onClose={() => setOpenModal(false)}>
                <Modal.Header>Logout</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Are you sure ? You want to logout
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="bg-gray-800 border-gray-700" onClick={handleLogOut}>Logout</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Stay In
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* reset button */}
            <Modal className="bg-gray-800 border-gray-700" dismissible show={openModalReset === true} onClose={() => setOpenModalReset(false)}>
                <Modal.Header>Reset Password</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Enter the new password</h3>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="password" value="Your password" />
                            </div>
                            <TextInput id="password" type="password" required />
                            <div className="mb-2 mt-2 block">
                                <Label htmlFor="confirmPassword" value="Confirm Password" />
                            </div>
                            <TextInput id="confirmPassword" type="password" required />
                        </div>
                        <div className="w-full">
                            <Button onClick={handleResetPassword}>Reset Password</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* desktop */}

            {/* w-80 */}
            <aside id="logo-sidebar" className="hidden lg:block fixed top-0 left-0 z-40 w-80 h-screen pt-20 transition-transform -translate-x-full border-r sm:translate-x-0 bg-gray-800 border-gray-700" aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li className="text-white mb-5"><p>Welcome,</p>
                            <br></br> {userEmail} <br></br>
                        </li>

                        {userRole !== "Admin" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                    </svg>
                                    <span className="ml-3">Dashboard</span>
                                </a>
                            </li>
                        }
                        {userRole !== "Admin" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard/commission-history" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                    </svg>
                                    <span className="ml-3">commission history</span>
                                </a>
                            </li>
                        }

                        <li>
                            <a href="/dashboard/menuUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Menu users</span>
                            </a>
                        </li>
                        <li>
                            <a href="/dashboard/coin" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">transfer points</span>
                            </a>
                        </li>

                        <li>
                            <a href="/dashboard/gameHistory" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Game history</span>
                            </a>
                        </li>

                        {userRole === "Player" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard/addusers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                                    </svg>

                                    <span className="flex-1 ml-3 whitespace-nowrap">Add users</span>
                                </a>
                            </li>
                        }

                        <li>
                            <a href="/dashboard/liveUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 17 20">
                                    <path d="M7.958 19.393a7.7 7.7 0 0 1-6.715-3.439c-2.868-4.832 0-9.376.944-10.654l.091-.122a3.286 3.286 0 0 0 .765-3.288A1 1 0 0 1 4.6.8c.133.1.313.212.525.347A10.451 10.451 0 0 1 10.6 9.3c.5-1.06.772-2.213.8-3.385a1 1 0 0 1 1.592-.758c1.636 1.205 4.638 6.081 2.019 10.441a8.177 8.177 0 0 1-7.053 3.795Z" />
                                </svg>

                                <span className="flex-1 ml-3 whitespace-nowrap">Live Users</span>
                            </a>
                        </li>

                        <li>
                            <a href="/dashboard/blockUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H6a2 2 0 0 0-2 2h14v12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                                    <path d="M14 4H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM2 16v-6h12v6H2Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Block users</span>
                            </a>
                        </li>
                        <li>
                            {/* <a href="/dashboard/resetPassword" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"> */}
                            <a href="#" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.5" d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="#1C274C" strokeWidth="1.5" />
                                    <path d="M12 10V14M10.2676 11L13.7317 13M13.7314 11L10.2673 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M6.73241 10V14M4.99999 11L8.46409 13M8.46386 11L4.99976 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M17.2681 10V14M15.5356 11L18.9997 13M18.9995 11L15.5354 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>

                                <span onClick={() => setOpenModalReset(true)} className="flex-1 ml-3 whitespace-nowrap">Reset Password</span>
                            </a>
                        </li>
                        {userRole!=="Admin" ? 
                        <div></div>
                    :
                    <li>
                    <a href="/dashboard/setBalance" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                    <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                                </svg>


                        <span className="flex-1 ml-3 whitespace-nowrap">Set Balance </span>
                    </a>
                </li>}
                        <li>
                            <a className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                                    <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                                    <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                                </svg>
                                <span onClick={() => setOpenModal(true)} className="flex-1 ml-3 whitespace-nowrap">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* mobile */}
            <aside className={`lg:hidden w-screen ${side ? 'hidden' : 'translate-x-0'}`}>
                <div className="h-screen w-[60%] px-3 pb-4 overflow-y-auto bg-gray-800">
                    <ul className="space-y-2 text-white font-medium mt-20">
                        {/* <li className="text-white"><p>Welcome, {user ? user : 'Guest'}</p></li> */}
                        <li>
                            <a href="#" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <li className="text-white"><p>Welcome,</p>
                                    <br></br> {userEmail} <br></br>
                                </li>
                            </a>
                        </li>

                        {userRole !== "Admin" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard" onClick={handleSideClick} className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                    </svg>
                                    <span className="ml-3">Dashboard</span>

                                </a>
                            </li>
                        }
                        {userRole !== "Admin" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard/commission-history" onClick={handleSideClick} className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                    </svg>
                                    <span className="ml-3">commission history</span>

                                </a>
                            </li>
                           
                        }
                        
                        {/* <li>
                            <a href="#" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Incoming <br></br>Coin Requests</span>
                                <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium rounded-full bg-gray-700 text-gray-300">2</span>
                            </a>
                        </li> */}
                        <li>
                            <a href="/dashboard/menuUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Menu users</span>
                            </a>
                        </li>
                        {/* <li>
                            <a href="/dashboard/users" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Users</span>
                            </a>
                        </li> */}
                        <li>
                            <a href="/dashboard/coin" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">transfer points</span>
                            </a>
                        </li>

                        <li>
                            <a href="/dashboard/gameHistory" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Game history</span>
                            </a>
                        </li>

                        {userRole === "Player" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard/addusers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                                    </svg>


                                    <span className="flex-1 ml-3 whitespace-nowrap">Add Users</span>
                                </a>
                            </li>
                        }

                        <li>
                            <a href="/dashboard/liveUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 17 20">
                                    <path d="M7.958 19.393a7.7 7.7 0 0 1-6.715-3.439c-2.868-4.832 0-9.376.944-10.654l.091-.122a3.286 3.286 0 0 0 .765-3.288A1 1 0 0 1 4.6.8c.133.1.313.212.525.347A10.451 10.451 0 0 1 10.6 9.3c.5-1.06.772-2.213.8-3.385a1 1 0 0 1 1.592-.758c1.636 1.205 4.638 6.081 2.019 10.441a8.177 8.177 0 0 1-7.053 3.795Z" />
                                </svg>

                                <span className="flex-1 ml-3 whitespace-nowrap">Live Users</span>
                            </a>
                        </li>

                        <li>
                            <a href="/dashboard/blockUsers" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H6a2 2 0 0 0-2 2h14v12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                                    <path d="M14 4H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM2 16v-6h12v6H2Z" />
                                </svg>
                                <span className="flex-1 ml-3 whitespace-nowrap">Block users</span>
                            </a>
                        </li>
                        <li>
                            {/* <a href="/dashboard/resetPassword" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"> */}
                            <a href="#" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.5" d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="#1C274C" strokeWidth="1.5" />
                                    <path d="M12 10V14M10.2676 11L13.7317 13M13.7314 11L10.2673 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M6.73241 10V14M4.99999 11L8.46409 13M8.46386 11L4.99976 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M17.2681 10V14M15.5356 11L18.9997 13M18.9995 11L15.5354 13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>

                                <span onClick={() => setOpenModalReset(true)} className="flex-1 ml-3 whitespace-nowrap">Reset Password</span>
                            </a>
                        </li>
                        {userRole !== "Admin" ?
                            <div></div>
                            :
                            <li>
                                <a href="/dashboard/setBalance" className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                    <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                                    </svg>


                                    <span className="flex-1 ml-3 whitespace-nowrap">Set Balance </span>
                                </a>
                            </li>
                        }
                        <li>
                            <a className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group">
                                <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                                    <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                                    <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                                </svg>
                                <span onClick={() => setOpenModal(true)} className="flex-1 ml-3 whitespace-nowrap">Logout</span>
                            </a>
                        </li>

                    </ul>
                </div>
            </aside>




        </>
    )
}