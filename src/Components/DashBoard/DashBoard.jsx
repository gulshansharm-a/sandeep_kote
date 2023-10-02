import { auth } from "../../Authentication/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import DashBoardUI from "./DashBoardComponents/DashBoardUI";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [adminName, setAdminName] = useState(null);

  useEffect(() => {
    // Set up an observer to listen for changes in authentication state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        // If the user is authenticated, fetch additional information from Firestore
        const firestore = getFirestore();
        const adminDocRef = doc(firestore, "Admin", user.uid);

        console.log(user.uid);

        try {
          const adminDocSnapshot = await getDoc(adminDocRef);

          if (adminDocSnapshot.exists()) {
            // If the document exists, set the adminName state
            setAdminName(adminDocSnapshot.data().name);
          } else {
            // Handle the case where the document doesn't exist
            console.log("Admin document not found");
          }
        } catch (error) {
          console.error("Error fetching admin document:", error.message);
        }
      }
    });

    // Cleanup the observer on component unmount
    return () => unsubscribe();
  }, []);

  const handleLogOut = async () => {
    try {
      // Sign out the user
      await signOut(auth);
      // Redirect or perform other actions after logout
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <>
      <div>
        {/* Display a welcome message with the user's UID or "Guest" */}
        <p>Welcome, {user ? adminName : 'Guest'}</p>
        {/* Logout button */}
        <button onClick={handleLogOut}>Logout</button>

        <DashBoardUI/>
      </div>
    </>
  );
}
