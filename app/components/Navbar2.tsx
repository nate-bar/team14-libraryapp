import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../components/navbar.css";

interface NavBarProps {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
}

interface Item {
  ItemID: number;
  Title: string;
  Type: string;
  Status: string;
}

export function NavBar2({ isLoggedIn, memberID, groupID }: NavBarProps) {
  const isAdmin = groupID === "Administrator";
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate(); // React Router navigation

  // List of items
  const items: Item[] = [
    { ItemID: 1000000001, Title: "Murder on the Orient Express", Type: "Book", Status: "Available" },
    { ItemID: 1000000002, Title: "Me Talk Pretty One Day", Type: "Book", Status: "Available" },
    { ItemID: 1000000003, Title: "The Autobiography Of Malcolm X", Type: "Book", Status: "Available" },
    { ItemID: 1000000011, Title: "The Fast and the Furious", Type: "Media", Status: "Available" },
    { ItemID: 1000000012, Title: "Step Brothers", Type: "Media", Status: "Available" }
  ];

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="bg-nav2">
      {/* Navigation Links */}
      <div className="navbar-left w-full flex justify-between items-center">
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(e.target.value.trim() !== "");
            }}
            className="search-input"
            aria-label="Search"
          />
          <button type="submit" className="search-button">🔍</button>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="search-results absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-h-60 overflow-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <Link
                    key={item.ItemID}
                    to={`/items/${item.ItemID}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    {item.Title} <span className="text-gray-500">({item.Type})</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-2 text-gray-500">No results found</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
