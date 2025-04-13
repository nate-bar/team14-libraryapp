import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import ProfilePage from "./profile";
import "./borrowinghistory.css";

interface BorrowRecord {
  BorrowID: number;
  ItemID: number;
  Title: string;
  TypeName: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate?: string;
  FineAccrued?: number;
}

export default function BorrowingHistory() {
  const { memberID } = useOutletContext<AuthData>();
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all"); // "all", "current", "returned", "overdue"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchBorrowingHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/borrowing-history/${memberID}`);

        if (!response.ok) {
          throw new Error("Failed to fetch borrowing history");
        }

        const data = await response.json();
        setBorrowingRecords(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching borrowing history:", err);
        setError("Could not load borrowing history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowingHistory();
  }, [memberID]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatus = (record: BorrowRecord): string => {
    if (record.ReturnDate) {
      return "Returned";
    }

    const today = new Date();
    const dueDate = new Date(record.DueDate);

    if (dueDate < today) {
      return "Overdue";
    }

    return "Current";
  };

  const filteredRecords = borrowingRecords.filter((record) => {
    // Apply status filter
    if (filter !== "all") {
      const status = getStatus(record);
      if (filter === "current" && status !== "Current") return false;
      if (filter === "returned" && status !== "Returned") return false;
      if (filter === "overdue" && status !== "Overdue") return false;
    }

    // Apply date range filter
    if (startDate) {
      const recordDate = new Date(record.BorrowDate);
      const filterStart = new Date(startDate);

      // Set time to beginning of day for consistent comparison
      filterStart.setHours(0, 0, 0, 0);

      if (recordDate < filterStart) return false;
    }

    if (endDate) {
      const recordDate = new Date(record.BorrowDate);
      const filterEnd = new Date(endDate);

      // Set time to end of day for consistent comparison
      filterEnd.setHours(23, 59, 59, 999);

      if (recordDate > filterEnd) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ProfilePage />
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalItems: borrowingRecords.length,
    currentlyBorrowed: borrowingRecords.filter((record) => !record.ReturnDate)
      .length,
    overdue: borrowingRecords.filter((record) => {
      if (record.ReturnDate) return false;
      const today = new Date();
      const dueDate = new Date(record.DueDate);
      return dueDate < today;
    }).length,
    returnedOnTime: borrowingRecords.filter((record) => {
      if (!record.ReturnDate) return false;
      const returnDate = new Date(record.ReturnDate);
      const dueDate = new Date(record.DueDate);
      return returnDate <= dueDate;
    }).length,
    totalFines: borrowingRecords.reduce(
      (sum, record) => sum + (record.FineAccrued || 0),
      0
    ),
  };

  return (
    <div>
      <ProfilePage />
      <div className="borrowing-history-container">
        <h2 className="section-title">Borrowing History</h2>

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-card">
            <div className="stat-number">{stats.totalItems}</div>
            <div className="stat-label">Total Borrows</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.currentlyBorrowed}</div>
            <div className="stat-label">Currently Borrowed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Overdue Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.returnedOnTime}</div>
            <div className="stat-label">Returned On Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {formatCurrency(stats.totalFines)}
            </div>
            <div className="stat-label">Total Fines</div>
          </div>
        </div>

        <div className="filter-controls">
          <div className="date-filter">
            <div className="date-range-title">Filter by Borrow Date:</div>
            <div className="date-inputs">
              <div className="date-field">
                <label htmlFor="startDate">From:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-field">
                <label htmlFor="endDate">To:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          <div className="status-filter">
            <label htmlFor="filter" className="filter-label">
              Status:
            </label>
            <select
              id="filter"
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="current">Currently Borrowed</option>
              <option value="returned">Returned Items</option>
              <option value="overdue">Overdue Items</option>
            </select>
          </div>

          <button
            className="reset-button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setFilter("all");
            }}
          >
            Reset Filters
          </button>
        </div>

        <div className="results-count">
          Showing {filteredRecords.length} of {borrowingRecords.length} records
        </div>

        {filteredRecords.length > 0 ? (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Returned On</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const status = getStatus(record);

                  return (
                    <tr
                      key={record.BorrowID}
                      className={`status-${status.toLowerCase()}`}
                    >
                      <td>{record.Title}</td>
                      <td>{record.TypeName}</td>
                      <td>{formatDate(record.BorrowDate)}</td>
                      <td>{formatDate(record.DueDate)}</td>
                      <td>
                        {record.ReturnDate
                          ? formatDate(record.ReturnDate)
                          : "Not returned"}
                      </td>
                      <td
                        className={`status-cell status-${status.toLowerCase()}`}
                      >
                        {status}
                      </td>
                      <td>{formatCurrency(record.FineAccrued)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-records">
            <p>No borrowing records found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
