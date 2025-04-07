import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { type Items } from "~/services/api";
import "../components/navbar.css";
import { useCart } from "~/context/CartContext";

export function NavBar2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState<Items[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const triggerFilterReset = () => {
    window.dispatchEvent(new Event("resetCatalogFilters"));
  };

  // fetch items from api
  useEffect(() => {
    fetch("/api/items")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  //************************LISTENER FOR EXITING DROPDOWN************
  // ***********************SEARCH WHEN USER CLICKS AWAY************* */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
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
    <div className="bg-nav2 w-full">
      {/* Navigation Links */}
      <div className="navbar-left w-full flex justify-between items-center">
        <ul className="flex space-x-10">
          <li className="text-nav2">
            <Link to="/">Home</Link>
          </li>
          <li className="text-nav2">
            <Link to="/catalog" onClick={triggerFilterReset}>
              Catalog
            </Link>
          </li>
          <li className="text-nav2 relative">
            <Link to="/cart">
              🛒
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </li>
        </ul>

        {/* Search Bar */}
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearch} className="search-bar">
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
              onClick={() => {
                if (searchQuery.trim() !== "") {
                  setShowResults(true);
                }
              }}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="search-results absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-h-60 overflow-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  let category = "items"; // Default
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
        </div>
      </div>
    </div>
  );
}
