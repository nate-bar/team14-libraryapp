import { Link } from "react-router";
import { type AuthData } from "~/services/api";

export function NavBar({ isLoggedIn, memberID, groupID }: AuthData) {
  const isAdmin = groupID === "Administrator";
  return (
    <div className="bg-blue-500 flex">
      <div className="navbar-left">{/* Left side content */}</div>
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-lg flex items-center justify-center">
            <Link to="/">Home</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/about">About</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/items">Items</Link>
          </li>
          <li className="text-lg flex items-center justify-center">
            <Link to="/search">Search</Link>
          </li>
          {/* Admin link - only visible to administrators */}
          {isLoggedIn && isAdmin && (
            <li className="text-lg flex items-center justify-center">
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
            <h2>
              Hello #{memberID}, #{groupID}
            </h2>
          </div>
        ) : (
          <div className="logged-out-content">
            <li className="text-lg flex items-right justify-center">
              <Link to="/login">Login</Link>
            </li>
          </div>
        )}
      </div>
    </div>
  );
}
