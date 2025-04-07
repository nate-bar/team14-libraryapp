import React, { useEffect, useState, useCallback, useMemo } from "react";
import { type ItemFull } from "~/services/api";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";

type ItemCategory = "All" | "Book" | "Media" | "Device";

const AdvancedSearch = () => {
  const [items, setItems] = useState<ItemFull[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemCategory>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const location = useLocation();
  const navigate = useNavigate();

  const handleRowClick = (item: ItemFull) => {
    navigate(`/${item.TypeName}/${item.ItemID}`);
  };

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    fetch("/api/itemfull")
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
  }, []);

  // Comprehensive filtering logic
  const filteredResults = useMemo(() => {
    let results = [...items];

    // First, apply category filter
    if (activeFilter !== "All") {
      results = results.filter(
        (item) => item.TypeName?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Then, apply search term filter if exists
    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase().trim();

      results = results.filter((item) => {
        const searchFields = [
          item.Title,
          item.Authors,
          item.Director,
          item.Leads,
          item.DeviceType,
          item.Manufacturer,
          item.GenreName,
          item.Publisher,
          item.Language,
          item.TypeName,
          item.Status,
        ];

        return searchFields.some(
          (field) => field && field.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    return results;
  }, [searchTerm, items, activeFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // Update filtered items when search results change
  useEffect(() => {
    setFilteredItems(filteredResults);
  }, [filteredResults]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (category: ItemCategory) => {
    setActiveFilter(category);
  };

  const paginatedResults = useMemo(() => {
    if (!filteredResults.length) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Page navigation handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div>
      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>
            <p>{error}</p>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <span>Filter by type: </span>
          {["All", "Book", "Media", "Device"].map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category as ItemCategory)}
              style={{
                marginRight: "5px",
                padding: "3px 8px",
                backgroundColor:
                  activeFilter === category ? "#4a90e2" : "white",
                color: activeFilter === category ? "white" : "black",
                border: `1px solid ${
                  activeFilter === category ? "#4a90e2" : "#ccc"
                }`,
                borderRadius: "4px",
                fontWeight: activeFilter === category ? "bold" : "normal",
                transition: "all 0.3s ease",
                boxShadow:
                  activeFilter === category
                    ? "0 2px 4px rgba(0,0,0,0.1)"
                    : "none",
                outline: "none",
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Search Input */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search items (Title, Authors, Director, Device, etc.)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            {searchTerm && (
              <div
                style={{
                  marginTop: "10px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Searching across Title, Authors, Director, Device Type,
                Manufacturer, Genre, Publisher, Language, and more...
              </div>
            )}
          </div>

          {/* Loading and Error States */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                color: "#666",
                padding: "20px",
              }}
            >
              Loading items...
            </div>
          )}

          {error && (
            <div
              style={{
                color: "red",
                backgroundColor: "#ffeeee",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              Error: {error}
            </div>
          )}

          {/* Results Table */}
          {!isLoading && !error && searchTerm && filteredItems.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Authors/Director</th>
                  <th>Additional Info</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((item) => (
                  <tr
                    key={item.ItemID}
                    onClick={() => handleRowClick(item)}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor:
                        item.Status !== "Available" ? "white" : "white",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e4c9a8";
                    }}
                    onMouseLeave={(e) => {
                      // CHANGE HERE IF YOU WANT TO DISPLAY A DIFFERENT COLOR FOR CHECKED OUT BOOKS
                      e.currentTarget.style.backgroundColor =
                        item.Status !== "Available" ? "white" : "white";
                    }}
                  >
                    <td style={tableCellStyle}>{item.Title}</td>
                    <td style={tableCellStyle}>{item.TypeName}</td>
                    <td style={tableCellStyle}>
                      {item.Authors || item.Director || "N/A"}
                    </td>
                    <td style={tableCellStyle}>
                      {item.DeviceType || item.Publisher || item.Leads || "N/A"}
                    </td>
                    <td style={tableCellStyle}>{item.Status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* No Results Message */}
          {!isLoading && !error && searchTerm && filteredItems.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#666",
                padding: "20px",
                border: "1px dashed #ddd",
              }}
            >
              No items found matching "{searchTerm}"
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                margin: "0 10px",
                padding: "5px 10px",
                backgroundColor: currentPage === 1 ? "#f0f0f0" : "#4a90e2",
                color: currentPage === 1 ? "#888" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                margin: "0 10px",
                padding: "5px 10px",
                backgroundColor:
                  currentPage === totalPages ? "#f0f0f0" : "#4a90e2",
                color: currentPage === totalPages ? "#888" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>

          {/* Results Summary */}
          {!isLoading && !error && searchTerm && filteredItems.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Showing {filteredItems.length} of {items.length} items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles for table
const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f9f9f9",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  maxWidth: "200px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export default AdvancedSearch;
