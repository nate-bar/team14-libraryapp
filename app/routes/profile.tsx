import { useOutletContext } from "react-router";
import { Link, useNavigate } from "react-router"; // Using React Router
import { type AuthData } from "~/services/api";
import "./profile.css";

export default function ProfilePage() {
  const {
    isLoggedIn,
    memberID,
    groupID,
    firstName,
    lastName,
    middleName,
    address,
  } = useOutletContext<AuthData>();
  const navigate = useNavigate();
  return (
    <div className="bg-nav3" > 
      <div className="navbar-left w-full flex justify-between items-center">
        <ul className="flex space-x-10">
          <li className="text-nav3">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="text-nav3">
            <Link to="/myitems">My Items</Link>
          </li>
          <li className="settings-nav3">
             <Link to="/settings">🔍
             </Link>
          </li>
        </ul>
      </div>
    </div>
  );

}
