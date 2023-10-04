import { auth } from "../../Authentication/firebase";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import SideBar from "./DashBoardComponents/SideBar";
import CoinCount from "./DashBoardComponents/CoinsCount";
import { Outlet } from 'react-router-dom';

export default function Dashboard() {


  return (
    <>
      <div>
        {/* Display a welcome message with the user's UID or "Guest" */}
        {/* <p>Welcome, {user ? adminName : 'Guest'}</p> */}
        {/* Logout button */}
        {/* <button onClick={handleLogOut}>Logout</button> */}

        <SideBar />

        <div className="lg:ml-80 mt-14">
          <Outlet />
          {/* <CoinCount /> */}
        </div>
      </div>
    </>
  );
}
