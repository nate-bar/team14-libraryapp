import React, { useEffect, useState } from "react";
import { type Items } from "~/services/api"; // interface used to shape items
import { useOutletContext, useLocation } from "react-router";
import { type AuthData } from "~/services/api";

// Define possible item type categories
type ItemCategory = "All" | "Books" | "Media" | "Devices";

const UsingFetch = () => {
  const [items, setItems] = React.useState<Items[]>([]);
  const [filteredItems, setFilteredItems] = useState<Items[]>([]);
  const [selectedItems, setSelectedItems] = useState<Items[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemCategory>("All");
  const { isLoggedIn, memberID } = useOutletContext<AuthData>(); // getting memberID and loggedin status
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

  // Function to process selected items
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    } else if (!isLoggedIn) {
      alert("Please login or create account");
      return;
    }

    // preparing item ids to send to server
    const selectedItemIds = selectedItems.map((item) => item.ItemID);

    // api call
    fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: selectedItemIds, memberID }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        alert(`Successfully processed ${selectedItems.length} items`);
        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error sending items:", error);
        alert(`Error processing items: ${error.message}`);
      });
  };

  return (
    <div>
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <p>{error}</p>
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
        <button onClick={handleCheckout} disabled={selectedItems.length === 0}>
          Checkout Items
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
                      />
                    </td>
                    <td>{item.Title}</td>
                    <td>{item.TypeName}</td>
                    <td>{item.Status}</td>
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

export default UsingFetch;
