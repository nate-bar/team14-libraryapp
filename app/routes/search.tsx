import React from "react";
import "./style.css";

const Search: React.FC = () => {
  return (
    <div className="bg-image flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-xl font-bold mb-4">Search</p>
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded-lg w-80 px-4 py-2 text-left"
        />
      </div>
    </div>
  );
};

export default Search;
