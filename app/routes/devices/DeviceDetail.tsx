import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";

interface Device {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
}

interface CartItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Category: "Bookmark" | "Check Out" | "On Hold";
}

export default function DeviceDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetch(`/api/itemdevice/${itemId}`)
      .then((response) => response.json())
      .then((data) => setDevice(data))
      .catch((error) => console.error("Error fetching device:", error));
  }, [itemId]);

  const handleAction = (action: "Bookmark" | "Check Out" | "On Hold") => {
    if (!device) return;

    const cart: CartItem[] = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

    // Prevent duplicates
    if (!cart.some((item) => item.ItemID === device.ItemID)) {
      cart.push({
        ...device,
        Category: action,
      });

      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      alert(`${device.Title} added to ${action}`);
    } else {
      alert(`${device.Title} is already in the ${action} section`);
    }
  };

  if (!device) {
    return <div className="item-container"><h2>Loading device details...</h2></div>;
  }

  return (
    <div className="item-container">
      <h1 className="item-title">{device.Title}</h1>
      <div className="item-info">
        <p><strong>Type:</strong> {device.TypeName}</p>
        <p><strong>Status:</strong> {device.Status}</p>
      </div>

      {/* Action Buttons */}
      <div className="item-actions">
        {/* Bookmark Button */}
        <button className="btn btn-secondary" onClick={() => handleAction("Bookmark")}>
          Bookmark
        </button>

        {/* Checkout/Hold Button Based on Status */}
        {device.Status === "Available" ? (
          <button className="btn btn-primary" onClick={() => handleAction("Check Out")}>
            Check Out
          </button>
        ) : device.Status === "Checked Out" ? (
          <button className="btn btn-warning" onClick={() => handleAction("On Hold")}>
            Place on Hold
          </button>
        ) : (
          <button className="btn btn-disabled" disabled>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
