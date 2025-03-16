import { Link } from "react-router";
import { useOutletContext } from "react-router";
import "../components/navbar.css";
// Define the props interface
interface NavBarProps {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
}

export function NavBar({ isLoggedIn, memberID, groupID }: NavBarProps) {
  const isAdmin = groupID === "Administrator";
  return (
    <div className="bg-nav">
      
      <div className="navbar-left">{/* Left side content */}</div>
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-nav">
            <Link to="/">Symphony's Library</Link>
          </li>
          {/* Admin link - only visible to administrators */}
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
            <h2>
              Hello #{memberID}, #{groupID}
            </h2>
          </div>
        ) : (
          <div className="logged-out-content">
          </div>
        )}
      </div>
    </div>
  );
}
