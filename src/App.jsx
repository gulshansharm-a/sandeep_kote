import './App.css';
import Login from './Components/Auth/Login';
import SignUp from './Components/Auth/SignUp';
import DashBoard from './Components/DashBoard/DashBoard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './Authentication/firebase';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false once authentication state is determined
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  if (loading) {
    // You can show a loading spinner or message here
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            {user ? (
              <Route path="/dashboard" element={<DashBoard />} />
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
