import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const UsingFetch = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(""); // State for the type dropdown filter
  const [genreFilter, setGenreFilter] = useState(""); // State for the genre dropdown filter

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

  // Handle type dropdown filter change
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTypeFilter(selectedType);
    setGenreFilter(""); // Reset genre filter when type changes

    if (selectedType === "") {
      setFilteredItems(items); // Show all items if no type is selected
    } else {
      setFilteredItems(
        items.filter((item) => item.TypeName === selectedType)
      );
    }
  };

  // Handle genre dropdown filter change
  const handleGenreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenre = e.target.value;
    setGenreFilter(selectedGenre);

    if (selectedGenre === "") {
      setFilteredItems(
        items.filter((item) => item.TypeName === typeFilter)
      );
    } else {
      setFilteredItems(
        items.filter(
          (item) =>
            item.TypeName === typeFilter && item.GenreID === parseInt(selectedGenre)
        )
      );
    }
  };

  // Helper function to get genre name by ID
  const getGenreName = (genreId: number | null) => {
    if (genreId === null) return "N/A"; // Handle null GenreID
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : "N/A";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Library Items
      </h1>

      {/* Dropdown Filters */}
      <div className="flex justify-center gap-4 mb-8">
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={handleTypeFilterChange}
          className="w-64 p-3 text-sm border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Book">Book</option>
          <option value="Media">Media</option>
          <option value="Device">Device</option>
        </select>

        {/* Genre Filter (only show if "Book" or "Media" is selected) */}
        {(typeFilter === "Book" || typeFilter === "Media") && (
          <select
            value={genreFilter}
            onChange={handleGenreFilterChange}
            className="w-64 p-3 text-sm border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Display items */}
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading items...</p>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={item.ItemID}
              to={`/${item.TypeName}/${item.ItemID}`}
              className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
            >
              <h2 className="text-lg font-bold mb-2 text-center">
                {item.Title}
              </h2>
              {item.PhotoBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${item.PhotoBase64}`}
                  alt={item.Title}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : (
                <p className="text-gray-500">No Photo Available</p>
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
              <p className="text-sm text-gray-700">
                <strong>Genre:</strong> {getGenreName(item.GenreID)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No items found.</p>
      )}
    </div>
  );
};

export default UsingFetch;