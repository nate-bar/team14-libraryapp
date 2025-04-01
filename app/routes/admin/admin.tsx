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
    director: "",
    leads: "",
    releaseYear: "",
    format: "",
    rating: "",
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
        setMessage(
          `${formType === "book" ? "Book" : "Media"} added successfully!`
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
        <select
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
        <button type="submit">
          Add {formType === "book" ? "Book" : "Media"}
        </button>
      </form>
    </div>
  );
}
