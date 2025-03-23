import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type CartItem } from "~/services/api";
import { type Device } from "~/services/api";

export default function DeviceDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/devicedetail/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDevice(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  const handleAction = (action: "In Cart" | "On Hold") => {
    if (!device) return;

    try {
      // Get current cart or initialize empty array
      let cart: CartItem[] = [];
      const cartData = sessionStorage.getItem("shoppingCart");

      if (cartData) {
        cart = JSON.parse(cartData);
        console.log("Existing cart loaded:", cart);
      }

      // Check if item already exists
      if (!cart.some((item) => item.ItemID === device.ItemID)) {
        // Create a simplified item object
        const newItem: CartItem = {
          ItemID: device.ItemID,
          Title: device.Title,
          TypeName: device.TypeName,
          Status: device.Status,
          Category: action,
        };

        cart.push(newItem);
        const newCartString = JSON.stringify(cart);
        sessionStorage.setItem("shoppingCart", newCartString);
        window.dispatchEvent(new Event("cartUpdated"));
        console.log("Item added, new cart:", cart);
        alert(`${device.Title} added to ${action}`);
      } else {
        alert(`${device.Title} is already in the cart`);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("There was an error adding the item to cart");
    }
  };

  if (loading) {
    return (
      <div className="item-container">
        <h2>Loading device details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="item-container">
        <h2>Device not found</h2>
      </div>
    );
  }

  return (
    <div className="item-container">
      <h1 className="item-title">{device.Title}</h1>

      <div className="item-info">
        <div className="info-section">
          <p>
            <strong>Type:</strong> {device.DeviceType}
          </p>
          <p>
            <strong>Manufacturer:</strong> {device.Manufacturer}
          </p>
        </div>

        <div className="info-section">
          <p>
            <strong>Status:</strong> {device.Status}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="item-actions">
        {/* Checkout/Hold Button Based on Status */}
        {device.Status === "Available" ? (
          <button
            className="btn btn-primary"
            onClick={() => handleAction("In Cart")}
          >
            Add to Cart
          </button>
        ) : device.Status === "Checked Out" ? (
          <button
            className="btn btn-warning"
            onClick={() => handleAction("On Hold")}
          >
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
