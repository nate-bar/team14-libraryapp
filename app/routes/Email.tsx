import { useEffect, useState } from "react";
import "../routes/contactus.css";

export default function Email() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);

  useEffect(() => {
    // Step 1: Fetch session to get memberId
    fetch("/api/session")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((session) => {
        setMemberId(session.memberId);

        // Step 2: Fetch notifications
        return fetch(`/api/notifications/${session.memberId}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setHasUnread(data.some((n) => !n.is_read));
        setLoading(false);

        // Step 3: Mark all notifications as read
        if (memberId) {
          fetch(`/api/notifications/mark-read/${memberId}`, {
            method: "POST",
          });
        }
      })
      .catch((err) => {
        console.error("Error loading notifications or session:", err);
        setLoading(false);
      });
  }, [memberId]);

  return (
    <div className="contact-container">
      <h1 className="flex items-center gap-2">
        Notifications{" "}
        {hasUnread && (
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id} className={`notif ${n.is_read ? "read" : "unread"}`}>
              <strong>{n.type.replace(/_/g, " ").toUpperCase()}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
