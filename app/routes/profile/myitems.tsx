import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import ProfilePage from "./profile";
interface borrowedItems {
  ItemID: number;
  Title: string;
  DueDate: string;
}

export default function MyItems() {
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();
  const [overdueCount, setOverdueCount] = useState(0);
  const [items, setItems] = React.useState<borrowedItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<borrowedItems[]>([]);
  const [returnStatus, setReturnStatus] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Count overdue items
  const calculateOverdueItems = (items: borrowedItems[]) => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const overdue = items.filter((item) => item.DueDate < today).length;
    setOverdueCount(overdue);
  };

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    fetch(`/profile/api/borroweditems/${memberID}`)
      .then((response) => {
        // return an empty array here if borroweditems returns 404
        if (response.status === 404) {
          return [];
        }
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch items: ${error.message}`);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectItem = (item: borrowedItems) => {
    setSelectedItems((prev) => {
      // Check if item is already selected
      const isSelected = prev.some(
        (selectedItem) => selectedItem.ItemID === item.ItemID
      );

      if (isSelected) {
        // Remove item if already selected
        return prev.filter(
          (selectedItem) => selectedItem.ItemID !== item.ItemID
        );
      } else {
        // Add item if not selected
        return [...prev, item];
      }
    });
  };

  const isItemSelected = (itemId: number) => {
    return selectedItems.some((item) => item.ItemID === itemId);
  };

  const handleReturnItems = () => {
    if (selectedItems.length === 0) {
      setReturnStatus("No items selected for return");
      return;
    }

    setIsReturning(true);
    setReturnStatus("Processing return...");

    const itemIds = selectedItems.map((item) => item.ItemID);

    fetch(`/profile/api/return`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: itemIds,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setReturnStatus(
          `Successfully returned ${selectedItems.length} item(s)`
        );
        setSelectedItems([]);
        // Refresh the list after successful return
        fetchData();
        setIsReturning(false);
      })
      .catch((error) => {
        setReturnStatus(`Failed to return items: ${error.message}`);
        setIsReturning(false);
      });
  };

  // if user is not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex-grow justify-center h-full w-full pl-25 pr-25">
        <ProfilePage/>
      {isLoading ? (
        <p>Loading borrowed items...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : items.length > 0 ? (
        <div>
          <h3>Borrowed Items</h3>

          {returnStatus && (
            <div
              style={{
                margin: "10px 0",
                padding: "10px",
                backgroundColor: returnStatus.includes("Failed")
                  ? "#ffebee"
                  : "#e8f5e9",
                borderRadius: "4px",
              }}
            >
              {returnStatus}
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Select</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.ItemID}
                  style={{
                    backgroundColor: isItemSelected(item.ItemID)
                      ? "#f0f0ff"
                      : "transparent",
                    border: "1px solid #ddd",
                  }}
                >
                  <td style={{ padding: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isItemSelected(item.ItemID)}
                      onChange={() => handleSelectItem(item)}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>{item.Title}</td>
                  <td style={{ padding: "8px" }}>
                    {item.DueDate &&
                      new Date(item.DueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedItems.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <p>{selectedItems.length} item(s) selected</p>
              <button
                onClick={handleReturnItems}
                disabled={isReturning}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isReturning ? "not-allowed" : "pointer",
                  opacity: isReturning ? 0.7 : 1,
                }}
              >
                {isReturning ? "Processing..." : "Return Selected Items"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>No items checked out</div>
      )}
    </div>
  );
}
