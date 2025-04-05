import React, { useEffect, useState } from "react";
import "./reports.css";

const Report = () => {
  interface BorrowedBookRecord {
    FirstName: string;
    LastName: string;
    Email: string;
    BookTitle: string;
    ISBN: string;
    Authors: string;
    Publisher: string;
    PublicationYear: number;
    summary: string;
    BorrowDate: string;
    DueDate: string;
    ReturnDate?: string;
    BorrowStatus: string;
    FineAccrued?: number;
  }
  
  const [data, setData] = useState<BorrowedBookRecord[]>([]); // Holds the fetched data
  const [filteredData, setFilteredData] = useState<BorrowedBookRecord[]>([]); // Holds the filtered data
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState("userBorrowedBooksReport");
  const [summaryStats, setSummaryStats] = useState({
    checkedOutBooks: 0,
    overdueBooks: 0,
    totalFines: 0,
    returningToday: 0,
  });
  
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Additional filter states
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "borrowed", "returned", "overdue"
  const [userFilter, setUserFilter] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [sortBy, setSortBy] = useState("dueDate"); // Default sort by due date
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  // Get unique users for filter dropdown
  const getUniqueUsers = (): string[] => {
    if (!data.length) return [];
    const users = data.map(item => `${item.FirstName} ${item.LastName}`);
    return [...new Set(users)].sort();
  };

  useEffect(() => {
    // Fetch data based on the selected report
    let endpoint = "/api/user-borrowed-books-report"; // Default endpoint for the new report

    if (selectedReport === "userBorrowedBooksReport") {
      endpoint = "/api/user_borrowed_books_report";
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
        setFilteredData(data); // Initialize filtered data with all data
        setError(""); // Clear any previous errors
        updateStats(data); // Calculate initial stats
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      });
  }, [selectedReport]); // Re-fetch data when the selected report changes
  
  // Function to update statistics based on provided data
  const updateStats = (dataToProcess: BorrowedBookRecord[]) => {
    if (selectedReport === "userBorrowedBooksReport") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const checkedOut: number = dataToProcess.filter((item: BorrowedBookRecord) => 
        item.BorrowStatus === "Borrowed").length;
      
      const overdue: number = dataToProcess.filter((item: BorrowedBookRecord) => {
        return item.BorrowStatus === "Borrowed" && new Date(item.DueDate) < today;
      }).length;
      
      const returningToday: number = dataToProcess.filter((item: BorrowedBookRecord) => {
        const dueDate = new Date(item.DueDate);
        dueDate.setHours(0, 0, 0, 0);
        return item.BorrowStatus === "Borrowed" && 
               dueDate.getTime() === today.getTime();
      }).length;
      
      const totalFines: number = dataToProcess.reduce((sum: number, item: BorrowedBookRecord) => 
        sum + (item.FineAccrued || 0), 0);
      
      setSummaryStats({
        checkedOutBooks: checkedOut,
        overdueBooks: overdue,
        totalFines: totalFines,
        returningToday: returningToday
      });
    }
  };
  
  // Apply all filters
  const applyFilters = () => {
    let filtered = [...data];
    
    // Apply date filter
    if (startDate || endDate) {
      filtered = filtered.filter(record => {
        const borrowDate = new Date(record.BorrowDate);
        let matchesStart = true;
        let matchesEnd = true;
        
        if (startDate) {
          const start = new Date(startDate);
          matchesStart = borrowDate >= start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Set to end of day
          matchesEnd = borrowDate <= end;
        }
        
        return matchesStart && matchesEnd;
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (statusFilter === "borrowed") {
        filtered = filtered.filter(record => record.BorrowStatus === "Borrowed");
      } else if (statusFilter === "returned") {
        filtered = filtered.filter(record => record.BorrowStatus === "Returned");
      } else if (statusFilter === "overdue") {
        filtered = filtered.filter(record => 
          record.BorrowStatus === "Borrowed" && new Date(record.DueDate) < today);
      } else if (statusFilter === "dueToday") {
        filtered = filtered.filter(record => {
          const dueDate = new Date(record.DueDate);
          dueDate.setHours(0, 0, 0, 0);
          return record.BorrowStatus === "Borrowed" && dueDate.getTime() === today.getTime();
        });
      }
    }
    
    // Apply user filter
    if (userFilter) {
      filtered = filtered.filter(record => 
        `${record.FirstName} ${record.LastName}`.toLowerCase().includes(userFilter.toLowerCase()));
    }
    
    // Apply book filter
    if (bookFilter) {
      filtered = filtered.filter(record => 
        record.BookTitle.toLowerCase().includes(bookFilter.toLowerCase()) || 
        record.Authors.toLowerCase().includes(bookFilter.toLowerCase()));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case "dueDate":
          valueA = new Date(a.DueDate).getTime();
          valueB = new Date(b.DueDate).getTime();
          break;
        case "borrowDate":
          valueA = new Date(a.BorrowDate).getTime();
          valueB = new Date(b.BorrowDate).getTime();
          break;
        case "userName":
          valueA = `${a.FirstName} ${a.LastName}`.toLowerCase();
          valueB = `${b.FirstName} ${b.LastName}`.toLowerCase();
          break;
        case "bookTitle":
          valueA = a.BookTitle.toLowerCase();
          valueB = b.BookTitle.toLowerCase();
          break;
        case "fine":
          valueA = a.FineAccrued || 0;
          valueB = b.FineAccrued || 0;
          break;
        default:
          valueA = new Date(a.DueDate).getTime();
          valueB = new Date(b.DueDate).getTime();
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredData(filtered);
    updateStats(filtered);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setUserFilter("");
    setBookFilter("");
    setSortBy("dueDate");
    setSortOrder("asc");
    setFilteredData(data);
    updateStats(data);
  };

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
        >
          <option value="userBorrowedBooksReport">User Borrowed Books Report</option>
          <option value="Report2">Borrow Summary Report</option>
          <option value="bookDetailsReport">Book Details Report</option>
        </select>
      </div>

      {/* Enhanced filter panel */}
      {selectedReport === "userBorrowedBooksReport" && (
        <div className="filter-panel bg-gray-50 p-4 rounded mb-6">
          <h3 className="text-lg font-bold mb-4">Filters</h3>
          
          <div className="filter-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date filter section */}
            <div className="filter-section">
              <h4 className="font-semibold mb-2">Borrow Date Range:</h4>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm">Start:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm">End:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Status filter */}
            <div className="filter-section">
              <h4 className="font-semibold mb-2">Status:</h4>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="all">All Statuses</option>
                <option value="borrowed">Currently Borrowed</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
                <option value="dueToday">Due Today</option>
              </select>
            </div>
            
            {/* User filter */}
            <div className="filter-section">
              <h4 className="font-semibold mb-2">Search by User:</h4>
              <input
                type="text"
                placeholder="Enter user name"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            
            {/* Book filter */}
            <div className="filter-section">
              <h4 className="font-semibold mb-2">Search by Book/Author:</h4>
              <input
                type="text"
                placeholder="Enter book title or author"
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>
          
          {/* Sorting options */}
          <div className="sorting-section mb-4">
            <h4 className="font-semibold mb-2">Sort By:</h4>
            <div className="flex flex-wrap gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded p-2"
              >
                <option value="dueDate">Due Date</option>
                <option value="borrowDate">Borrow Date</option>
                <option value="userName">User Name</option>
                <option value="bookTitle">Book Title</option>
                <option value="fine">Fine Amount</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border rounded p-2"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          
          {/* Filter buttons */}
          <div className="filter-buttons flex gap-2">
            <button 
              onClick={applyFilters} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button 
              onClick={resetFilters} 
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Summary Statistics Cards */}
      {selectedReport === "userBorrowedBooksReport" && (
        <div className="summary-stats-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-blue-100 p-4 rounded shadow">
            <h3 className="text-lg font-bold text-blue-800">Checked Out</h3>
            <p className="text-2xl">{summaryStats.checkedOutBooks}</p>
          </div>
          <div className="stat-card bg-red-100 p-4 rounded shadow">
            <h3 className="text-lg font-bold text-red-800">Overdue</h3>
            <p className="text-2xl">{summaryStats.overdueBooks}</p>
          </div>
          <div className="stat-card bg-amber-100 p-4 rounded shadow">
            <h3 className="text-lg font-bold text-amber-800">Due Today</h3>
            <p className="text-2xl">{summaryStats.returningToday}</p>
          </div>
          <div className="stat-card bg-green-100 p-4 rounded shadow">
            <h3 className="text-lg font-bold text-green-800">Total Fines</h3>
            <p className="text-2xl">${summaryStats.totalFines.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Results count */}
      {selectedReport === "userBorrowedBooksReport" && (
        <div className="results-count mb-2 text-gray-600">
          Showing {filteredData.length} of {data.length} records
        </div>
      )}

      {error && <p className="report-error">{error}</p>}

      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="report-table">
            <thead className="bg-gray-100">
              <tr>
                {/* Simplified headers for borrowed books report */}
                {selectedReport === "userBorrowedBooksReport" && (
                  <>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      User
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Book Title
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Authors
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Borrow Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Due Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Fine
                    </th>
                  </>
                )}
                {/* Other reports remain unchanged */}
              </tr>
            </thead>
            <tbody>
              {/* Rows for borrowed books report */}
              {selectedReport === "userBorrowedBooksReport" &&
                filteredData.map((record, index) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const dueDate = new Date(record.DueDate);
                  dueDate.setHours(0, 0, 0, 0);
                  
                  const isOverdue = record.BorrowStatus === "Borrowed" && dueDate < today;
                  const isDueToday = record.BorrowStatus === "Borrowed" && dueDate.getTime() === today.getTime();
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${
                      isOverdue ? "bg-red-50" : 
                      isDueToday ? "bg-amber-50" : ""
                    }`}>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.FirstName} {record.LastName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.BookTitle}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Authors}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(record.BorrowDate).toLocaleDateString()}
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 ${isOverdue ? "font-bold text-red-700" : isDueToday ? "font-bold text-amber-700" : ""}`}>
                        {new Date(record.DueDate).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.BorrowStatus}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        ${record.FineAccrued ? record.FineAccrued.toFixed(2) : "0.00"}
                      </td>
                    </tr>
                  );
                })}
              {/* Other reports remain unchanged */}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="report-empty">No data found for the selected filters.</p>
      )}
    </div>
  );
};

export default Report;