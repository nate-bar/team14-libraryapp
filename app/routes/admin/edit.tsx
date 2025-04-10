import { useEffect, useState } from "react";
import { type Items } from "~/services/api";
import { useNavigate } from "react-router";
import LoadingSpinner from "~/components/loadingspinner";
import "./edit.css";

export default function AdminEditPage() {
  const [items, setItems] = useState<Items[]>([]); // Initialize items as an empty array
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(itemId: number) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setMessage("Item deleted successfully.");
        loadItems(); // Reload items after deletion
      } else {
        setMessage(result.error || "Failed to delete item.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage("Error deleting item.");
      setIsLoading(false);
    }
  }

  function handleEditClick(item: Items) {
    // store selected item in local storage
    localStorage.setItem("editItem", JSON.stringify(item));
    // navigate to appropriate edit page
    navigate(`/admin/edit/${item.TypeName.toLowerCase()}/${item.ItemID}`);
  }

  return (
    <div className="admin-edit-container">
      {message && <p className="admin-edit-message">{message}</p>}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
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
                  <td className="h-20 w-24 object-scale-down">
                    {item.Photo ? (
                      <img
                        src={`data:image/jpeg;base64,${item.Photo}`}
                        alt={item.Title}
                        className="w-full h-20 object-contain rounded-lg mb-1"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 200"
                        className="w-full h-20 object-contain rounded-lg mb-1"
                        style={{ backgroundColor: "#f0f0f0" }}
                      >
                        <rect width="200" height="200" fill="#e0e0e0" />
                        <path
                          d="M50 75 L150 75 Q175 75, 175 100 L175 125 Q175 150, 150 150 L50 150 Q25 150, 25 125 L25 100 Q25 75, 50 75 Z"
                          fill="white"
                          stroke="#a0a0a0"
                          strokeWidth="2"
                        />
                        <text
                          x="100"
                          y="110"
                          fontFamily="Arial, sans-serif"
                          fontSize="16"
                          textAnchor="middle"
                          fill="#a0a0a0"
                        >
                          No Image
                        </text>
                        <path
                          d="M70 85 L130 135 M130 85 L70 135"
                          stroke="#a0a0a0"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </td>
                  <td>{item.Title}</td>
                  <td>{item.ItemID}</td>
                  <td>{item.TypeName}</td>
                  <td>{item.Status}</td>
                  <td className="space-x-5">
                    <button
                      className="admin-edit-delete-btn inline-block text-center"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>

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
      )}
    </div>
  );
}
