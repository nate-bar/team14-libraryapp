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
    <div className="bg-image-search flex items-start justify-center h-screen pt-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6 text-white drop-shadow">
          Search
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="relative inline-block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-500"
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
              placeholder="Search..."
              className="bg-white/90 border border-gray-300 text-black rounded-lg w-80 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          {results.length > 0 ? (
            results.map((item: any) => (
              <div key={item.ItemID} className="text-white">
                <h2 className="text-xl">{item.Title}</h2>
                {/* Add additional item details here if needed */}
              </div>
            ))
          ) : (
            <p className="text-white">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
