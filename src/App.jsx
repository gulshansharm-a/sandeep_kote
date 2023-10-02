import './App.css'
import Login from './Components/Auth/Login'
import SignUp from './Components/Auth/SignUp'
import DashBoard from './Components/DashBoard/DashBoard';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <>
      <div className="App">
        <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
