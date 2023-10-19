import { useEffect, useState } from 'react';
import { Outlet, Navigate, Route, Routes } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { database, auth } from '../../Authentication/firebase';
import SideBar from './DashBoardComponents/SideBar';
import LoadingSpinner from '../Loading/Loading';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(database));
          const data = snapshot.val();

          // Iterate through each role (admin, agent, dis, players)
          for (const role in data) {
            // Check if the UID exists in the current role
            if (data[role][user.uid]) {
              console.log('triggered');
              setUserRole(role);
              console.log(role);
              break;
            } else {
              console.log('not found');
            }
          }
        } catch (error) {
          console.error('Error fetching data from Firebase:', error.message);
        }
      }
      setLoading(false); // Set loading to false once authentication state is determined
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  if (loading) {
    // You can show a loading spinner or message here
    return <div><LoadingSpinner /></div>;
  }

  return (
    <div>
      <SideBar />
      <div className="lg:ml-80 mt-14 bg-green">
        <Routes>
          {userRole !== 'Admin' ? (
            <Route path="/" element={<Navigate to="/dashboard/coin" replace />} />
            ) : (
            <Route path="/dashboard" element={<Dashboard />} />
          )}
        </Routes>
        <Outlet />
      </div>
    </div>
  );
}
