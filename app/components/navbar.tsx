import { Link } from "react-router";
import { type AuthData } from "~/services/api";
import { LogoutButton } from "./logoutbutton";
import "../components/navbar.css";

export function NavBar({ isLoggedIn, memberID, groupID, firstName }: AuthData) {
  const isAdmin = groupID === "Administrator";
  return (
    <div className="bg-nav">
      <div className="navbar-left">{/* Left side content */}</div>
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-nav">
            <Link to="/">Symphony's Library</Link>
          </li>
          {isLoggedIn && isAdmin && (
            <li className="text-nav">
              <Link to="/admin" className="text-white font-bold">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-right ml-auto mr-4">
        {isLoggedIn ? (
          <div className="logged-in-content">
            <h1 className="text-nav">Welcome {firstName}</h1>
            <ul style={{ listStyleType: "none" }}> {/* Corrected here */}
              <li className="text-nav">
                <Link to="/profile">Profile</Link>
              </li>
            </ul>
            <LogoutButton />
          </div>
        ) : (
          <div className="logged-out-content">
            <ul style={{ listStyleType: "none" }}> {/* Corrected here */}
              <li className="text-nav">
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}