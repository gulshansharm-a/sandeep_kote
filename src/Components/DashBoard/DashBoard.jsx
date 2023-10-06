import { Outlet } from 'react-router-dom';
import SideBar from "./DashBoardComponents/SideBar";


export default function Dashboard() {

  return (
    <>
      <div>
        {/* Display a welcome message with the user's UID or "Guest" */}
        {/* <p>Welcome, {user ? adminName : 'Guest'}</p> */}
        {/* Logout button */}
        {/* <button onClick={handleLogOut}>Logout</button> */}

        <SideBar />
        <div className="lg:ml-80 mt-14 bg-green">
        {/* <Auth/> */}
        {/* <Auth /> */}
          <Outlet />
          
         
        </div>
      </div>
    </>
  );
}
