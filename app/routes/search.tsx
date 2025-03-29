import React, { useState } from "react";

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        console.error("Search error", await response.text());
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-10"
      style={{
        backgroundImage: "url('/bobs.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center w-full max-w-4xl bg-white/80 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Search</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative inline-block w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-1100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Title..."
              className="bg-white border border-gray-300 text-black rounded-lg w-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((item: any) => (
                <div
                  key={item.ItemID}
                  className="bg-white p-4 rounded-lg shadow-lg text-black flex flex-col items-center"
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
                    <strong>Status:</strong> {item.Status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;