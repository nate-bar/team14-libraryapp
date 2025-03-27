import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { type Items } from "~/services/api";
import "../components/navbar.css";

export function NavBar2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState<Items[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // ✅ Check session and unread notifications
  useEffect(() => {
    fetch("/api/session")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((session) => {
        setIsLoggedIn(true);
        const memberId = session.memberId;

        return fetch(`/api/notifications/unread/${memberId}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setHasUnread(data.unreadCount > 0);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setHasUnread(false);
      });
  }, []);

  const filteredItems = items.filter((item) =>
    item.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="bg-nav2">
      <div className="navbar-left w-full flex justify-between items-center">
        <ul className="flex space-x-10">
          <li className="text-nav2"><Link to="/">Home</Link></li>
          <li className="text-nav2"><Link to="/items">Items</Link></li>
          <li className="text-nav2"><Link to="/cart">🛒</Link></li>
          {isLoggedIn && (
            <li className="text-nav2 relative">
              <Link to="/email">
                ✉️
                {hasUnread && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </Link>
            </li>
          )}
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

          {showResults && (
            <div className="search-results absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-h-60 overflow-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  let category = "items";
                  if (item.TypeName === "Device") category = "device";
                  else if (item.TypeName === "Media") category = "media";
                  else if (item.TypeName === "Book") category = "book";

                  return (
                    <Link
                      key={item.ItemID}
                      to={`/${category}/${item.ItemID}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {item.Title}{" "}
                      <span className="text-gray-500">({item.TypeName})</span>
                    </Link>
                  );
                })
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
