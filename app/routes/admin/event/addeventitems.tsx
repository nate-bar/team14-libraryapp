import React, { useEffect, useState, useRef } from "react";
import { type Event, type Items } from "~/services/api";
import "./addeventitems.css";

const AddItemToEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [items, setItems] = useState<Items[]>([]);
  const [filteredItems, setFilteredItems] = useState<Items[]>([]);
  const [selectedItems, setSelectedItems] = useState<Items[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [addItemStatus, setAddItemStatus] = useState<string | null>(null);
  const [addItemError, setAddItemError] = useState<string | null>(null);
  const [addSuccessMessages, setAddSuccessMessages] = useState<string[]>([]);
  const [addErrorMessages, setAddErrorMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
          const nonDeviceItems = data.filter(
            (item) => item.TypeName !== "Device"
          );
          setItems(nonDeviceItems);
          setFilteredItems(nonDeviceItems);
        } else {
          console.error("API did not return an array of items:", data);
          setItems([]);
          setFilteredItems([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = items
      .filter(
        (item) => !selectedItems.some((sel) => sel.ItemID === item.ItemID)
      )
      .filter((item) => item.Title.toLowerCase().includes(lowerQuery));
    setFilteredItems(filtered);
  }, [searchQuery, items, selectedItems]);

  const handleEventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = parseInt(event.target.value, 10);
    setSelectedEventId(isNaN(eventId) ? null : eventId);
    const selected = events.find((e) => e.EventID === eventId) || null;
    setSelectedEvent(selected);
  };

  const handleItemSelection = (item: Items) => {
    // Prevent adding duplicate items
    if (
      !selectedItems.some((selectedItem) => selectedItem.ItemID === item.ItemID)
    ) {
      setSelectedItems([...selectedItems, item]);
      setFilteredItems(
        filteredItems.filter(
          (filteredItem) => filteredItem.ItemID !== item.ItemID
        )
      ); // Remove selected item from search list
      setShowResults(false); // Close dropdown after selection
    }
  };

  const handleRemoveItem = (item: Items) => {
    setSelectedItems(
      selectedItems.filter(
        (selectedItem) => selectedItem.ItemID !== item.ItemID
      )
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddItemToEvent = async () => {
    if (!selectedEventId || selectedItems.length === 0) {
      setAddItemError("Please select both an event and at least one item.");
      setAddItemStatus(null);
      setAddSuccessMessages([]);
      setAddErrorMessages([]);
      return;
    }

    setAddItemStatus("Adding item(s)...");
    setAddSuccessMessages([]);
    setAddErrorMessages([]);

    try {
      const response = await fetch(`/api/events/${selectedEventId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ItemID: selectedItems.map((item) => item.ItemID),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        const results = responseData.results;
        if (Array.isArray(results)) {
          const successMessages = [];
          const errorMessages = [];

          results.forEach((res) => {
            if (res.success) {
              successMessages.push(
                `${res.itemName} added to ${res.eventName} successfully!`
              );
            } else {
              errorMessages.push(
                `Failed to add ${res.itemName || res.itemId}, ${res.error}`
              );
            }
          });

          setAddSuccessMessages(successMessages);
          setAddErrorMessages(errorMessages);
        }

        setSelectedEventId(null);
        setSelectedItems([]);
        setTimeout(() => {
          setAddItemStatus(null);
          setAddSuccessMessages([]);
          setAddErrorMessages([]);
        }, 10000);
      } else {
        setAddItemError(
          responseData?.error || `Failed to add item: ${response.status}`
        );
        setAddItemStatus(null);
        setAddSuccessMessages([]);
        setAddErrorMessages([]);
      }
    } catch (error: any) {
      console.error("Error adding item(s) to event:", error);
      setAddItemError(error.message || "An unexpected error occurred.");
      setAddItemStatus(null);
      setAddSuccessMessages([]);
      setAddErrorMessages([]);
    }
  };

  return (
    <div className="add-item-to-event-container">
      <h2 className="add-item-to-event-title">Event-Item Population Form</h2>

      {/* Event Selector */}
      <div className="add-item-to-event-entry-titles">Select Event:</div>
      <div className="form-search-dropdown-container">
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : (
          <select
            id="eventSelect"
            value={selectedEventId || ""}
            onChange={handleEventChange}
            className="form-search-bar"
          >
            <option value="">-- Select an Event --</option>
            {events.map((event) => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventName} (
                {new Date(event.StartDate).toLocaleDateString()} -{" "}
                {new Date(event.EndDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedEvent && selectedEvent.EventPhoto && (
        <div className="event-photo-display">
          <div className="add-item-to-event-entry-titles">Event Photo:</div>
          <img
            src={selectedEvent.EventPhoto}
            alt={selectedEvent.EventName}
            style={{ maxWidth: "400px", maxHeight: "500px" }}
          />
        </div>
      )}
      {selectedEvent && !selectedEvent.EventPhoto && (
        <p style={{ marginTop: "10px" }}>No photo available for this event.</p>
      )}

      {/* Item Search Input */}
      <div ref={searchContainerRef}>
        <div className="add-item-to-event-entry-titles">
          <label htmlFor="searchItems">Search for a Book or Media:</label>
        </div>
        <input
          id="searchItems"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items"
          className="form-search-bar"
          onClick={() => setShowResults(true)}
        />

        {showResults && (
          <div className="form-search-dropdown">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.ItemID}
                  className="form-search-dropdown-item"
                  onClick={() => handleItemSelection(item)}
                >
                  {item.Title}{" "}
                  <span className="available-items">({item.TypeName})</span>
                </div>
              ))
            ) : (
              <p className="available-items">No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Selected Items Display */}
      <div className="add-item-to-event-entry-titles">
        <label>Selected Items</label>
      </div>
      {selectedItems.length === 0 && <p>No items selected</p>}
      <div className="form-selected-items-container">
        {selectedItems.map((item) => (
          <div key={item.ItemID} className="form-selected-item">
            <span className="form-selected-item-text">
              {item.Title} ({item.TypeName})
            </span>
            <button
              onClick={() => handleRemoveItem(item)}
              className="remove-selected-item-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleAddItemToEvent}
        className="add-item-to-event-button"
        disabled={
          !selectedEventId ||
          selectedItems.length === 0 ||
          addItemStatus === "Adding item(s)..."
        }
      >
        Add Item to Event
      </button>

      {/* Status Messages */}
      {addErrorMessages.length > 0 && (
        <div className="add-item-to-event-error">
          {addErrorMessages.map((msg, index) => (
            <p
              key={`error-${index}`}
              dangerouslySetInnerHTML={{ __html: msg }}
            />
          ))}
        </div>
      )}
      {addSuccessMessages.length > 0 && (
        <div className="add-item-to-event-success">
          {addSuccessMessages.map((msg, index) => (
            <p
              key={`success-${index}`}
              dangerouslySetInnerHTML={{ __html: msg }}
            />
          ))}
        </div>
      )}
      {addItemError && addSuccessMessages.length === 0 && (
        <p
          className="add-item-to-event-error"
          dangerouslySetInnerHTML={{ __html: addItemError }}
        />
      )}
      {addItemStatus &&
        addSuccessMessages.length === 0 &&
        addErrorMessages.length === 0 &&
        addItemStatus !== "Adding item(s)..." && (
          <p
            className="add-item-to-event-success"
            dangerouslySetInnerHTML={{ __html: addItemStatus }}
          />
        )}
    </div>
  );
};

export default AddItemToEvent;
