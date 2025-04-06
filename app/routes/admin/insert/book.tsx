import { type BookInsert } from "~/services/api";
import React, { useState, useEffect } from "react";
import { addBook } from "../queries";
import { type Genres } from "~/services/api";
import { type Languages } from "~/services/api";
import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import Compressor from "compressorjs";

const BookForm: React.FC = () => {
  const { email } = useOutletContext<AuthData>();
  const [genres, setGenres] = useState<Genres[]>([]);
  const [languages, setLanguages] = useState<Languages[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookData, setBookData] = useState<BookInsert>({
    isbn: "",
    title: "",
    typename: "Book",
    authors: "",
    publisher: "",
    publicationyear: 0,
    genreid: 0,
    languageid: 0,
    photo: null as File | null,
    createdby: email,
    quantity: 1,
  });

  const fetchGenres = () => {
    fetch("/api/bookgenres")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }
        return response.json();
      })
      .then((data) => {
        setGenres(data);
      })
      .catch((error) => {
        console.error("Error fetching genres:", error);
      });
  };

  const fetchLanguages = () => {
    fetch("/api/languages")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }
        return response.json();
      })
      .then((data) => {
        setLanguages(data);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
  };

  const [errors, setErrors] = useState({
    isbn: "",
    title: "",
    authors: "",
    publisher: "",
    genreid: "",
    publicationyear: "",
  });

  useEffect(() => {
    fetchGenres();
    fetchLanguages();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;

    // Convert numeric fields from string to number
    if (
      name === "genreid" ||
      name === "publicationyear" ||
      name === "languageid"
    ) {
      setBookData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setBookData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      isbn: "",
      title: "",
      authors: "",
      publisher: "",
      genreid: "",
      publicationyear: "",
    };
    const { isbn, title, authors, publisher, genreid, publicationyear } =
      bookData;

    if (!isbn) newErrors.isbn = "Enter a value for ISBN";
    if (!title) newErrors.title = "Enter a title";
    if (!authors) newErrors.authors = "Enter a value for author";
    if (!publisher) newErrors.publisher = "Enter a value for publisher";
    if (genreid === 0) newErrors.genreid = "Select a genre";
    if (!publicationyear) newErrors.publicationyear = "Select a year";

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      setFileName(file.name);
      // Check file size (example: 5MB max)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSizeInBytes) {
        alert("File size exceeds the maximum allowed size (5MB)");
        return;
      }

      // Set loading state if needed
      // setIsLoading(true);

      // Compress the image with Promise
      compressImage(file)
        .then((compressedFile) => {
          setBookData((prev) => ({ ...prev, photo: compressedFile }));
          // setIsLoading(false);
        })
        .catch((error) => {
          console.error("Image compression failed:", error);
          alert("Image compression failed. Please try another image.");
          // setIsLoading(false);
        });
    } else {
      setFileName("");
      setBookData((prev) => ({ ...prev, photo: null }));
    }
  }

  // Helper function to compress image using Promise
  function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6,
        maxHeight: 225,
        mimeType: "image/jpeg",
        success(result) {
          // result is already a Blob, so just resolve it
          resolve(result);
        },
        error(error) {
          reject(error);
        },
      });
    });
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    console.log("Form submitted:", bookData);

    // If already submitting, do nothing
    if (isSubmitting) {
      return;
    }

    const validationError = validateForm();
    if (!validationError) {
      return;
    }

    try {
      // Set submitting state to true to prevent multiple clicks
      setIsSubmitting(true);

      const result = await addBook(bookData);

      if (!result.success) {
        alert(`Error: ${result.error || "Registration failed"}`);
        return;
      }

      console.log("Success:", result);

      // Clear form
      setBookData({
        isbn: "",
        title: "",
        typename: "Book",
        authors: "",
        publisher: "",
        publicationyear: 0,
        genreid: 0,
        languageid: 0,
        photo: null,
        createdby: email,
        quantity: 1,
      });
      setFileName("");
      alert("Book entered successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error}`);
    } finally {
      // Reset submitting state regardless of success or failure
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-container">
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          className={`admin-input ${errors.isbn ? "error-field" : ""}`}
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={bookData.isbn}
          onChange={handleInputChange}
        />
        {errors.isbn && <div className="error-message">{errors.isbn}</div>}
        <input
          className={`admin-input ${errors.title ? "error-field" : ""}`}
          type="text"
          name="title"
          placeholder="Title"
          value={bookData.title}
          onChange={handleInputChange}
        />
        {errors.title && <div className="error-message">{errors.title}</div>}

        {/* Genre dropdown */}
        <select
          className={`admin-select ${errors.genreid ? "error-field" : ""}`}
          name="genreid"
          value={bookData.genreid}
          onChange={handleInputChange}
          required
        >
          <option value="0">Select Genre</option>
          {genres.map((genre) => (
            <option key={genre.GenreID} value={genre.GenreID}>
              {genre.GenreName}
            </option>
          ))}
        </select>
        {errors.genreid && (
          <div className="error-message">{errors.genreid}</div>
        )}

        <input
          className={`admin-input ${errors.authors ? "error-field" : ""}`}
          type="text"
          name="authors"
          placeholder="Authors"
          value={bookData.authors}
          onChange={handleInputChange}
        />
        {errors.authors && (
          <div className="error-message">{errors.authors}</div>
        )}
        <input
          className={`admin-input ${errors.publisher ? "error-field" : ""}`}
          type="text"
          name="publisher"
          placeholder="Publisher"
          value={bookData.publisher}
          onChange={handleInputChange}
        />
        {errors.publisher && (
          <div className="error-message">{errors.publisher}</div>
        )}
        <select
          className={`admin-select ${
            errors.publicationyear ? "error-field" : ""
          }`}
          name="publicationyear"
          value={bookData.publicationyear || ""}
          onChange={handleInputChange}
        >
          <option value="">Select Year</option>
          {Array.from(
            { length: 124 },
            (_, i) => new Date().getFullYear() - i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.publicationyear && (
          <div className="error-message">{errors.publicationyear}</div>
        )}

        {/* Language dropdown */}
        <select
          className="admin-select"
          name="languageid"
          value={bookData.languageid}
          onChange={handleInputChange}
          required
        >
          {languages.map((language) => (
            <option key={language.LanguageID} value={language.LanguageID}>
              {language.Language}
            </option>
          ))}
        </select>

        <div className="admin-file-wrapper">
          <label htmlFor="photo-upload" className="admin-file-label">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-3.586-3.586a2 2 0 00-2.828 0L5 7M7 7v10a2 2 0 002 2h6a2 2 0 002-2V7m-5 4v4"
              />
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
          {bookData.photo && (
            <span className="admin-file-name">{fileName}</span>
          )}
        </div>

        {/* Quantity dropdown */}
        <div className="form-group">
          <label htmlFor="quantity" className="admin-label">
            Quantity:
          </label>
          <select
            id="quantity"
            name="quantity"
            className="admin-select"
            value={bookData.quantity}
            onChange={handleInputChange}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="admin-submit">
          Add Book
        </button>
      </form>
    </div>
  );
};

export default BookForm;
