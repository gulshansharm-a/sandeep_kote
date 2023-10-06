import { useState, useEffect } from "react";
// import { auth } from "../DashBoard/Firebase"; // Update the path based on your project structure
// import { createUserWithEmailAndPassword} from "firebase/auth";
import { useNavigate } from "react-router-dom";
// import { getFirestore, doc, setDoc } from "firebase/firestore";
// import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
export default function SignUp() {

    const roles = ["Admin", "Distributor", "Agent"];

    const [currentIndex, setCurrentIndex] = useState(1);
    const [currentRole, setCurrentRole] = useState(roles[currentIndex]);
    const imgUrl = [
        "https://res.cloudinary.com/dzhdarh4q/image/upload/v1696256406/Project2_coin/image-removebg-preview_12_cfs2hp.png",
        "https://res.cloudinary.com/dzhdarh4q/image/upload/v1696256406/Project2_coin/image-removebg-preview_11_xkljfu.png",
        "https://res.cloudinary.com/dzhdarh4q/image/upload/v1696254768/Project2_coin/COIN1_u5yrcs.png"
    ];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentRole(roles[currentIndex]);
    }, [currentIndex]);

    const homeImgSrc = imgUrl[currentIndex];

    function roleChangeInLogin(index) {
        setCurrentIndex(index);
    }

    const navigate = useNavigate();
    const handleSignUp = async () => {
        try {
          const { user } = await createUserWithEmailAndPassword(auth, email, password);
          console.log('User created:', user);
    
          // Add user information to Firestore
          const usersCollection = collection(db, 'users');
          const userDocRef = doc(usersCollection, user.uid);
    
          await setDoc(userDocRef, {
            uid: user.uid,
            email: email,
            balance: 1000, // Initial balance
          });
    
          console.log('User details added to Firestore');
    
          alert('Account created successfully!');
        } catch (error) {
          console.error('Error signing up:', error.message);
          alert(`Error: ${error.message}`);
        }
      };
    // const handleSignUp = async () => {
    //     try {
    //       setIsLoading(true);
      
    //       // Check if passwords match
    //       if (password !== confirmPassword) {
    //         setError("Passwords do not match");
    //         console.log("notttt");
    //         return;
    //       }
      
    //       // Use the auth object directly from your imported configuration
    //       const userCredential = await createUserWithEmailAndPassword(
    //         auth,
    //         email,
    //         password
    //       );
      
    //       // Access the user's UID
    //       const uid = userCredential.user.uid;
      
    //       // Set user role in Firestore under the corresponding collection
    //       const firestore = getFirestore();
    //       const userRole = currentRole;
    //       const userDocRef = doc(firestore, "User", uid);
      
    //       // Set the document data
    //       await setDoc(userDocRef, {
    //         email: email,
    //         role: userRole,
    //       });
      
    //       // Signup successful, you can redirect to the dashboard or do other actions
    //       navigate('/dashboard');
    //     } catch (error) {
    //       setError(error.message);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };

    
    return (
        <>
        {isLoading ? <div>
                LOADING
            </div>
                :
                <div className="lg:h-screen h-[1000px] w-screen p-3 bg-gray-800">
                    <div className={`${currentIndex === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} overflow-hidden lg:flex lg:flex-row flex-col-reverse h-full w-full flex items-center justify-center bg-gray-900 rounded-[20px]`}>
                        {/* left */}
                        <div className="overflow-hidden lg:w-3/5 h-full flex justify-center place-items-top lg:place-items-center bg-gray-900 rounded-[20px]">
                            <img
                                src={homeImgSrc}
                                alt="left"
                                className="h-[80%] object-contain lg:object-center object-top"
                            />
                        </div>

                        {/* right */}
                        <div className="lg:w-2/5 w-full ml-10 mr-10 bg-gray-900 rounded-[20px]">
                            <section className="bg-gray-900">
                                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-full lg:py-0">
                                    <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white">
                                        <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                                        COIN
                                    </a>
                                    <div className="w-full bg-white rounded-lg shadow lg:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                        <div className="p-6 space-y-4 lg:space-y-6 sm:p-8">
                                            {/* <h1 className="text-[25px] text-white">{currentRole}</h1> */}
                                            <h1 className="text-xl font-bold leading-tight tracking-tight text-white lg:text-2xl">
                                                {currentRole} SignUp
                                            </h1>
                                            <form className="space-y-4 lg:space-y-6" onSubmit={(e) => {
                                                e.preventDefault(); // Prevent the default form submission behavior
                                                handleSignUp(); // Call your login function
                                            }}>
                                                <div>
                                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Your email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="name@company.com"
                                                        required=""
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        placeholder="••••••••"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        required=""
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="confirmpassword" className="block mb-2 text-sm font-medium text-white">Password</label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        placeholder="••••••••"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        required=""
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start">
                                                        <div className="flex items-center h-5">
                                                            <input
                                                                id="remember"
                                                                aria-describedby="remember"
                                                                type="checkbox"
                                                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                                                required=""
                                                            />
                                                        </div>
                                                        <div className="ml-3 text-sm">
                                                            <label htmlFor="remember" className="text-gray-500">Remember me</label>
                                                        </div>
                                                    </div>
                                                    <a href="#" className="text-sm font-medium text-primary-600 hover:underline">Forgot password?</a>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                >
                                                    Sign Up
                                                </button>
                                                {error && <p style={{ color: "red" }}>{error}</p>}
                                                <p className="flex flex-row gap-10">
                                                    {roles.map((role, index) => (
                                                        <a onClick={() => roleChangeInLogin(index)} key={index} className={`flex flex-row ${currentIndex === index ? 'hidden' : 'font-bold text-blue-500'}`}>
                                                            {role} ?
                                                        </a>

                                                    ))}
                                                </p>
                                                <p className="text-sm font-light text-gray-500">
                                                    Already have an account? <a href="/login" className="font-medium text-primary-600 hover:underline"> login in</a>
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            }
        </>
        // <div className="h-screen w-screen p-3 bg-gray-800">
        //     <div className={`${currentIndex === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:flex lg:flex-row flex-col-reverse h-full w-full flex items-center justify-center bg-gray-900 rounded-[20px]`}>
        //         {/* left */}
        //         <div className="lg:w-3/5 h-full flex justify-center place-items-top lg:place-items-center bg-gray-900 rounded-[20px]">
        //             <img
        //                 src={homeImgSrc}
        //                 alt="left"
        //                 className="h-[80%] object-contain lg:object-center object-top"
        //             />
        //         </div>

        //         {/* right */}
        //         <div className="lg:w-2/5 w-full ml-10 mr-10 bg-gray-900 rounded-[20px]">
        //             <section className="bg-gray-900">
        //                 <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-full lg:py-0">
        //                     <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white">
        //                         <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
        //                         COIN
        //                     </a>
        //                     <div className="w-full bg-white rounded-lg shadow lg:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        //                         <div className="p-6 space-y-4 lg:space-y-6 sm:p-8">
        //                             {/* <h1 className="text-[25px] text-white">{currentRole}</h1> */}
        //                             <h1 className="text-xl font-bold leading-tight tracking-tight text-white lg:text-2xl">
        //                                 {currentRole} Sign up
        //                             </h1>
        //                             <form className="space-y-4 lg:space-y-6" action="#"
        //                                 onSubmit={(e) => {
        //                                     e.preventDefault(); // Prevent the default form submission behavior
        //                                     handleSignUp(e); // Pass the event object to handleSignUp
        //                                 }}>
        //                                 <div>
        //                                     <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Your email</label>
        //                                     <input
        //                                         type="email"
        //                                         name="email"
        //                                         id="email"
        //                                         className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        //                                         placeholder="name@company.com"
        //                                         required=""
        //                                         onChange={(e) => setEmail(e.target.value)}
        //                                     />
        //                                 </div>
        //                                 <div>
        //                                     <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
        //                                     <input
        //                                         type="password"
        //                                         name="password"
        //                                         id="password"
        //                                         placeholder="••••••••"
        //                                         className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        //                                         required=""
        //                                         onChange={(e) => setPassword(e.target.value)}
        //                                     />
        //                                 </div>
        //                                 <div>
        //                                     <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
        //                                     <input
        //                                         type="password"
        //                                         name="password"
        //                                         id="password"
        //                                         placeholder="••••••••"
        //                                         className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        //                                         required=""
        //                                         onChange={(e) => setConfirmPassword(e.target.value)}
        //                                     />
        //                                 </div>

        //                                 <button
        //                                     type="submit"
        //                                     className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        //                                 >
        //                                     Sign Up
        //                                 </button>
        //                                 <p className="flex flex-row gap-10">
        //                                     {roles.map((role, index) => (
        //                                         <a onClick={() => roleChangeInLogin(index)} key={index} className={`flex flex-row ${currentIndex === index ? 'hidden' : 'font-bold text-blue-500'}`}>
        //                                             {role} ?
        //                                         </a>

        //                                     ))}
        //                                 </p>
        //                                 <p className="text-sm font-light text-gray-500">
        //                                     Already have an account? <a href="/login" className="font-medium text-primary-600 hover:underline">Log in</a>
        //                                 </p>
        //                             </form>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </section>
        //         </div>
        //     </div>
        // </div>
    );
}