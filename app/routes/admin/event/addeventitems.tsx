import React, { useEffect, useState } from "react";
import {type Event , type Items } from "~/services/api";
import "./addeventitems.css";

const AddItemToEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [items, setItems] = useState<Items[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [addItemStatus, setAddItemStatus] = useState<string | null>(null);
  const [addItemError, setAddItemError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch events
    fetch("/api/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEvents(data);
        setLoadingEvents(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoadingEvents(false);
      });

    // Fetch items
    fetch("/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter out "Device" type items
          const nonDeviceItems = data.filter((item) => item.TypeName !== "Device");
          setItems(nonDeviceItems);
        } else {
          console.error("API did not return an array of items:", data);
          setItems([]);
        }
        setLoadingItems(false);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        setLoadingItems(false);
      });
  }, []);

  const handleEventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = parseInt(event.target.value, 10);
    setSelectedEventId(isNaN(eventId) ? null : eventId);
  };

  const handleItemChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(event.target.value, 10);
    setSelectedItemId(isNaN(itemId) ? null : itemId);
  };

  const handleAddItemToEvent = async () => {
    if (!selectedEventId || !selectedItemId) {
      setAddItemError("Please select both an event and an item.");
      setAddItemStatus(null);
      return;
    }

    setAddItemStatus("Adding item...");
    setAddItemError(null);

    try {
      const response = await fetch(`/api/events/${selectedEventId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ItemID: selectedItemId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setAddItemStatus(`${responseData.itemName} added to ${responseData.eventName} event successfully!`);
        setSelectedItemId(null);
        setTimeout(() => setAddItemStatus(null), 4000);
      } else {
        const errorData = await response.json();
        setAddItemError(errorData?.error || `Failed to add item: ${response.status}`);
        setAddItemStatus(null);
      }
    } catch (error: any) {
      console.error("Error adding item to event:", error);
      setAddItemError(error.message || "An unexpected error occurred.");
      setAddItemStatus(null);
    }
  };

  return (
    <div className="add-item-to-event-container">
      <h2 className="add-item-to-event-title">Select Event Then Item</h2>
      <div className="mb-4">
        <label htmlFor="eventSelect" className="add-item-to-event-label">
          Select Event:
        </label>
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : (
          <select
            id="eventSelect"
            value={selectedEventId || ""}
            onChange={handleEventChange}
            className="add-item-to-event-select"
          >
            <option value="">-- Select an Event --</option>
            {events.map((event) => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventName} ({new Date(event.StartDate).toLocaleDateString()} -{" "}
                {new Date(event.EndDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="itemSelect" className="add-item-to-event-label">
          Select Item to Add:
        </label>
        {loadingItems ? (
          <p>Loading items...</p>
        ) : (
          <select
            id="itemSelect"
            value={selectedItemId || ""}
            onChange={handleItemChange}
            className="add-item-to-event-select"
            disabled={!selectedEventId}
          >
            <option value="">-- Select an Item --</option>
            {items.map((item) => (
              <option key={item.ItemID} value={item.ItemID}>
                {item.Title} ({item.TypeName})
              </option>
            ))}
          </select>
        )}
        {!selectedEventId && (
          <p className="add-item-to-event-status">Please select an event first.</p>
        )}
      </div>

      <button
        onClick={handleAddItemToEvent}
        className="add-item-to-event-button"
        disabled={!selectedEventId || !selectedItemId || addItemStatus === "Adding item..."}
      >
        {"Add Item to Event"}
      </button>

      {addItemError && <p className="add-item-to-event-error">{addItemError}</p>}
      {addItemStatus && addItemStatus !== "Adding item..." && (
        <p className="add-item-to-event-success">{addItemStatus}</p>
      )}
    </div>
  );
};

export default AddItemToEvent;