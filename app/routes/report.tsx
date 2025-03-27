import React, { useEffect, useState } from "react";

const Report = () => {
  const [data, setData] = useState([]); // Holds the fetched data
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState("userReport");

  useEffect(() => {
    // Fetch data based on the selected report
    let endpoint = "/api/users"; // Default endpoint for user report

    if (selectedReport === "userReport") {
      endpoint = "/api/users";
    } else if (selectedReport === "Report2") {
      endpoint = "/api/borrow-summary"; // Endpoint for borrow_summary_view
    }

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        setData(data); // Set the fetched data to the state
        setError(""); // Clear any previous errors
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      });
  }, [selectedReport]); // Re-fetch data when the selected report changes

  return (
    <div>
      <h1>Reports</h1>

      {/* Dropdown for selecting reports */}
      <label htmlFor="reportSelect">Select Report: </label>
      <select
        id="reportSelect"
        value={selectedReport}
        onChange={(e) => setSelectedReport(e.target.value)}
      >
        <option value="userReport">User Report</option>
        <option value="Report2">Borrow Summary Report</option>
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.length > 0 ? (
        <table border={1}>
          <thead>
            <tr>
              {/* Adjust table headers dynamically based on the selected report */}
              {selectedReport === "userReport" && (
                <>
                  <th>Member ID</th>
                  <th>First Name</th>
                  <th>Middle Name</th>
                  <th>Last Name</th>
                  <th>Group ID</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Birth Date</th>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th>Last Updated</th>
                  <th>Updated By</th>
                </>
              )}
              {selectedReport === "Report2" && (
                <>
                  <th>Borrow ID</th>
                  <th>Item ID</th>
                  <th>Due Date</th>
                  <th>Member Name</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Adjust table rows dynamically based on the selected report */}
            {selectedReport === "userReport" &&
              data.map((user: any, index: number) => (
                <tr key={index}>
                  <td>{user.MemberID}</td>
                  <td>{user.FirstName}</td>
                  <td>{user.MiddleName || "N/A"}</td>
                  <td>{user.LastName}</td>
                  <td>{user.GroupID}</td>
                  <td>{user.Email}</td>
                  <td>{user.PhoneNumber || "N/A"}</td>
                  <td>{user.BirthDate || "N/A"}</td>
                  <td>{user.Address}</td>
                  <td>{user.Balance}</td>
                  <td>{user.CreatedAt}</td>
                  <td>{user.CreatedBy || "N/A"}</td>
                  <td>{user.LastUpdated}</td>
                  <td>{user.UpdatedBy || "N/A"}</td>
                </tr>
              ))}
            {selectedReport === "Report2" &&
              data.map((record: any, index: number) => (
                <tr key={index}>
                  <td>{record.BorrowID}</td>
                  <td>{record.ItemID}</td>
                  <td>{record.DueDate}</td>
                  <td>{record.MemberName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No data found for the selected report.</p>
      )}
    </div>
  );
};

export default Report;