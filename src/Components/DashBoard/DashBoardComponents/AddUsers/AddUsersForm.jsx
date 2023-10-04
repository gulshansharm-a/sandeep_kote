import { useState } from "react";
import { auth } from "../../../../Authentication/firebase"; // Assuming your firebase setup is in a file named firebase.js

export default function AddUsersForm() {
    const [email, setEmail] = useState(null);

    const handleSignInLink = async (e) => {
        e.preventDefault();
        
        try {
            const actionCodeSettings = {
                url: 'https://coin-wtv1.onrender.com', // Replace with your app's URL
                handleCodeInApp: true,
            };

            await auth.sendSignInLinkToEmail(email, actionCodeSettings);

            // Save the email to local storage
            window.localStorage.setItem('emailForSignIn', email);

            // Notify the user to check their email
            alert(`An email has been sent to ${email}. Please check your inbox to complete the sign-in process.`);

            // Optionally, you can redirect the user to a success page or show a success message
        } catch (error) {
            console.error("Error sending sign-in link:", error.message);
            // Handle error, show error message to the user, etc.
        }
    };

    return (
        <>
            <div>
                <h1 className="text-gray-900 text-[40px] uppercase font-bold">Add user</h1>
                <form onSubmit={handleSignInLink}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-900">Email</label>
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-900 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                            placeholder="name@flowbite.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="text-gray-900 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Register new account
                    </button>
                </form>
            </div>
        </>
    );
}
