import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Device } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";

export default function DeviceDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authData = useOutletContext<AuthData>();

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itemdetail/${itemId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDevice(data);
      } catch (error) {
        console.error("Error fetching device:", error);
        setError("Failed to load device details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchDeviceDetails();
    }
  }, [itemId]);

  const handleHoldRequest = async () => {
    if (!authData.isLoggedIn) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("/api/holdrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemid: device?.ItemID,
          memberid: authData.memberID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // api returns 409 if device is already on hold for user
        if (response.status === 409) {
          throw new Error(
            data.error || "You already have a hold request for this device"
          );
        }
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      alert("Hold request submitted successfully");
    } catch (error) {
      console.error("Error submitting hold request:", error);
      alert(
        error instanceof Error ? error.message : "Error submitting hold request"
      );
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
          {device.Photo ? (
            <img
              src={`data:image/jpeg;base64,${device.Photo}`}
              alt={device.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
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

      <div className="item-actions">
        {/* if device is available, show add to cart button */}
        {device.Status === "Available" && <AddToCartButton item={device} />}
        {/* if device is checked out, show hold request button */}
        {device.Status === "Checked Out" && (
          <button
            className="btn btn-secondary hold-button"
            onClick={handleHoldRequest}
          >
            Place Hold Request
          </button>
        )}
      </div>
    </div>
  );
}
