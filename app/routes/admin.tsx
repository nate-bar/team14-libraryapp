import React, { useState } from "react";

export default function AdminPage() {
  const [formType, setFormType] = useState("book"); // Toggle between "book" and "media"
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    authors: "",
    genreId: "",
    publisher: "",
    publicationYear: "",
    languageId: "",
    photo: null as File | null,
    // Media-specific fields
    director: "",
    leads: "",
    releaseYear: "",
    format: "",
    rating: "",
  });
  const [message, setMessage] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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
      // Book-specific fields
      formDataToSend.append("isbn", formData.isbn);
      formDataToSend.append("authors", formData.authors || "");
      formDataToSend.append("publisher", formData.publisher || "");
      formDataToSend.append("publicationYear", formData.publicationYear || "");
    } else if (formType === "media") {
      // Media-specific fields
      formDataToSend.append("director", formData.director || "");
      formDataToSend.append("leads", formData.leads || "");
      formDataToSend.append("releaseYear", formData.releaseYear || "");
      formDataToSend.append("format", formData.format || "");
      formDataToSend.append("rating", formData.rating || "");
    }

    try {
      const endpoint =
        formType === "book" ? "/api/admin/add-book" : "/api/admin/add-media";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`${formType === "book" ? "Book" : "Media"} added successfully!`);
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
    <div>
      <h1>Admin Portal - Add {formType === "book" ? "Book" : "Media"}</h1>
      {message && <p>{message}</p>}
      <div>
        <button onClick={() => setFormType("book")}>Add Book</button>
        <button onClick={() => setFormType("media")}>Add Media</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="genreId"
          placeholder="Genre ID (Optional)"
          value={formData.genreId}
          onChange={handleChange}
        />
        <input
          type="text"
          name="languageId"
          placeholder="Language ID"
          value={formData.languageId}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleFileChange}
        />
        {formType === "book" && (
          <>
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="authors"
              placeholder="Authors (Optional)"
              value={formData.authors}
              onChange={handleChange}
            />
            <input
              type="text"
              name="publisher"
              placeholder="Publisher (Optional)"
              value={formData.publisher}
              onChange={handleChange}
            />
            <input
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
              type="text"
              name="director"
              placeholder="Director (Optional)"
              value={formData.director}
              onChange={handleChange}
            />
            <input
              type="text"
              name="leads"
              placeholder="Leads (Optional)"
              value={formData.leads}
              onChange={handleChange}
            />
            <input
              type="text"
              name="releaseYear"
              placeholder="Release Year (Optional)"
              value={formData.releaseYear}
              onChange={handleChange}
            />
            <input
              type="text"
              name="format"
              placeholder="Format (Optional)"
              value={formData.format}
              onChange={handleChange}
            />
            <input
              type="text"
              name="rating"
              placeholder="Rating (Optional)"
              value={formData.rating}
              onChange={handleChange}
            />
          </>
        )}
        <button type="submit">Add {formType === "book" ? "Book" : "Media"}</button>
      </form>
    </div>
  );
}