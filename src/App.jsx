import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { database } from "./Authentication/firebase";
import './App.css';
import { auth } from './Authentication/firebase';
import Login from './Components/Auth/Login';
import DashBoard from './Components/DashBoard/DashBoard';
import AddUsers from './Components/DashBoard/DashBoardComponents/AddUsers/AddUsers';
import CoinCount from './Components/DashBoard/DashBoardComponents/CoinsCount';
import MenuUserSpecific from './Components/DashBoard/DashBoardComponents/MenuUsers/MenuUserSpecific';
import MenuUsers from './Components/DashBoard/DashBoardComponents/MenuUsers/MenuUsers';
import Users from './Components/DashBoard/DashBoardComponents/Users/Users';
import CoinTransfer from './Components/DashBoard/CoinTransfer';
import LoadingSpinner from './Components/Loading/Loading';
import GameHistory from './Components/DashBoard/DashBoardComponents/Game/GameHistory'
import CommissionHistory from './Components/DashBoard/DashBoardComponents/CommissionHistory/CommissionHistory';
import ResetPassword from './Components/DashBoard/DashBoardComponents/ResetPassword/ResetPassword';
import BlockUsers from './Components/DashBoard/DashBoardComponents/BlockPlayers/BlockUsers';
import BlockedHistory from './Components/DashBoard/DashBoardComponents/BlockPlayers/BlockedHistory';
import LiveUsers from './Components/DashBoard/DashBoardComponents/LiveUsers/LiveUsers';
import AdminBalanceSetting from './Components/DashBoard/DashBoardComponents/SetAdminBalance/SetAdminBalance';
import ViewPassword from './Components/DashBoard/DashBoardComponents/ViewPassword/ViewPassword';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      console.log(user);

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
      setLoading(false); // Set loading to false once authentication state is determined
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);


  if (loading) {
    // You can show a loading spinner or message here
    return <div><LoadingSpinner /></div>;
  }

  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {user ? (
              <Route path="/" element={<Navigate to="/login" replace />} />
            ) : (
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            )}
  
            <Route path="/login" element={<Login />} />
  
            {user ? (
              <Route path="/dashboard" element={<DashBoard />}>
                {/* Add other nested routes based on user's choice */}
                <Route path="coin" element={<CoinTransfer />} />
                <Route path="" element={<CoinCount />} />
                <Route path="addusers" element={<AddUsers />} />
                <Route path="users" element={<Users />} />
                <Route path="commission-history" element={<CommissionHistory />} />
                <Route path="menuUsers" element={<MenuUsers />} />
                <Route path="gameHistory" element={<GameHistory />} />
                <Route path="menuUsers/specific" element={<MenuUserSpecific />} />
                <Route path="resetPassword" element={<ResetPassword />} />
                <Route path="setBalance" element={<AdminBalanceSetting />} />
                <Route path="liveUsers" element={<LiveUsers />} />
  
                {/* Render routes based on userRole */}
                {userRole === "Admin" && (
                  <>
                    <Route path="blockUsersHistory" element={<BlockedHistory />} />
                    <Route path="blockUsers" element={<BlockUsers />} />
                    <Route path="ViewPassword" element={<ViewPassword />} />
                  </>
                )}
                
                {/* Add more routes for other roles */}
              </Route>
            ) : (
              <Route
                path="/dashboard"
                element={<Navigate to="/login" replace />}
              />
            )}
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );  
}

export default App;
