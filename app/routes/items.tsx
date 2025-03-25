import React, { useEffect, useState } from "react";

const UsingFetch = () => {
  const [items, setItems] = useState<any[]>([]);

  const fetchData = () => {
    fetch("/api/items")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data); // Ensure data is an array
        } else {
          console.error("API did not return an array:", data);
          setItems([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setItems([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Items</h1>
      {items.length > 0 ? (
        <table className="table-auto">
          <thead>
            <tr>
              <th>ItemID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ItemID}>
                <td>{item.ItemID}</td>
                <td>{item.Title}</td>
                <td>{item.TypeName}</td>
                <td>{item.Status}</td>
                <td>
                  {item.PhotoBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${item.PhotoBase64}`}
                      alt={item.Title}
                      style={{ width: "100px", height: "auto" }}
                    />
                  ) : (
                    "No Photo"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
};

export default UsingFetch;