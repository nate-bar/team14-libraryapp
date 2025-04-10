import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { type Items } from "~/services/api";

const Event2 = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [loading, setLoading] = useState(true);

  const GENRE_ID = 205; // Memorial Day Genre ID

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
          // Filter for Books or Media and matching GenreID
          const filtered = data.filter(
            (item) =>
              (item.TypeName === "Book" || item.TypeName === "Media") &&
              item.GenreID === GENRE_ID
          );
          setItems(filtered);
        } else {
          console.error("API did not return an array:", data);
          setItems([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6 pb-24">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Memorial Day Event Items
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading items...</p>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
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
                <strong>Genre:</strong> {item.GenreName}
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

export default Event2;
