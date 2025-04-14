import React, { useState, useEffect } from "react";

interface MostBorrowedItem {
  ItemID: number;
  ItemTitle: string;
  Status: string;
  TimesBorrowed: number;
  ItemType: string;
  ISBN?: string;
  Authors?: string;
  Publisher?: string;
  BookPublicationYear?: number;
  BookGenre?: string;
  BookLanguage?: string;
  Director?: string;
  Leads?: string;
  MediaReleaseYear?: number;
  Format?: string;
  Rating?: number;
  MediaGenre?: string;
  MediaLanguage?: string;
  DeviceType?: string;
  Manufacturer?: string;
}

const MostBorrowedItems = () => {
  const [data, setData] = useState<MostBorrowedItem[]>([]);
  const [filteredData, setFilteredData] = useState<MostBorrowedItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Summary statistics state
  const [summaryStats, setSummaryStats] = useState({
    totalItems: 0,
    bookCount: 0,
    mediaCount: 0,
    deviceCount: 0,
    totalBorrows: 0,
  });

  // Filter states
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minBorrowCount, setMinBorrowCount] = useState<number>(0);
  const [limitCount, setLimitCount] = useState<number>(50);

  useEffect(() => {
    // Fetch data from the API
    fetch("/api/most-borrowed-items")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        setData(data);
        setFilteredData(data);
        updateStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  // Update statistics based on data
  const updateStats = (dataToProcess: MostBorrowedItem[]) => {
    // Count items by type
    const bookCount = dataToProcess.filter((item) => item.ISBN).length;
    const mediaCount = dataToProcess.filter((item) => item.Director).length;
    const deviceCount = dataToProcess.filter((item) => item.DeviceType).length;

    // Calculate total borrows
    const totalBorrows = dataToProcess.reduce(
      (sum, item) => sum + (item.TimesBorrowed || 0),
      0
    );

    setSummaryStats({
      totalItems: dataToProcess.length,
      bookCount,
      mediaCount,
      deviceCount,
      totalBorrows,
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...data];

    // Apply item type filter
    if (itemTypeFilter !== "all") {
      if (itemTypeFilter === "book") {
        filtered = filtered.filter((item) => item.ISBN);
      } else if (itemTypeFilter === "media") {
        filtered = filtered.filter((item) => item.Director);
      } else if (itemTypeFilter === "device") {
        filtered = filtered.filter((item) => item.DeviceType);
      }
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.Status === statusFilter);
    }

    // Apply minimum borrow count filter
    if (minBorrowCount > 0) {
      filtered = filtered.filter(
        (item) => item.TimesBorrowed >= minBorrowCount
      );
    }

    // Apply limit
    if (limitCount > 0 && limitCount < filtered.length) {
      filtered = filtered.slice(0, limitCount);
    }

    setFilteredData(filtered);
    updateStats(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setItemTypeFilter("all");
    setStatusFilter("all");
    setMinBorrowCount(0);
    setLimitCount(50);
    setFilteredData(data);
    updateStats(data);
  };

  // Get item details based on type
  const getItemDetails = (item: MostBorrowedItem): string => {
    if (item.ISBN) {
      const details = [];
      if (item.Authors) details.push(item.Authors);
      if (item.Publisher) details.push(item.Publisher);
      if (item.BookPublicationYear) details.push(`${item.BookPublicationYear}`);
      if (item.BookGenre) details.push(item.BookGenre);
      return details.join(", ");
    } else if (item.Director) {
      const details = [];
      if (item.Director) details.push(`Dir: ${item.Director}`);
      if (item.MediaReleaseYear) details.push(`${item.MediaReleaseYear}`);
      if (item.Format) details.push(item.Format);
      if (item.MediaGenre) details.push(item.MediaGenre);
      return details.join(", ");
    } else if (item.DeviceType) {
      return `${item.Manufacturer || ""} ${item.DeviceType || ""}`.trim();
    }
    return "";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Most Borrowed Items Report</h2>

      {/* Summary Statistics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="text-blue-800">Total Items</h3>
          <p className="text-2xl">{summaryStats.totalItems}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-green-800">Total Borrows</h3>
          <p className="text-2xl">{summaryStats.totalBorrows}</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded shadow">
          <h3 className="text-indigo-800">Books</h3>
          <p className="text-2xl">{summaryStats.bookCount}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded shadow">
          <h3 className="text-pink-800">Media</h3>
          <p className="text-2xl">{summaryStats.mediaCount}</p>
        </div>
        <div className="bg-amber-100 p-4 rounded shadow">
          <h3 className="text-amber-800">Devices</h3>
          <p className="text-2xl">{summaryStats.deviceCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-panel p-4 rounded mb-6">
        <h3 className="mb-4">Filters</h3>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* Item Type filter */}
          <div>
            <h4 className="mb-2">Item Type:</h4>
            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Item Types</option>
              <option value="book">Books</option>
              <option value="media">Media</option>
              <option value="device">Devices</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <h4 className="mb-2">Status:</h4>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>

          {/* Min Borrow Count filter */}
          <div>
            <h4 className="mb-2">Minimum Times Borrowed:</h4>
            <input
              type="number"
              min="0"
              value={minBorrowCount}
              onChange={(e) => setMinBorrowCount(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Limit filter */}
          <div>
            <h4 className="mb-2">Limit Results:</h4>
            <input
              type="number"
              min="1"
              value={limitCount}
              onChange={(e) => setLimitCount(parseInt(e.target.value) || 50)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-2 text-gray-600">
        Showing {filteredData.length} of {data.length} items
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading data...</p>}

      {/* Data table */}
      {!loading && filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Rank</th>
                <th className="border px-4 py-2 text-left">Times Borrowed</th>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Item Type</th>
                <th className="border px-4 py-2 text-left">Details</th>
                <th className="border px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.ItemID}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2 font-bold text-center">
                    {item.TimesBorrowed}
                  </td>
                  <td className="border px-4 py-2">{item.ItemTitle}</td>
                  <td className="border px-4 py-2">{item.ItemType}</td>
                  <td className="border px-4 py-2">{getItemDetails(item)}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.Status === "Available"
                          ? "bg-green-100 text-green-800"
                          : item.Status === "Borrowed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No data found for the selected filters.</p>
      )}
    </div>
  );
};

export default MostBorrowedItems;