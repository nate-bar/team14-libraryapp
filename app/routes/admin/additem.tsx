import React, { useState } from "react";
import "./admin.css";
export default function AddItem() {
  const [formType, setFormType] = useState("book"); // Toggle between "book" and "media" ande "itemdevice"
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    authors: "",
    genreId: "",
    publisher: "",
    publicationYear: "",
    languageId: "",
    photo: null as File | null,
    director: "",
    leads: "",
    releaseYear: "",
    format: "",
    rating: "",
    deviceId: "",
    deviceName: "",
    deviceType: "",
    manufacturer: "",
  });
  const [message, setMessage] = useState("");
  const genres = [
    { id: 101, name: "Adventure" },
    { id: 102, name: "Art" },
    { id: 103, name: "Autobiography" },
    { id: 104, name: "Biography" },
    { id: 105, name: "Childrens" },
    { id: 106, name: "Classic" },
    { id: 107, name: "Cooking" },
    { id: 108, name: "Crime" },
    { id: 109, name: "Detective" },
    { id: 110, name: "Fable" },
    { id: 111, name: "Fairy Tale" },
    { id: 112, name: "Fantasy" },
    { id: 113, name: "Graphic Novel" },
    { id: 114, name: "Health & Fitness" },
    { id: 115, name: "Historical Fiction" },
    { id: 116, name: "Horror" },
    { id: 117, name: "Humor" },
    { id: 118, name: "Law" },
    { id: 119, name: "Memoir" },
    { id: 120, name: "Mythology" },
    { id: 121, name: "Poetry" },
    { id: 122, name: "Religion" },
    { id: 123, name: "Romance" },
    { id: 124, name: "Science Fiction" },
    { id: 125, name: "Self-Help" },
    { id: 126, name: "Short Story" },
    { id: 127, name: "Suspense" },
    { id: 128, name: "Thriller" },
    { id: 129, name: "Young Adult" },
    { id: 130, name: "Western" },
    { id: 201, name: "Action" },
    { id: 202, name: "Adventure" },
    { id: 203, name: "Documentary" },
    { id: 204, name: "Drama" },
    { id: 205, name: "Historical" },
    { id: 206, name: "Historical Fiction" },
    { id: 207, name: "Horror" },
    { id: 208, name: "Musical" },
    { id: 209, name: "Noir" },
    { id: 210, name: "Romantic Comedy" },
    { id: 211, name: "Satire" },
    { id: 212, name: "Sports" },
    { id: 213, name: "Thriller" },
    { id: 214, name: "Western" },
  ];

  const languages = [
    { id: 0, name: "English" },
    { id: 1, name: "Spanish" },
    { id: 2, name: "Chinese" },
    { id: 3, name: "French" },
    { id: 4, name: "German" },
  ];

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null;
    setFormData((prev) => ({ ...prev, photo: file }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("genreId", formData.genreId || "");
    formDataToSend.append("languageId", formData.languageId);
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    if (formType === "book") {
      formDataToSend.append("isbn", formData.isbn);
      formDataToSend.append("authors", formData.authors || "");
      formDataToSend.append("publisher", formData.publisher || "");
      formDataToSend.append("publicationYear", formData.publicationYear || "");
    } else if (formType === "media") {
      formDataToSend.append("director", formData.director || "");
      formDataToSend.append("leads", formData.leads || "");
      formDataToSend.append("releaseYear", formData.releaseYear || "");
      formDataToSend.append("format", formData.format || "");
      formDataToSend.append("rating", formData.rating || "");
  } else if (formType === "device") {
    formDataToSend.append("deviceId", formData.deviceId || "");
    formDataToSend.append("deviceName", formData.deviceName || "");
    formDataToSend.append("deviceType", formData.deviceType || "");
    formDataToSend.append("manufacturer", formData.manufacturer || "");
  }
  try {
    const endpoint =
      formType === "book"
        ? "/api/admin/add-book"
        : formType === "media"
        ? "/api/admin/add-media"
        : "/api/admin/add-device";
  
    const response = await fetch(endpoint, {
      method: "POST",
      body: formDataToSend,
    });
  
    const result = await response.json();
    if (response.ok) {
      setMessage(
        `${formType.charAt(0).toUpperCase() + formType.slice(1)} added successfully!`
      );
      setFormData({
        isbn: "",
        title: "",
        authors: "",
        genreId: "",
        publisher: "",
        publicationYear: "",
        languageId: "",
        photo: null,
        director: "",
        leads: "",
        releaseYear: "",
        format: "",
        rating: "",
        deviceId: "",
        deviceName: "",
        deviceType: "",
        manufacturer: "",
      });
    } else {
      setMessage(result.error || `Failed to add ${formType}.`);
    }
  } catch (error) {
    console.error(`Error adding ${formType}:`, error);
    setMessage(`An error occurred while adding the ${formType}.`);
  }  
  }

  return (
<div className="admin-container">
      <h1 className="admin-header" >Admin Portal - Add {formType === "book" ? "Book" : "Media"}</h1>
      {message && <p className="admin-message">{message}</p>}
      <div className="admin-buttons">
        <button className="admin-button" onClick={() => setFormType("book")}>Add Book</button>
        <button className="admin-button" onClick={() => setFormType("media")}>Add Media</button>
        <button className="admin-button" onClick={() => setFormType("device")}>Add Device</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
      {(formType === "book" || formType === "media") && (
  <>
    <select
      className="admin-select"
      name="genreId"
      value={formData.genreId}
      onChange={handleChange}
      required
    >
      <option value="">Select Genre</option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.name}
        </option>
      ))}
    </select>
    <select
      className="admin-select"
      name="languageId"
      value={formData.languageId}
      onChange={handleChange}
      required
    >
      <option value="">Select Language</option>
      {languages.map((language) => (
        <option key={language.id} value={language.id}>
          {language.name}
        </option>
      ))}
    </select>
  </>
)}
        <div className="admin-file-section">
  <div className="admin-line" />
  <div className="admin-file-wrapper">
    <label htmlFor="photo-upload" className="admin-file-label">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-3.586-3.586a2 2 0 00-2.828 0L5 7M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7m-5 4v4" />
      </svg>
      Choose File
    </label>
    <input
      id="photo-upload"
      className="admin-file-input"
      type="file"
      name="photo"
      accept="image/*"
      onChange={handleFileChange}
    />
    {formData.photo && (
      <span className="admin-file-name">{formData.photo.name}</span>
    )}
  </div>
  <div className="admin-line" />
</div>

        {formType === "book" && (
          <>
          
            <input className="admin-input"
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
                <input
      className="admin-input"
      type="text"
      name="title"
      placeholder="Title"
      value={formData.title}
      onChange={handleChange}
      required
    />
            <input 
            className="admin-input"
              type="text"
              name="authors"
              placeholder="Authors (Optional)"
              value={formData.authors}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="publisher"
              placeholder="Publisher (Optional)"
              value={formData.publisher}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="publicationYear"
              placeholder="Publication Year (Optional)"
              value={formData.publicationYear}
              onChange={handleChange}
            />
          </>
        )}
        {formType === "media" && (
          <>
            <input
            className="admin-input"
              type="text"
              name="director"
              placeholder="Director (Optional)"
              value={formData.director}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="leads"
              placeholder="Leads (Optional)"
              value={formData.leads}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="releaseYear"
              placeholder="Release Year (Optional)"
              value={formData.releaseYear}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="format"
              placeholder="Format (Optional)"
              value={formData.format}
              onChange={handleChange}
            />
            <input
            className="admin-input"
              type="text"
              name="rating"
              placeholder="Rating (Optional)"
              value={formData.rating}
              onChange={handleChange}
            />
          </>
        )}
{formType === "device" && (
  <>
    <input
      className="admin-input"
      type="text"
      name="deviceId"
      placeholder="Device ID"
      value={formData.deviceId}
      onChange={handleChange}
      required
    />
    <input
      className="admin-input"
      type="text"
      name="deviceName"
      placeholder="Device Name"
      value={formData.deviceName}
      onChange={handleChange}
      required
    />
    <input
      className="admin-input"
      type="text"
      name="deviceType"
      placeholder="Device Type"
      value={formData.deviceType}
      onChange={handleChange}
      required
    />
    <input
      className="admin-input"
      type="text"
      name="manufacturer"
      placeholder="Manufacturer"
      value={formData.manufacturer}
      onChange={handleChange}
      required
    />
  </>
)}
<button className="admin-submit" type="submit">
  Add {formType === "book" ? "Book" : formType === "media" ? "Media" : "Device"}
</button>

      </form>
    </div>
  );
}
