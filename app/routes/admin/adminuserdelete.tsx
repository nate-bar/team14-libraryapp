import React, { useState, useEffect } from "react";

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
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Users</h1>
      {message && (
        <p
          className={`text-center mb-4 ${
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
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
                <td colSpan={5} className="text-center py-4">
                  Loading...
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
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
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
