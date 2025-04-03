//navigation bar when logging in
import { Outlet, useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Link } from "react-router"; // Using React Router
import "./profile.css";

export default function ProfilePage() {
  const authData = useOutletContext<AuthData>();
  return (
    <div className="bg-nav3" > 
      <div className="navbar-left w-full flex justify-between items-center">
        <ul className="flex space-x-10">
          <li className="text-nav3">
            <Link to="./dashboard">Dashboard</Link>
          </li>
          <li className="text-nav3">
            <Link to="./myitems">My Items</Link>
          </li>
          <li className="mailbox-nav3">
             <Link to="/mailbox">✉️
             </Link>
          </li>
          <li className="settings-nav3">
            <Link to="/settings">⚙️</Link>
          </li>
        </ul>
      </div>
      <main className="flex w-full py-2 px-4 justify-between items-center">
        {/* passing authData to children */}
        <Outlet context={authData} />
      </main>
    </div>
  );

}
