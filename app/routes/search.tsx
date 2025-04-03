import React, { useEffect, useState } from "react";
import { type Items } from "~/services/api"; // interface used to shape items
import { useLocation } from "react-router";
import { type CartItem } from "~/services/api";

// Define possible item type categories
type ItemCategory = "All" | "Books" | "Media" | "Devices";

const UsingFetch = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemCategory>("All");
  const location = useLocation(); // Get the current location to read URL parameters

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    fetch("/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setFilteredItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch items: ${error.message}`);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract search query from URL when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // Filter items based on search term and active category filter
  useEffect(() => {
    let results = [...items];

    // First apply category filter
    if (activeFilter !== "All") {
      results = results.filter((item) =>
        item.TypeName.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    // Then apply search term filter
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter((item) => {
        return (
          item.Title.toLowerCase().includes(lowercasedSearch) ||
          item.TypeName.toLowerCase().includes(lowercasedSearch) ||
          item.Status.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    setFilteredItems(results);
  }, [searchTerm, activeFilter, items]);

  const handleSelectItem = (item: Items) => {
    setSelectedItems((prev) => {
      // Check if item is already selected
      const isSelected = prev.some(
        (selectedItem) => selectedItem.ItemID === item.ItemID
      );

      if (isSelected) {
        // Remove item if already selected
        return prev.filter(
          (selectedItem) => selectedItem.ItemID !== item.ItemID
        );
      } else {
        // Add item if not selected
        return [...prev, item];
      }
    });
  };

  const isItemSelected = (itemId: number) => {
    return selectedItems.some((item) => item.ItemID === itemId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (category: ItemCategory) => {
    setActiveFilter(category);
  };

  // Function to add selected items to cart
  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    try {
      // Get current cart or initialize empty array
      let cart: CartItem[] = [];
      const cartData = sessionStorage.getItem("shoppingCart");

      if (cartData) {
        cart = JSON.parse(cartData);
      }

      // Track newly added items and unavailable items
      let newItemsCount = 0;
      let unavailableItems = 0;

      // Add each selected item to cart if available and not already present
      selectedItems.forEach((item) => {
        if (item.Status !== "Available") {
          unavailableItems++;
          return;
        }

        if (!cart.some((cartItem) => cartItem.ItemID === item.ItemID)) {
          cart.push({
            ItemID: item.ItemID,
            Title: item.Title,
            TypeName: item.TypeName,
            Status: item.Status,
            Category: "In Cart",
          });
          newItemsCount++;
        }
      });

      // Save updated cart to sessionStorage
      sessionStorage.setItem("shoppingCart", JSON.stringify(cart));

      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event("cartUpdated"));

      // Clear selection after adding to cart
      setSelectedItems([]);

      // Provide appropriate feedback
      if (unavailableItems > 0) {
        if (newItemsCount > 0) {
          alert(
            `${newItemsCount} items added to cart. ${unavailableItems} unavailable items were not added.`
          );
        } else {
          alert(
            `No items added. ${unavailableItems} selected items are unavailable.`
          );
        }
      } else if (newItemsCount > 0) {
        alert(`${newItemsCount} items added to cart`);
      } else {
        alert("Selected items are already in your cart");
      }
    } catch (error) {
      console.error("Error adding items to cart:", error);
      alert("There was an error adding items to cart");
    }
  };

  return (
<<<<<<< HEAD
    <div className="bg-image-search flex items-start justify-center h-screen pt-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow">
          Search
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="relative inline-block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}

              placeholder="Search by Title..."

              className="bg-white/90 border border-gray-300 text-black rounded-lg w-80 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          {results.length > 0 ? (
            results.map((item: any) => (

              <div key={item.ItemID} className="text-white mb-4">
                <h2 className="text-xl">{item.Title}</h2>
                {item.PhotoBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${item.PhotoBase64}`}
                    alt={item.Title}
                    style={{ width: "150px", height: "auto", marginTop: "10px" }}
                  />
                ) : (
                  <p>No Photo Available</p>
                )}

              </div>
            ))
          ) : (
            <p className="text-white">No results found.</p>
          )}
=======
    <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <p>{error}</p>
>>>>>>> origin/host
        </div>
      )}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Advanced search..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <span>Filter by type: </span>
        {["All", "Book", "Media", "Device"].map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange(category as ItemCategory)}
            style={{
              marginRight: "5px",
              padding: "3px 8px",
              backgroundColor: activeFilter === category ? "#eee" : "white",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <span style={{ marginRight: "10px" }}>
          {selectedItems.length} items selected
        </span>
        <button onClick={handleAddToCart} disabled={selectedItems.length === 0}>
          Add to Cart
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Select</th>
                  <th style={{ textAlign: "left" }}>Title</th>
                  <th style={{ textAlign: "left" }}>Type</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Photo</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.ItemID}
                    style={{
                      backgroundColor: isItemSelected(item.ItemID)
                        ? "#f0f0ff"
                        : "transparent",
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isItemSelected(item.ItemID)}
                        onChange={() => handleSelectItem(item)}
                        disabled={item.Status !== "Available"}
                        title={
                          item.Status !== "Available"
                            ? "This item is not available"
                            : ""
                        }
                      />
                    </td>
                    <td>{item.Title}</td>
                    <td>{item.TypeName}</td>
                    <td>{item.Status}</td>
                    <td>{item.PhotoBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${item.PhotoBase64}`}
                  alt={item.Title}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : (
                <p className="text-gray-500">No Photo Available</p>
              )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No items found matching your criteria</div>
          )}

          {items.length > 0 && (
            <div style={{ marginTop: "10px", fontSize: "small" }}>
              Showing {filteredItems.length} of {items.length} items
              {activeFilter !== "All" && (
                <span> (filtered by {activeFilter})</span>
              )}
              {searchTerm && <span> (search: "{searchTerm}")</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

<<<<<<< HEAD

export default Search;

=======
export default UsingFetch;
>>>>>>> origin/host
