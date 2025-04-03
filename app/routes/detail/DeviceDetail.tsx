import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type CartItem } from "~/services/api";
import { type Device } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";

export default function DeviceDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/itemdetail/${itemId}`)
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
        <div className="item-actions">
          <AddToCartButton item={device} />
        </div>
      </div>
    </div>
  );
}
