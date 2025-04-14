import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { type Genres } from "~/services/api";
import { type Items } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import NoImage from "~/components/imgplaceholder";
import './quickcatalog.css';  // Importing the CSS file

const UsingFetch = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [filteredItems, setFilteredItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(25); // State for items per page
    const [currentPage, setCurrentPage] = useState(1); // State for the current page
    const [sortBy, setSortBy] = useState<string>(""); // Sorting field (e.g., Title)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Ascending or Descending order
    
    const fetchData = () => {
      fetch("/api/items")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch items");
          }
          return response.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setItems(data);
            setFilteredItems(data.filter((item) => item.TypeName === "Device")); // Only show devices
          } else {
            console.error("API did not return an array:", data);
            setItems([]);
            setFilteredItems([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching items:", err);
          setItems([]);
          setFilteredItems([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };
  
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(parseInt(e.target.value, 10));
      setCurrentPage(1); // Reset to page 1 when changing items per page
    };
  
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedSortBy = e.target.value;
      setSortBy(selectedSortBy);
    };
  
    const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedSortOrder = e.target.value as "asc" | "desc";
      setSortOrder(selectedSortOrder);
    };
  
    const sortItems = (items: Items[]) => {
      if (!sortBy) return items;
  
      return items.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
  
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    };
  
    const paginateItems = (items: Items[]) => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return items.slice(startIndex, startIndex + itemsPerPage);
    };
  
    const sortedAndPaginatedItems = paginateItems(sortItems(filteredItems));
  
    return (
      <div className="container">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Device Catalog
        </h1>
  
        <div className="flex justify-center gap-4 mb-8">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="select"
          >
            <option value="">Sort By</option>
            <option value="Title">Title</option>
          </select>
  
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="select"
          >
            <option value={25}>25 items per page</option>
            <option value={50}>50 items per page</option>
            <option value={100}>100 items per page</option>
          </select>
  
          <select
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
  
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedAndPaginatedItems.map((item) => (
              <Link
                key={item.ItemID}
                to={`/${item.TypeName}/${item.ItemID}`}
                className="card"
              >
                <h2 className="text-lg font-bold mb-2 text-center">{item.Title}</h2>
                {item.Photo ? (
                  <img
                    src={`data:image/jpeg;base64,${item.Photo}`}
                    alt={item.Title}
                    className="w-full h-48 object-contain rounded-lg mb-2"
                  />
                ) : (
                  <NoImage />
                )}
                <p className="text-sm text-gray-700">
                  <strong>Type:</strong> {item.TypeName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded ${
                      item.Status === "Available"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.Status}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No devices found.</p>
        )}
  
        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="button"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * itemsPerPage >= filteredItems.length}
            className="button"
          >
            Next
          </button>
  
          <p className="text-center mt-4">
            Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
          </p>
        </div>
      </div>
    );
  };
  
  export default UsingFetch;