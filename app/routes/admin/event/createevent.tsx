import { useState, useRef } from "react";
import { createEvent }  from "~/services/api";
import "./createevent.css";

export default function CreateEventPage() {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(startDate) > new Date(endDate)) {
      setMessage("Start date must be before end date!");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setMessage("End date must be after start date!");
      return;
    }

    if (!photo) {
      setMessage("Event photo is required!");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const formData = new FormData();
    formData.append("EventName", eventName);
    formData.append("StartDate", startDate);
    formData.append("EndDate", endDate);
    formData.append("photo", photo);

    setIsSubmitting(true);

    try {
      const result = await createEvent(formData);
      setMessage(`${eventName} event has been created! `);
      setEventName("");
      setStartDate("");
      setEndDate("");
      setPhoto(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      setMessage(`Failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPreviewUrl(null);
    }
  };

  const formIsValid =
    eventName.trim() !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    photo !== null &&
    new Date(startDate) <= new Date(endDate);

  return (
    <div className="create-event-container">
      <h1 className="create-event-title">Event Creation Form</h1>
      <form onSubmit={handleSubmit} className="create-event-form">
      <label className="create-event-label">Event Name:</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="create-event-name"
          required
        />
        <label className="create-event-label">Event Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (new Date(e.target.value) > new Date(endDate)) {
              setMessage("Start date must be before end date!");
            } else {
              setMessage("");
            }
          }}
          className="create-event-date"
          required
        />
        <label className="create-event-label">Event End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            if (new Date(startDate) > new Date(e.target.value)) {
              setMessage("End date must be after start date!");
            } else {
              setMessage("");
            }
          }}
          className="create-event-date"
          required
        />
        <label className="custom-file-upload">
          <input
            type="file"
            accept=".jpg, image/jpeg/*"
            onChange={handlePhotoChange}
            className="create-event-file-input"
            ref={fileInputRef}
            required
          />
        Upload Photo
      </label>
      <span className="file-chosen-text">
        {photo ? `Chosen file: ${photo.name}` : "No file chosen"}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Event preview"
            className="create-event-image-preview"
          />
        )}
      </span>
      <button
        type="submit"
        className="create-event-button"
        disabled={isSubmitting || !formIsValid}
      >
        {isSubmitting ? "Creating Event..." : "Create Event"}
      </button>
      </form>
      {message && <p className="create-event-message">{message}</p>}
    </div>
  );
}
