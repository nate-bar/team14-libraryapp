import { Link, useNavigate } from "react-router";
import { useState } from "react";
import "../components/navbar.css";

// Define the props interface
interface NavBarProps {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
}

export function NavBar2({ isLoggedIn, memberID, groupID }: NavBarProps) {
  const navigate = useNavigate();
  const isAdmin = groupID === "Administrator";

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-nav2 flex items-center p-4">
      {/* Navigation Links */}
      <div className="navbar-left">
        <ul className="flex space-x-10">
          <li className="text-nav2">
            <Link to="/">Home</Link>
          </li>
          <li className="text-nav2">
            <Link to="/items">Items</Link>
          </li>
          <li className="text-nav2">
            <Link to="/login">Login</Link>
          </li>

        </ul>
      </div>

<form onSubmit={handleSearch} className="search-bar">
  <input
    type="text"
    placeholder="Search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"
    aria-label="Search"
  />
  <button type="submit" className="search-button">
    🔍
  </button>
</form>

      {/* User Info */}
      <div className="navbar-right ml-4">
        {isLoggedIn ? (
          <div className="logged-in-content">
          </div>
        ) : (
          <div className="logged-out-content"></div>
        )}
      </div>
    </div>
  );
}
