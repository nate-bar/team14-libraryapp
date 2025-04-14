import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { type AuthData } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import NoImage from "~/components/imgplaceholder";
import type { EventItem , Event} from "~/services/api";
import './eventpage.css';

const EventPage: React.FC = () => {
  const { eventId } = useParams(); // Get the EventID from the URL parameter
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [event, setEvent] = useState<Event | null>(null); // State to store event details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!eventId) {
          setError("Event ID not provided.");
          setLoading(false);
          return;
        }
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error(`HTTP error! status: ${eventResponse.status} fetching event details`);
        }
        const eventData: Event = await eventResponse.json();
        setEvent(eventData);

        // Fetch event items
        const itemsResponse = await fetch(`/api/events/${eventId}/items`);
        if (!itemsResponse.ok && itemsResponse.status !== 404) { // Check for non-404 errors
          throw new Error(`HTTP error! status: ${itemsResponse.status} fetching event items`);
        }
        const itemsData: EventItem[] = await itemsResponse.json();
        setEventItems(itemsData);

        if (itemsResponse.status === 404) {
          setEventItems([]); // Treat a 404 from items as an empty array
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">Error loading event details: {error}</div>;
  }

  if (!eventId || !event) {
    return <div className="error-message">Invalid event ID or event not found.</div>;
  }

  return (
    <div className="event-detail-page container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{event.EventName}</h2> {/* Display event name */}
      <h3 className="text-xl font-semibold mb-3 text-gray-700">Event Items</h3>
      {eventItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {eventItems.map((item) => (
            <div key={item.ItemID} className="card rounded-lg shadow-md p-4 bg-white">
              <Link to={`/${item.TypeName}/${item.ItemID}`} className="block">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">{item.Title}</h3>
                {item.Photo ? (
                  <img
                    src={`data:image/jpeg;base64,${item.Photo}`}
                    alt={item.Title}
                    className="w-full h-32 object-contain rounded-md mb-2"
                  />
                ) : (
                  <NoImage className="w-full h-32 object-contain rounded-md mb-2" />
                )}
                <p className="text-sm text-gray-600 mb-1">Type: {item.TypeName}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Status: <span className={`font-semibold ${item.Status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>{item.Status}</span>
                </p>
                {item.GenreName && <p className="text-sm text-gray-600 mb-1">Genre: {item.GenreName}</p>}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{event.EventName} event has no items! Check back later!</p>
      )}
    </div>
  );
};

export default EventPage;