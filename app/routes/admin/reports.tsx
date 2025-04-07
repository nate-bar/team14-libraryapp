import React, { useEffect, useState } from "react";
import "./reports.css";
const Report = () => {
  // Interface for all borrowed item types
  interface BorrowedItemRecord {
    FirstName: string;
    LastName: string;
    Email: string;
    ItemTitle: string;
    ItemType: string;
    ISBN?: string;
    Authors?: string;
    Director?: string;
    Format?: string;
    DeviceType?: string;
    Manufacturer?: string;
    BorrowDate: string;
    DueDate: string;
    ReturnDate?: string;
    BorrowStatus: string;
    FineAccrued?: number;
  }
  
  const [data, setData] = useState<BorrowedItemRecord[]>([]);
  const [filteredData, setFilteredData] = useState<BorrowedItemRecord[]>([]);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState("userBorrowedItemsReport");
  const [summaryStats, setSummaryStats] = useState({
    overdueItems: 0,
    totalFines: 0,
    bookCount: 0,
    mediaCount: 0,
    deviceCount: 0
  });
  
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  
  useEffect(() => {
    // Fetch data based on selected report
    const endpoint = "/api/user-borrowed-items-report";
    
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        setData(data);
        setFilteredData(data);
        updateStats(data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      });
  }, [selectedReport]);
  
  // Update statistics based on data
  const updateStats = (dataToProcess: BorrowedItemRecord[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdue = dataToProcess.filter(item => 
      item.BorrowStatus === "Borrowed" && new Date(item.DueDate) < today
    ).length;
    
    const totalFines = dataToProcess.reduce((sum, item) => 
      sum + (item.FineAccrued || 0), 0);
    
    const bookCount = dataToProcess.filter(item => 
      item.ItemType?.toLowerCase().includes('book')).length;
    
    const mediaCount = dataToProcess.filter(item => 
      item.ItemType?.toLowerCase().includes('media')).length;
    
    const deviceCount = dataToProcess.filter(item => 
      item.ItemType?.toLowerCase().includes('device')).length;
    
    setSummaryStats({
      overdueItems: overdue,
      totalFines: totalFines,
      bookCount,
      mediaCount,
      deviceCount
    });
  };
  
  // Apply all filters
  const applyFilters = () => {
    let filtered = [...data];
    
    // Apply date filter
    if (startDate || endDate) {
      filtered = filtered.filter(record => {
        const borrowDate = new Date(record.BorrowDate);
        let matchesStart = true, matchesEnd = true;
        
        if (startDate) {
          matchesStart = borrowDate >= new Date(startDate);
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59);
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
      }
    }
    
    // Apply item type filter
    if (itemTypeFilter !== "all") {
      if (itemTypeFilter === "book") {
        filtered = filtered.filter(record => record.ISBN !== null && record.ISBN !== undefined);
      } else if (itemTypeFilter === "media") {
        filtered = filtered.filter(record => record.Director !== null && record.Director !== undefined);
      } else if (itemTypeFilter === "device") {
        filtered = filtered.filter(record => record.DeviceType !== null && record.DeviceType !== undefined);
      }
    }
    
    setFilteredData(filtered);
    updateStats(filtered);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setItemTypeFilter("all");
    setFilteredData(data);
    updateStats(data);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="report-container">
      {/* Report selection */}
      <div className="mb-6">
        <label htmlFor="reportSelect">Select Report:</label>
        <select
          id="reportSelect"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
        >
          <option value="userBorrowedItemsReport">User Borrowed Items Report</option>
          <option value="Report2">Borrow Summary Report</option>
          <option value="bookDetailsReport">Book Details Report</option>
        </select>
      </div>

      {/* Filters */}
      {selectedReport === "userBorrowedItemsReport" && (
        <div className="filter-panel p-4 rounded mb-6">
          <h3 className="mb-4">Filters</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Date filter */}
            <div>
              <h4 className="mb-2">Borrow Date Range:</h4>
              <div className="flex gap-4">
                <div>
                  <label htmlFor="startDate">Start:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="endDate">End:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <h4 className="mb-2">Status:</h4>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="borrowed">Currently Borrowed</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            {/* Item Type filter */}
            <div>
              <h4 className="mb-2">Item Type:</h4>
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
              >
                <option value="all">All Item Types</option>
                <option value="book">Books</option>
                <option value="media">Media</option>
                <option value="device">Devices</option>
              </select>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={applyFilters} className="bg-blue-600 text-white px-4 py-2 rounded">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="bg-gray-300 px-4 py-2 rounded">
              Reset All
            </button>
          </div>
        </div>
      )}
      
      {/* Summary Statistics */}
      {selectedReport === "userBorrowedItemsReport" && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-red-100 p-4 rounded shadow">
            <h3 className="text-red-800">Overdue</h3>
            <p className="text-2xl">{summaryStats.overdueItems}</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <h3 className="text-green-800">Total Fines</h3>
            <p className="text-2xl">${summaryStats.totalFines.toFixed(2)}</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded shadow">
            <h3 className="text-indigo-800">Books</h3>
            <p className="text-2xl">{summaryStats.bookCount}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded shadow">
            <h3 className="text-purple-800">Media</h3>
            <p className="text-2xl">{summaryStats.mediaCount}</p>
          </div>
          <div className="bg-cyan-100 p-4 rounded shadow">
            <h3 className="text-cyan-800">Devices</h3>
            <p className="text-2xl">{summaryStats.deviceCount}</p>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-2 text-gray-600">
        Showing {filteredData.length} of {data.length} records
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Data table */}
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">User</th>
                <th className="border px-4 py-2 text-left">Item Type</th>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Details</th>
                <th className="border px-4 py-2 text-left">Borrow Date</th>
                <th className="border px-4 py-2 text-left">Due Date</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Fine</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record, index) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const dueDate = new Date(record.DueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                const isOverdue = record.BorrowStatus === "Borrowed" && dueDate < today;
                const isDueToday = record.BorrowStatus === "Borrowed" && dueDate.getTime() === today.getTime();
                
                // Determine details based on item type
                let details = '';
                if (record.ISBN) {
                  details = record.Authors || '';
                } else if (record.Director) {
                  details = record.Director ? `Dir: ${record.Director}` : '';
                  if (record.Format) details += details ? `, ${record.Format}` : record.Format;
                } else if (record.DeviceType) {
                  details = record.Manufacturer || '';
                }
                
                return (
                  <tr key={index} className={isOverdue ? "bg-red-50" : isDueToday ? "bg-amber-50" : ""}>
                    <td className="border px-4 py-2">
                      {record.FirstName} {record.LastName}
                    </td>
                    <td className="border px-4 py-2">{record.ItemType}</td>
                    <td className="border px-4 py-2">{record.ItemTitle}</td>
                    <td className="border px-4 py-2">{details}</td>
                    <td className="border px-4 py-2">{formatDate(record.BorrowDate)}</td>
                    <td className={`border px-4 py-2 ${isOverdue ? "font-bold text-red-700" : ""}`}>
                      {formatDate(record.DueDate)}
                    </td>
                    <td className="border px-4 py-2">{record.BorrowStatus}</td>
                    <td className="border px-4 py-2">
                      ${record.FineAccrued ? record.FineAccrued.toFixed(2) : "0.00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data found for the selected filters.</p>
      )}
    </div>
  );
};

export default Report;