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
      });
  }, [selectedReport]); // Re-fetch data when the selected report changes

  return (
    <div className="container mx-auto p-6">

      {/* Dropdown for selecting reports */}
      <div className="mb-6">
        <label
          htmlFor="reportSelect"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Report:
        </label>
        <select
          id="reportSelect"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="userReport">User Report</option>
          <option value="Report2">Borrow Summary Report</option>
          <option value="bookDetailsReport">Book Details Report</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
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
                {selectedReport === "Report2" && (
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
              {selectedReport === "Report2" &&
                data.map((record: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {record.BorrowID}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.ItemID}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.DueDate}
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
        <p className="text-center text-gray-500">
          No data found for the selected report.
        </p>
      )}
    </div>
  );
};

export default Report;
