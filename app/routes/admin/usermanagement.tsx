import React, { useState, useEffect } from "react";
import LoadingSpinner from "~/components/loadingspinner";
import "./usermanagement.css";

// Fetch users from the backend
async function displayUsers() {
  const res = await fetch("/api/users", { method: "GET" });
  const data = await res.json();
  return data;
}

export default function AdminUserDeletePage() {
  interface User {
    MemberID: number;
    FirstName: string;
    MiddleName: string | null; // MiddleName can be null
    LastName: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await displayUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setMessage("Error fetching users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleDelete(memberId: number): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/usersdelete/${memberId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("User deleted successfully.");
        setUsers(users.filter((user) => user.MemberID !== memberId));
      } else {
        setMessage(result.error || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("Error deleting user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-user-container">
      {message && (
        <p
          className={`admin-user-message ${
            message.includes("successfully") ? "success" : "error"
          }`}
        >
          {message}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="admin-user-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Member ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                First Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Middle Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Last Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.MemberID} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {user.MemberID}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.FirstName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.MiddleName || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.LastName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDelete(user.MemberID)}
                      className="admin-user-delete-btn"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
