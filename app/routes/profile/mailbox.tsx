import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import LoadingSpinner from "~/components/loadingspinner";
import "./mailbox.css";
import ProfilePage from "./profile";

export default function Mailbox() {
  const authData = useOutletContext();  // Use context to get auth data (including memberID)
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);  // Track modal visibility
  const [expandedNotification, setExpandedNotification] = useState(null);  // Store the notification to expand

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notifications/${authData.memberID}`);

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("No Notifications at this time. Check Again Later");
      } finally {
        setLoading(false);
      }
    };

    if (authData && authData.memberID) {
      fetchNotifications();
    }
  }, [authData.memberID]);

  const openModal = (notification) => {
    setExpandedNotification(notification);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setExpandedNotification(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error || "No notifications available"}</p>
      </div>
    );
  }

  return (
    <div>
        <ProfilePage/>
    <div className="mailbox-container">
      <h2>Your Notifications</h2>
      <ul className="notifications-list">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className="notification-item"
            onClick={() => openModal(notification)}  // Open the modal when a notification is clicked
          >
            <div className="notification-type">{notification.type}</div>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {new Date(notification.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>


      {modalOpen && expandedNotification && (
        <div className="notification-modal">
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content">
            <h3>Notification Details</h3>
            <div className="modal-type">{expandedNotification.type}</div>
            <div className="modal-message">{expandedNotification.fullMessage}</div>
            <div className="modal-time">
              {new Date(expandedNotification.created_at).toLocaleString()}
            </div>
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
