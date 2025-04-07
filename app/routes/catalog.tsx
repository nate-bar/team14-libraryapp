import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { type Genres } from "~/services/api";
import { type Items } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import NoImage from "~/components/imgplaceholder";

const UsingFetch = () => {
  const [genres, setGenres] = useState<Genres[]>([]);
  const [items, setItems] = useState<Items[]>([]);
  const [filteredItems, setFilteredItems] = useState<Items[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(""); // State for the type dropdown filter
  const [genreFilter, setGenreFilter] = useState(""); // State for the genre dropdown filter

  const resetFilters = () => {
    setTypeFilter("");
    setGenreFilter("");
    setFilteredItems(items);
    setGenres([]);
  };

  const fetchGenres = (type: string) => {
    let endpoint = "";
    switch (type) {
      case "Book":
        endpoint = "/api/bookgenres";
        break;
      case "Media":
        endpoint = "/api/mediagenres";
        break;
      default:
        setGenres([]);
        return;
    }

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type} genres`);
        }
        return response.json();
      })
      .then((data) => {
        setGenres(data);
      })
      .catch((error) => {
        console.error(`Error fetching ${type} genres:`, error);
        setGenres([]);
      });
  };

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

  useEffect(() => {
    const handleFilterReset = () => {
      resetFilters();
    };

    window.addEventListener("resetCatalogFilters", handleFilterReset);

    // Cleanup listener
    return () => {
      window.removeEventListener("resetCatalogFilters", handleFilterReset);
    };
  }, [items]);

  // Handle type dropdown filter change
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTypeFilter(selectedType);
    setGenreFilter(""); // Reset genre filter when type changes

    if (selectedType === "Book" || selectedType === "Media") {
      fetchGenres(selectedType);
    } else {
      setGenres([]); // Clear genres for other types
    }

    if (selectedType === "") {
      setFilteredItems(items); // Show all items if no type is selected
    } else {
      setFilteredItems(items.filter((item) => item.TypeName === selectedType));
    }
  };

  // Handle genre dropdown filter change
  const handleGenreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenre = e.target.value;
    setGenreFilter(selectedGenre);

    if (selectedGenre === "") {
      setFilteredItems(items.filter((item) => item.TypeName === typeFilter));
    } else {
      setFilteredItems(
        items.filter(
          (item) =>
            item.TypeName === typeFilter &&
            item.GenreID === parseInt(selectedGenre)
        )
      );
    }
  };

  return (
    <div className="container mx-auto p-6 pb-24">
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
              <option key={genre.GenreID} value={genre.GenreID}>
                {genre.GenreName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Display items */}
      {loading ? (
        <LoadingSpinner />
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
              {item.GenreName ? (
                <p className="text-sm text-gray-700">
                  <strong>Genre:</strong> {item.GenreName}
                </p>
              ) : null}
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