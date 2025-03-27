import React, { useEffect, useState } from "react";

const UsingFetch = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the /api/items endpoint
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
          setItems(data); // Set the fetched items
          setFilteredItems(data); // Initialize filtered items
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

  // Fetch items on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredItems(
      items.filter(
        (item) =>
          item.Title.toLowerCase().includes(query) ||
          item.TypeName.toLowerCase().includes(query) ||
          item.Status.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Search Library Items</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, type, or status..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-3 border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Display items */}
      {loading ? (
        <p className="text-center text-gray-500">Loading items...</p>
      ) : filteredItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Item ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Photo</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.ItemID} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{item.ItemID}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.Title}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.TypeName}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        item.Status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.Status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.PhotoBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${item.PhotoBase64}`}
                        alt={item.Title}
                        className="w-24 h-auto rounded shadow"
                      />
                    ) : (
                      <span className="text-gray-500">No Photo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No items found.</p>
      )}
    </div>
  );
};

export default UsingFetch;