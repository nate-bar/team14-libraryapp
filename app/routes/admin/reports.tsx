import React, { useEffect, useState } from "react";
import LoadingSpinner from "~/components/loadingspinner";
import "./reports.css";

const Report = () => {
  const [data, setData] = useState([]); // Holds the fetched data
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState("userReport");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data based on the selected report
    let endpoint = "/api/users"; // Default endpoint for user report
    setIsLoading(true); // Set loading state to true when starting a new fetch

    if (selectedReport === "userReport") {
      endpoint = "/api/users";
    } else if (selectedReport === "borrowSummary") {
      endpoint = "/api/borrow-summary"; // Endpoint for borrow_summary_view
    } else if (selectedReport === "bookDetailsReport") {
      endpoint = "/api/book-details"; // Endpoint for book_details_view
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
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false when fetch completes (success or error)
      });
  }, [selectedReport]); // Re-fetch data when the selected report changes

  return (
    <div className="report-container">
      {/* Dropdown for selecting reports */}
      <div className="mb-6">
        <label htmlFor="reportSelect" className="report-select-label">
          Select Report:
        </label>
        <select
          id="reportSelect"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="report-select"
          disabled={isLoading}
        >
          <option value="userReport">User Report</option>
          <option value="borrowSummary">Borrow Summary Report</option>
          <option value="bookDetailsReport">Book Details Report</option>
        </select>
      </div>

      {error && <p className="report-error">{error}</p>}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="report-table">
            <thead className="bg-gray-100">
              <tr>
                {/* Adjust table headers dynamically based on the selected report */}
                {selectedReport === "userReport" && (
                  <>
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
                      Group ID
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Email
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Phone Number
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Birth Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Address
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Balance
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Created At
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Created By
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Last Updated
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Updated By
                    </th>
                  </>
                )}
                {selectedReport === "borrowSummary" && (
                  <>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Borrow ID
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Item ID
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Due Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Member Name
                    </th>
                  </>
                )}
                {selectedReport === "bookDetailsReport" && (
                  <>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      ISBN
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Title
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Authors
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Genre
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Publisher
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Publication Year
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Language
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Adjust table rows dynamically based on the selected report */}
              {selectedReport === "userReport" &&
                data.map((user: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
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
                      {user.GroupID}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.Email}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.PhoneNumber || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.BirthDate || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.Address}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.Balance}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.CreatedAt}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.CreatedBy || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.LastUpdated}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.UpdatedBy || "N/A"}
                    </td>
                  </tr>
                ))}
              {selectedReport === "borrowSummary" &&
                data.map((record: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {record.BorrowID}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.ItemID}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.DueDate
                        ? new Date(record.DueDate).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.MemberName}
                    </td>
                  </tr>
                ))}
              {selectedReport === "bookDetailsReport" &&
                data.map((book: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {book.ISBN}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.Title}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.Authors}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.GenreName || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.Publisher || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.PublicationYear || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {book.Language || "N/A"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="report-empty">No data found for the selected report.</p>
      )}
    </div>
  );
};

export default Report;
