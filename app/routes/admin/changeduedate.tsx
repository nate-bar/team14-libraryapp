import React, { useEffect, useState } from "react";
import LoadingSpinner from "~/components/loadingspinner";
import type { UserProfile, BorrowedItem } from "~/services/api";
import "./changeduedate.css";

const ChangeDueDate = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });;
  const [loading, setLoading] = useState(true);
  

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const formatted = data.map((user: any) => ({
          memberId: user.MemberID,
          firstName: user.FirstName,
          middleName: user.MiddleName,
          lastName: user.LastName,
        }));
        setUsers(formatted);
      } catch (error) {
        console.error("Error fetching users:", error);
        setMessage({text:"Error fetching users.", type : "error"});
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Fetch borrowed items when user is selected
  useEffect(() => {
    async function fetchBorrowedItems() {
      if (!selectedUser) {
        setBorrowedItems([]);
        setSelectedItemId(null);
        setNewDueDate("");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/user-borrowed-items/${selectedUser.memberId}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length === 0) {
          setMessage({text:"This user has no borrowed items.", type : "error"});
          setBorrowedItems([]);
          setSelectedItemId(null);
        } else {
          setBorrowedItems(data);
          setMessage({ text: "", type: "" });
        }
      } catch (error) {
        console.error("Error fetching borrowed items:", error);
        setMessage({text: "Error fetching borrowed items.", type : "error"});
      } finally {
        setLoading(false);
      }
    }

    fetchBorrowedItems();
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedItemId || !newDueDate) {
      setMessage({ text: "Please select a user, item, and new due date.", type: "error" });
      return;
    }
  
    try {
      const res = await fetch("/api/update-due-date", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedUser.memberId,
          itemId: selectedItemId,
          newDueDate,
        }),
      });
  
      const result = await res.json();
      if (res.ok) {
        // ✅ Optimistically update local state
        setBorrowedItems(prev =>
          prev.map(item =>
            item.ItemID === selectedItemId ? { ...item, DueDate: newDueDate } : item
          )
        );
        setMessage({ text: "Due date updated successfully.", type: "success" });
      } else {
        setMessage({ text: result.error || "Failed to update due date.", type: "error" });
      }
    } catch (error) {
      console.error("Error updating due date:", error);
      setMessage({ text: "Error updating due date.", type: "error" });
    }

    setBorrowedItems(prev =>
      prev.map(item =>
        item.ItemID === selectedItemId ? { ...item, DueDate: newDueDate } : item
      )
    );
  };

  const selectedItem = borrowedItems.find(item => item.ItemID === selectedItemId);

  const isSubmitDisabled =
  !selectedUser ||
  !selectedItemId ||
  !newDueDate ||
  borrowedItems.length === 0 ||
  (selectedItem && selectedItem.DueDate?.split("T")[0] === newDueDate);

  return (
    <div className="change-due-date-container">
      <h2 className="change-due-date-title">Item Due Date Editor</h2>

      {/* User Select */}
      <label className="change-due-date-title">Select a User:</label>
      <div className="change-due-date-dropdown">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <select
            value={selectedUser?.memberId || ""}
            onChange={(e) => {
              const member = users.find((u) => u.memberId === Number(e.target.value));
              setSelectedUser(member || null);
              setSelectedItemId(null);
              setNewDueDate("");
            }}
          >
            <option value="">-- Select a User --</option>
            {users.map((user) => (
              <option key={user.memberId} value={user.memberId}>
                {user.firstName} {user.middleName || ""} {user.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Item Select */}
      <label className="change-due-date-title">Select Item Borrowed:</label>
      <div className="change-due-date-dropdown">
        <select
          value={selectedItemId || ""}
          onChange={(e) => {
            setSelectedItemId(Number(e.target.value));
            setNewDueDate("");
          }}
          disabled={!selectedUser || borrowedItems.length === 0}
        >
          <option value="">-- Select an Item --</option>
          {borrowedItems.map((item) => (
            <option key={item.ItemID} value={item.ItemID}>
              {item.Title} ({item.TypeName})
            </option>
          ))}
          {selectedUser && borrowedItems.length === 0 && (
            <option disabled>-- No items borrowed by this user --</option>
          )}
        </select>
      </div>

      {/* Current Due Date */}
      {selectedItem && (
      <div className="change-due-date-title">
        Current Due Date:
        <p className="current-due-date">
          {new Date(selectedItem.DueDate).toLocaleDateString("en-US", {
            timeZone: "UTC",
          })}
        </p>
      </div>
      )}

      {/* Book Photo */}
      {selectedItem?.PhotoBase64 && (
        <img
          src={selectedItem.PhotoBase64}
          alt={selectedItem.Title}
          className="item-image"
          style={{ maxWidth: "400px", maxHeight: "500px" }}
        />
      )}

      {/* Date Picker */}
      <label className="change-due-date-title">New Due Date:</label>
      <input
        type="date"
        className="change-due-date-input"
        value={newDueDate}
        onChange={(e) => setNewDueDate(e.target.value)}
        disabled={!selectedItemId}
      />

      <button
        onClick={handleSubmit}
        className={`change-due-date-button ${isSubmitDisabled ? "disabled" : ""}`}
        disabled={isSubmitDisabled}
      >
        Update Due Date
      </button>

      {message.text && (
      <p className={`change-due-datestatus-message ${message.type}`}>
        {message.text}
      </p>
      )}
    </div>
  );
};

export default ChangeDueDate;
