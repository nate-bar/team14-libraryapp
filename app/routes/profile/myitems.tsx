import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import ProfilePage from "./profile";

interface borrowedItems {
  ItemID: number;
  Title: string;
  DueDate: string;
}

export default function MyItems() {
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();
  const [overdueCount, setOverdueCount] = useState(0);
  const [items, setItems] = useState<borrowedItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<borrowedItems[]>([]);
  const [returnStatus, setReturnStatus] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const calculateOverdueItems = (items: borrowedItems[]) => {
    const today = new Date().toISOString().split("T")[0];
    const overdue = items.filter((item) => item.DueDate < today).length;
    setOverdueCount(overdue);
  };

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/profile/borroweditems/${memberID}`)
      .then((response) => {
        if (response.status === 404) return [];
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setItems(data);
        calculateOverdueItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(`Failed to fetch items: ${error.message}`);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectItem = (item: borrowedItems) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some(
        (selectedItem) => selectedItem.ItemID === item.ItemID
      );
      return isSelected
        ? prev.filter((selectedItem) => selectedItem.ItemID !== item.ItemID)
        : [...prev, item];
    });
  };

  const isItemSelected = (itemId: number) => {
    return selectedItems.some((item) => item.ItemID === itemId);
  };

  const handleReturnItems = () => {
    if (selectedItems.length === 0) {
      setReturnStatus("No items selected for return");
      return;
    }

    setIsReturning(true);
    setReturnStatus("Processing return...");

    const itemIds = selectedItems.map((item) => item.ItemID);

    fetch(`/api/profile/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemIds }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        setReturnStatus(
          `✅ Successfully returned ${selectedItems.length} item(s)`
        );
        setSelectedItems([]);
        fetchData();
        setIsReturning(false);
      })
      .catch((error) => {
        setReturnStatus(`❌ Failed to return items: ${error.message}`);
        setIsReturning(false);
      });
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="w-full h-full px-6 py-4">
      <ProfilePage />

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          📚 My Borrowed Items
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading borrowed items...</p>
        ) : error ? (
          <p className="text-red-600 font-medium text-center">{error}</p>
        ) : items.length > 0 ? (
          <>
            {returnStatus && (
              <div
                className={`mb-4 p-3 rounded-md text-sm font-medium ${
                  returnStatus.includes("Failed")
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {returnStatus}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-[#76c6de] text-gray-700">
                  <tr>
                    <th className="text-left py-2 px-4">Select</th>
                    <th className="text-left py-2 px-4">Title</th>
                    <th className="text-left py-2 px-4">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.ItemID}
                      className={`transition hover:bg-indigo-50 ${
                        isItemSelected(item.ItemID) ? "bg-[#e4c9a8]" : ""
                      } border-t`}
                    >
                      <td className="py-2 px-4">
                        <input
                          type="checkbox"
                          checked={isItemSelected(item.ItemID)}
                          onChange={() => handleSelectItem(item)}
                          className="h-4 w-4 text-indigo-600 rounded"
                        />
                      </td>
                      <td className="py-2 px-4">{item.Title}</td>
                      <td className="py-2 px-4">
                        {item.DueDate &&
                          new Date(item.DueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-6 text-center">
                <p className="mb-2 text-gray-600">
                  {selectedItems.length} item(s) selected
                </p>
                <button
                  onClick={handleReturnItems}
                  disabled={isReturning}
                  className={`px-5 py-2 rounded-lg text-white font-medium transition ${
                    isReturning
                      ? "bg-[#76c6de] cursor-not-allowed"
                      : "bg-[#01497c] hover:bg-[#75c6de]"
                  }`}
                >
                  {isReturning ? "Processing..." : "Return Selected Items"}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">
            You have no borrowed items.
          </p>
        )}
      </div>
    </div>
  );
}
