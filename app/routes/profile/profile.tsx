import { Outlet, useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Link } from "react-router";
import "./profile.css";

export default function ProfilePage() {
  // This is auth data passed down from the layout.tsx
  // so like layout is the main thing, profile page is child of that, and dashboard, myitems, etc. are childs of profile
  // so to keep this data flowing just keep passing it down
  const authData = useOutletContext<AuthData>();

  return (
    <div>
      <div className="bg-nav3">
        <div className="navbar-left w-full flex justify-between items-center">
          <ul className="flex space-x-10">
            <li className="text-nav3">
              <Link to="./dashboard">Dashboard</Link>
            </li>
            <li className="text-nav3">
              <Link to="./myitems">My Items</Link>
            </li>
            <li className="mailbox-nav3">
              <Link to="/mailbox">✉️</Link>
            </li>
            <li className="settings-nav3">
              <Link to="/settings">⚙️</Link>
            </li>
          </ul>
        </div>
      </div>
      <main>
        {/* passing auth data to children */}
        <Outlet context={authData} />
      </main>
    </div>
  );
}
