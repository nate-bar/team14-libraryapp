import { useEffect, useState, useCallback, useMemo } from "react";
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
  const [activeFilter, setActiveFilter] = useState<ItemCategory>("All"); // default to all category
  const [currentPage, setCurrentPage] = useState(1); // set page state
  const itemsPerPage = 25; // items displayed per page

  const location = useLocation(); // used for getting search from url
  const navigate = useNavigate(); // used to navigate to item page

  // handle navigation to item detail page
  const handleRowClick = (item: ItemFull) => {
    navigate(`/${item.TypeName}/${item.ItemID}`);
  };

  // fetching data from api that returns ItemFull type in api.ts
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

  // filtering logic
  const filteredResults = useMemo(() => {
    // if search bar is empty, return empty array
    if (!searchTerm.trim()) {
      return [];
    }

    let results = [...items];

    // apply category filter if needed
    if (activeFilter !== "All") {
      results = results.filter(
        (item) => item.TypeName?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // then => search term filter
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

    return results;
  }, [searchTerm, items, activeFilter]);

  // get search term from navbar2 search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  // await item change then update filtered items
  useEffect(() => {
    setFilteredItems(filteredResults);
    // reset page state to 1 on change
    setCurrentPage(1);
  }, [filteredResults]);

  // data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // set active filter to selected category
  const handleFilterChange = (category: ItemCategory) => {
    setActiveFilter(category);
  };

  // handle paging
  const paginatedResults = useMemo(() => {
    if (!filteredResults.length) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage]);

  // quick calc for total pages
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // page navigation
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

  // if no errors and no loading and search term is not empty => display results
  const shouldShowResults = !isLoading && !error && searchTerm.trim() !== "";

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
          {shouldShowResults && filteredItems.length > 0 && (
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
          {shouldShowResults && filteredItems.length === 0 && (
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

          {/* Pagination - Only show when we have search results */}
          {shouldShowResults && filteredItems.length > 0 && (
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
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary - Only show when we have search results */}
          {shouldShowResults && filteredItems.length > 0 && (
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

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  maxWidth: "200px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export default AdvancedSearch;
