import React, { useEffect, useState } from "react";

const UsingFetch = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // State for the dropdown filter

  // Genre list
  const genres = [
    { id: 101, name: "Adventure" },
    { id: 102, name: "Art" },
    { id: 103, name: "Autobiography" },
    { id: 104, name: "Biography" },
    { id: 105, name: "Childrens" },
    { id: 106, name: "Classic" },
    { id: 107, name: "Cooking" },
    { id: 108, name: "Crime" },
    { id: 109, name: "Detective" },
    { id: 110, name: "Fable" },
    { id: 111, name: "Fairy Tale" },
    { id: 112, name: "Fantasy" },
    { id: 113, name: "Graphic Novel" },
    { id: 114, name: "Health & Fitness" },
    { id: 115, name: "Historical Fiction" },
    { id: 116, name: "Horror" },
    { id: 117, name: "Humor" },
    { id: 118, name: "Law" },
    { id: 119, name: "Memoir" },
    { id: 120, name: "Mythology" },
    { id: 121, name: "Poetry" },
    { id: 122, name: "Religion" },
    { id: 123, name: "Romance" },
    { id: 124, name: "Science Fiction" },
    { id: 125, name: "Self-Help" },
    { id: 126, name: "Short Story" },
    { id: 127, name: "Suspense" },
    { id: 128, name: "Thriller" },
    { id: 129, name: "Young Adult" },
    { id: 130, name: "Western" },
    { id: 201, name: "Action" },
    { id: 202, name: "Adventure" },
    { id: 203, name: "Documentary" },
    { id: 204, name: "Drama" },
    { id: 205, name: "Historical" },
    { id: 206, name: "Historical Fiction" },
    { id: 207, name: "Horror" },
    { id: 208, name: "Musical" },
    { id: 209, name: "Noir" },
    { id: 210, name: "Romantic Comedy" },
    { id: 211, name: "Satire" },
    { id: 212, name: "Sports" },
    { id: 213, name: "Thriller" },
    { id: 214, name: "Western" },
  ];

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

  // Handle dropdown filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);

    if (selectedFilter === "") {
      setFilteredItems(items); // Show all items if no filter is selected
    } else {
      setFilteredItems(items.filter((item) => item.TypeName === selectedFilter));
    }
  };

  // Helper function to get genre name by ID
  const getGenreName = (genreId: number) => {
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : "N/A";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Filter Library Items</h1>

      {/* Dropdown Filter */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="w-48 p-2 text-sm border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Book">Book</option>
          <option value="Media">Media</option>
        </select>
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
                <th className="border border-gray-300 px-4 py-2 text-left">Genre</th>
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
                    {getGenreName(Number(item.GenreID))}
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