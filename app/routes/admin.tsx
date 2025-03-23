import React, { useState } from "react";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    authors: "",
    genreId: "",
    publisher: "",
    publicationYear: "",
    languageId: "",
    photo: null as File | null,
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
    formDataToSend.append("isbn", formData.isbn);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("authors", formData.authors || "");
    formDataToSend.append("genreId", formData.genreId || "");
    formDataToSend.append("publisher", formData.publisher || "");
    formDataToSend.append("publicationYear", formData.publicationYear || "");
    formDataToSend.append("languageId", formData.languageId);
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    try {
      const response = await fetch("/api/admin/add-book", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Book added successfully!");
        setFormData({
          isbn: "",
          title: "",
          authors: "",
          genreId: "",
          publisher: "",
          publicationYear: "",
          languageId: "",
          photo: null,
        });
      } else {
        setMessage(result.error || "Failed to add book.");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      setMessage("An error occurred while adding the book.");
    }
  }

  return (
    <div>
      <h1>Admin Portal - Add Book</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
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
          name="title"
          placeholder="Title"
          value={formData.title}
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
          name="genreId"
          placeholder="Genre ID (Optional)"
          value={formData.genreId}
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
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}