import React, { useEffect, useState, useRef } from "react";
import { type Event, type Items } from "~/services/api";
import ConfirmationModal from "~/components/confirmationmodal";
import "./editevent.css";


const EditEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventItems, setEventItems] = useState<Items[]>([]);
  const [itemsToRemove, setItemsToRemove] = useState<number[]>([]);
  const [removedItemsDisplay, setRemovedItemsDisplay] = useState<Items[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const EventPhotoInputRef = useRef<HTMLInputElement>(null);
  const [newEventPhoto, setNewEventPhoto] = useState<File | null>(null);
  const [newEventPhotoPreview, setNewEventPhotoPreview] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [maxDescriptionLength] = useState(150);
  const [originalEvent, setOriginalEvent] = useState<Event | null>(null);
  const [originalItems, setOriginalItems] = useState<Items[]>([]);
  

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading events", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setEventDescription(selectedEvent.EventDescription);
    } else {
      setEventDescription('');
    }
  }, [selectedEvent]);

  const handleEventSelect = (eventId: number) => {
    const event = events.find(e => e.EventID === eventId) || null;
    setSelectedEvent(event);
    setOriginalEvent(event ? { ...event } : null);
    setItemsToRemove([]);
    setRemovedItemsDisplay([]);
    setNewEventPhoto(null);
    setNewEventPhotoPreview(null);

    if (eventId) {
      setItemsLoading(true);
      fetch(`/api/events/${eventId}/items`)
        .then(res => res.json())
        .then(data => {
          const fetchedItems = Array.isArray(data) ? data : [];
          setEventItems(fetchedItems);
          setOriginalItems([...fetchedItems]);
          setItemsLoading(false);
        })
        .catch(err => {
          console.error("Error loading event items", err);
          setItemsLoading(false);
        });
    } else {
      setEventItems([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEvent) return;
    const { name, value } = e.target;
    setSelectedEvent(prev => {
      if (!prev) return null;

      if (name === "EventName") {
        return { ...prev, EventName: value };
      } else if (name === "StartDate") {
        return { ...prev, StartDate: value };
      } else if (name === "EndDate") {
        return { ...prev, EndDate: value };
      }
      return prev;
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxDescriptionLength) {
      setEventDescription(newValue);
      setSelectedEvent(prev => prev ? { ...prev, EventDescription: newValue } : null);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    const itemToRemove = eventItems.find(item => item.ItemID === itemId);
    if (itemToRemove) {
      setItemsToRemove(prev => [...prev, itemId]);
      setRemovedItemsDisplay(prev => [...prev, itemToRemove]);
      setEventItems(prev => prev.filter(item => item.ItemID !== itemId));
    }
  };

  const handleUndoItem = (itemId: number) => {
    setItemsToRemove(prev => prev.filter(id => id !== itemId));
    const itemToUndo = removedItemsDisplay.find(item => item.ItemID === itemId);
    if (itemToUndo) {
      setEventItems(prev => [...prev, itemToUndo]);
      setRemovedItemsDisplay(prev => prev.filter(item => item.ItemID !== itemId));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewEventPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEventPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewEventPhoto(null);
      setNewEventPhotoPreview(null);
    }
  };

  const formatDateForBackend = (dateString: string): string => {
    return dateString.slice(0, 10);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    setStatusMsg(null);
    setSaving(true);
    
    const formData = new FormData();
    formData.append("EventName", selectedEvent.EventName);
    formData.append("StartDate", formatDateForBackend(selectedEvent.StartDate));
    formData.append("EndDate", formatDateForBackend(selectedEvent.EndDate));
    formData.append("EventDescription", selectedEvent.EventDescription);
    if (newEventPhoto) {
      formData.append("EventPhoto", newEventPhoto);
    }
    
    try {
      const res = await fetch(`/api/events/${selectedEvent.EventID}`, {
        method: "PUT",
        body: formData,
      });
    
      const result = await res.json();
      if (!res.ok) {
        setStatusMsg(`Failed to update event: ${result.error}`);
        return;
      }
    
      if (itemsToRemove.length > 0) {
        const removeRes = await fetch(`/api/events/${selectedEvent.EventID}/items/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ItemIDs: itemsToRemove }),
        });
    
        const removeResult = await removeRes.json();
        if (!removeRes.ok) {
          setStatusMsg(`Failed to remove items: ${removeResult.error}`);
          return;
        }
      }
  
      setSelectedEvent(prev => prev ? {
      ...prev,
      ...result,
      EventDescription: eventDescription,
      ...(newEventPhotoPreview && { EventPhoto: newEventPhotoPreview }),
      }
      : null
      );
    
    setItemsToRemove([]);
    setRemovedItemsDisplay([]);
    setNewEventPhoto(null);
    setNewEventPhotoPreview(null);
    setStatusMsg("Event updated successfully!");

    setTimeout(() => {
      setStatusMsg(null);
    }, 3000);
  
  } catch (err: any) {
      console.error(err);
      setStatusMsg("An unexpected error occurred.");
    } finally {
        setSaving(false);
      }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;
    setIsDeleteModalOpen(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.EventID}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStatusMsg("Event deleted successfully.");
        setEvents(prev => prev.filter(e => e.EventID !== selectedEvent.EventID));
        setSelectedEvent(null);
        setEventItems([]);
        setItemsToRemove([]);
        setRemovedItemsDisplay([]);
        setTimeout(() => {
          setStatusMsg(null);
        }, 3000);
      } else {
        const errData = await res.json();
        setStatusMsg(`Failed to delete event: ${errData.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg("An error occurred while deleting the event.");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteEvent = () => {
    setIsDeleteModalOpen(false);
  };

  const defaultEvent = {
    EventID: 0,
    EventName: "",
    StartDate: new Date().toISOString().slice(0, 10),
    EndDate: new Date().toISOString().slice(0, 10),
    EventDescription: "",
    EventPhoto: "",
  };

  const hasChanges = () => {
    if (!selectedEvent || !originalEvent) {
      return false;
    }

    const fieldsChanged = (
      selectedEvent.EventName !== originalEvent.EventName ||
      selectedEvent.StartDate.slice(0, 10) !== originalEvent.StartDate.slice(0, 10) ||
      selectedEvent.EndDate.slice(0, 10) !== originalEvent.EndDate.slice(0, 10) ||
      selectedEvent.EventDescription !== originalEvent.EventDescription
    );

    const photoChanged = !!newEventPhoto;
    const itemsChanged = itemsToRemove.length > 0;
    const hasAnyChange = fieldsChanged || photoChanged || itemsChanged;

    return hasAnyChange;
  };

  useEffect(() => {
    if (selectedEvent) {
      setOriginalEvent({ ...selectedEvent });
    } else {
      setOriginalEvent(null);
    }
  }, [selectedEvent?.EventID]);

  return (
    <div className="edit-event-container">
      <h2 className="edit-event-title"> Event Editor Form</h2>

      {/* Event Selector */}
      <div className="event-select-title">Select an Event:</div>
      <div className="event-select-dropdown">
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          <select onChange={e => handleEventSelect(Number(e.target.value))} value={selectedEvent?.EventID || ''}>
            <option value="">-- Select an Event --</option>
            {events.map(event => (
              <option key={event.EventID} value={event.EventID}>
                {event.EventName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Event Details */}
      <div className="event-edit-titles">
        Event Name:
        <input
          type="text"
          name="EventName"
          className="event-edit-input"
          value={selectedEvent?.EventName || defaultEvent.EventName}
          onChange={handleInputChange}
        />
      </div>

      <div className="event-edit-titles">
        Event Description:
        <textarea
          value={eventDescription}
          onChange={handleDescriptionChange}
          className="create-event-description"
          maxLength={maxDescriptionLength}
          required
        ></textarea>
      </div>
      <div className="character-count">
          {eventDescription.length}/{maxDescriptionLength} characters
        </div>

      <div className="event-edit-titles">
        Start Date:
        <input
          type="date"
          name="StartDate"
          className="event-edit-input"
          value={selectedEvent?.StartDate?.slice(0, 10) || defaultEvent.StartDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="event-edit-titles">
        End Date:
        <input
          type="date"
          name="EndDate"
          className="event-edit-input"
          value={selectedEvent?.EndDate?.slice(0, 10) || defaultEvent.EndDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="event-edit-titles">
      Event Photo:
      <input
        type="file"
        name="EventPhoto"
        accept=".jpg, image/jpeg/*"
        className="event-edit-photo-field-hidden"
        onChange={handlePhotoChange}
        ref={EventPhotoInputRef}
        id="eventPhotoUpload"
      />
      <label htmlFor="eventPhotoUpload" className="edit-custom-file-upload">
      {newEventPhoto ? newEventPhoto.name : (selectedEvent?.EventPhoto ? 'Change Photo' : 'Upload Photo')}
      </label>
      </div>

      <div className="event-photo-preview">
      <h3 style={{padding: '4px'}}>{newEventPhotoPreview ? 'New Photo Preview:' : selectedEvent?.EventPhoto ? 'Current Photo:' : 'No Photo To Display'}</h3>
      {newEventPhotoPreview && (
        <img
        src={newEventPhotoPreview}
        alt="New Event Preview"
        style={{ maxWidth: '400px', maxHeight: '500px', marginBottom: '10px' }}
        />
      )}

      {!newEventPhotoPreview && selectedEvent?.EventPhoto && (
       <img
        src={selectedEvent.EventPhoto}
        alt={selectedEvent.EventName}
        style={{ maxWidth: '400px', maxHeight: '500px', marginBottom: '10px' }}
        />
        )}
      </div>

      <h3 className="event-edit-titles">Current Event Items</h3>
      {itemsLoading ? (
        <p>Loading items...</p>
      ) : eventItems.length === 0 ? (
        <p style={{ marginBottom: '10px' }}>No items in this event.</p>
      ) : (
        <ul className="item-list">
          {eventItems.map(item => (
            <li className="item-list-items" key={item.ItemID}>
              {item.Title} ({item.TypeName})
              <button onClick={() => handleRemoveItem(item.ItemID)} className="remove-item-button">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="event-edit-titles">Items to Remove</h3>
      {removedItemsDisplay.length === 0 ? (
        <p style={{ marginBottom: '10px' }}>No items marked for removal.</p>
      ) : (
        <ul className="item-list">
          {removedItemsDisplay.map(item => (
            <li className="item-list-items" key={item.ItemID}>
              {item.Title}
              <button onClick={() => handleUndoItem(item.ItemID)} className="undo-item-button">
                Undo
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Buttons to Save Changes or Delete Event */}
      <div className="edit-event-buttons">
      <button
        onClick={handleUpdateEvent}
        disabled={!hasChanges() || saving || !selectedEvent}
        className="save-changes-button"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        onClick={openDeleteModal}
        disabled={!selectedEvent || deleting}
        className="delete-event-button"
      >
        {deleting ? "Deleting..." : "Delete Event"}
      </button>
    </div>

      {/* Status Message */}
      {statusMsg && (
        <p
          style={{
            color:
              statusMsg.includes("Event deleted successfully") ? "red" : "blue",
          }}
        >
          {statusMsg}
        </p>
      )}
        <ConfirmationModal
        isOpen={isDeleteModalOpen}
        message={`Are you sure you want to delete the event "${selectedEvent?.EventName}" and all its items? This action cannot be undone.`}
        onConfirm={confirmDeleteEvent}
        onCancel={cancelDeleteEvent}
      />
    </div>
  );
};

export default EditEvent;