import { Link } from "react-router";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { LogoutButton } from "./buttons/logoutbutton";
import "../components/navbar.css";

export function NavBar({ isLoggedIn, memberID, groupID, firstName }: AuthData) {
  const isAdmin = groupID === "Administrator";
  return (
    <div className="bg-nav w-full">
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-nav">
            <Link to="/">Symphony's Library</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/about">About</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/items">Items</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/members">Members</Link>
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
<<<<<<< HEAD
          <div className="logged-in-content">
            <h1 className="text-nav">Welcome {firstName}</h1>
            <li className="text-nav">
              <Link to="/profile">Profile</Link>
            </li>
            <li className="text-nav"> 
            <Link to="/admin">Add books</Link>
          </li>
          <li className="text-nav">
          <Link to="/adminedit">delete/edit</Link>
          </li>
            <ul style={{ listStyleType: "none" }}> {/* Corrected here */}
              <li className="text-nav">
=======
          <div className="logged-in-content flex flex-row items-center gap-4">
            <h1 className="text-nav m-0">Welcome {firstName}</h1>

            <ul
              className="user-links flex items-center m-0 p-0"
              style={{ listStyleType: "none" }}
            >
              <li className="text-nav mx-4">
>>>>>>> origin/host
                <Link to="/profile">Profile</Link>
              </li>
            </ul>

            <LogoutButton />
          </div>
        ) : (
          <div className="logged-out-content">
<<<<<<< HEAD
            <li className="text-nav">
              <Link to="/login">Login</Link>
            </li>
            <ul style={{ listStyleType: "none" }}> {/* Corrected here */}
=======
            <ul style={{ listStyleType: "none" }}>
>>>>>>> origin/host
              <li className="text-nav">
                <Link to="/login">Login/Signup</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
