import React, { useEffect, useState } from "react";
import "./edit.css";
interface Item {
  ItemID: string;
  Title: string;
  TypeName: string;
  Status: string;
  PhotoBase64: string | null; // Handle cases where PhotoBase64 might be null
}

export default function AdminEditPage() {
  const [items, setItems] = useState<Item[]>([]); // Initialize items as an empty array
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await res.json();
      console.log("Fetched items:", data); // Debugging
      setItems(data || []); // Ensure items is always an array
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]); // Set items to an empty array on error
    }
  }

  async function handleDelete(itemId: string) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setMessage("Item deleted successfully.");
        loadItems(); // Reload items after deletion
      } else {
        setMessage(result.error || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage("Error deleting item.");
    }
  }
  return (
    <div className="admin-edit-container">
      {message && <p className="admin-edit-message">{message}</p>}
      <table className="admin-edit-table">
        <thead>
          <tr className="admin-bar">
            <th>Photo</th>
            <th>Title</th>
            <th>Item ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.ItemID}>
                <td>
                  <img
                    className="admin-edit-photo"
                    src={
                      item.PhotoBase64
                        ? `data:image/jpeg;base64,${item.PhotoBase64}`
                        : "/placeholder.jpg"
                    }
                    alt={item.Title}
                  />
                </td>
                <td>{item.Title}</td>
                <td>{item.ItemID}</td>
                <td>{item.TypeName}</td>
                <td>{item.Status}</td>
                <td>
                  <button
                    className="admin-edit-delete-btn"
                    onClick={() => handleDelete(item.ItemID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="admin-edit-empty" colSpan={6}>
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}