import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import React, { useEffect, useState } from "react";

// update this and api if you want more information
interface HoldItems {
  ItemID: number;
  Title: string;
  CreatedAt: string;
  Status: string;
}

export default function MyHolds() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdItems, setHoldItems] = useState<HoldItems[]>([]);
  const { memberID } = useOutletContext<AuthData>();

  const fetchHoldItems = () => {
    setIsLoading(true);
    setError(null);
    fetch(`/profile/api/holditems/${memberID}`)
      .then((response) => {
        // return an empty array if holditems returns 404
        if (response.status === 404) {
          return [];
        }
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setHoldItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch hold items: ${error.message}`);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchHoldItems();
  }, [memberID]);

  const handleCancelHold = (itemId: number) => {
    if (!confirm("Are you sure you want to cancel this hold request?")) {
      return;
    }

    fetch(`api/cancelhold`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemID: itemId,
        memberID: memberID,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        alert("Hold request cancelled successfully");
        // Refresh the hold items list
        fetchHoldItems();
      })
      .catch((error) => {
        alert(`Failed to cancel hold request: ${error.message}`);
      });
  };

  return (
    <div className="flex-grow justify-center h-full w-full pl-25 pr-25">
            <ProfilePage/>
      {isLoading ? (
        <p>Loading hold requests...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : holdItems.length > 0 ? (
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "8px" }}>
                  Requested On
                </th>
                <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdItems.map((item) => (
                <tr
                  key={item.ItemID}
                  style={{
                    border: "1px solid #ddd",
                  }}
                >
                  <td style={{ padding: "8px" }}>{item.Title}</td>
                  <td style={{ padding: "8px" }}>
                    {item.CreatedAt &&
                      new Date(item.CreatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px" }}>{item.Status || "Pending"}</td>
                  <td style={{ padding: "8px" }}>
                    <button
                      onClick={() => handleCancelHold(item.ItemID)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>You don't have any active hold requests</div>
      )}
    </div>
  );
}
