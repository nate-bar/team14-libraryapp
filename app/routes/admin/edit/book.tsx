import { type BookEdit, type Genres, type Languages } from "~/services/api";
import React, { useState, useEffect } from "react";
import { editBook } from "../queries";
import Compressor from "compressorjs";
import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import LoadingSpinner from "~/components/loadingspinner";
import AlertPopup from "~/components/buttons/AlertPopup";
import "../edit.css";
import "../admin.css";

const BookForm: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const numericItemId = itemId ? parseInt(itemId, 10) : 0;
  const navigate = useNavigate();
  const authData = useOutletContext<AuthData>();
  const [genres, setGenres] = useState<Genres[]>([]);
  const [languages, setLanguages] = useState<Languages[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [originalISBN, setOriginalISBN] = useState<string>("");
  const [originalPhoto, setOriginalPhoto] = useState<Blob | null>();
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [bookData, setBookData] = useState<BookEdit>({
    ItemID: numericItemId,
    ISBN: "",
    Title: "",
    TypeName: "Book",
    Authors: "",
    Publisher: "",
    PublicationYear: 0,
    GenreID: 0,
    LanguageID: 0,
    Photo: null as File | null | Blob,
    UpdatedBy: authData.email,
    newISBN: "",
    Summary: "",
  });

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFormError(null);

    fetch(`/api/itemdetail/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setBookData(data);
        setOriginalISBN(data.ISBN); // Store the original ISBN
        setOriginalPhoto(data.Photo);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setFormError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  // Update newISBN whenever ISBN changes
  useEffect(() => {
    if (bookData.ISBN !== originalISBN && originalISBN) {
      setBookData((prev) => ({
        ...prev,
        newISBN: bookData.ISBN,
      }));
    }
  }, [bookData.ISBN, originalISBN]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/bookgenres");
      if (!response.ok) {
        throw new Error(`Failed to fetch genres: ${response.status}`);
      }
      const data = await response.json();
      setGenres(data);
      return data;
    } catch (error) {
      console.error("Error fetching genres:", error);
      throw error;
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/languages");
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }
      const data = await response.json();
      setLanguages(data);
      return data;
    } catch (error) {
      console.error("Error fetching languages:", error);
      throw error;
    }
  };

  const [errors, setErrors] = useState({
    ISBN: "",
    Title: "",
    Authors: "",
    Publisher: "",
    GenreID: "",
    PublicationYear: "",
  });

  useEffect(() => {
    Promise.all([fetchGenres(), fetchLanguages()]).catch((error) => {
      console.error("Error fetching reference data:", error);
      setFormError("Failed to load necessary data. Please refresh the page.");
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (
      name === "GenreID" ||
      name === "PublicationYear" ||
      name === "LanguageID"
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      setFileName(file.name);
      // Check file size (example: 5MB max)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSizeInBytes) {
        setAlert({ message: "File size exceeds the maximum allowed size (5MB)", type: "error" });
        return;
      }

      // Set loading state if needed
      // setIsLoading(true);

      // Compress the image with Promise
      compressImage(file)
        .then((compressedFile) => {
          setBookData((prev) => ({ ...prev, Photo: compressedFile }));
          // setIsLoading(false);
        })
        .catch((error) => {
          console.error("Image compression failed:", error);
          setAlert({ message: "Image compression failed. Please try another image.", type: "error" });
        });
    } else {
      setFileName("");
      setBookData((prev) => ({ ...prev, Photo: null }));
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

  const validateForm = (): boolean => {
    const newErrors = {
      ISBN: "",
      Title: "",
      Authors: "",
      Publisher: "",
      GenreID: "",
      PublicationYear: "",
    };

    let isValid = true;

    if (!bookData.ISBN.trim()) {
      newErrors.ISBN = "ISBN is required";
      isValid = false;
    }

    if (!bookData.Title.trim()) {
      newErrors.Title = "Title is required";
      isValid = false;
    }

    if (!bookData.Authors.trim()) {
      newErrors.Authors = "Author(s) is required";
      isValid = false;
    }

    if (bookData.GenreID === 0) {
      newErrors.GenreID = "Please select a genre";
      isValid = false;
    }

    if (bookData.PublicationYear === 0) {
      newErrors.PublicationYear = "Please select a publication year";
      isValid = false;
    }

    if (!bookData.Publisher.trim()) {
      newErrors.Publisher = "Publisher is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Before submitting, ensure newISBN is set correctly
    const dataToSubmit = { ...bookData };
    dataToSubmit.UpdatedBy = authData.email;
    if (dataToSubmit.ISBN !== originalISBN) {
      dataToSubmit.newISBN = dataToSubmit.ISBN;
      dataToSubmit.ISBN = originalISBN; // Restore original ISBN
    } else {
      dataToSubmit.newISBN = originalISBN; // No change
    }
    if (dataToSubmit.Photo === null) {
      dataToSubmit.Photo = originalPhoto;
    }

    try {
      setIsSubmitting(true);

      const result = await editBook(dataToSubmit);

      if (!result.success) {
        setFormError(result.error || "Update failed. Please try again.");
        return;
      }

      // Success - redirect or show success message
      setFileName('');
      setAlert({ message: 'Book entered successfully!', type: 'success' });
      navigate("/admin/edit"); // Redirect to books list
    } catch (error) {
      setAlert({ message: `Error submitting form: ${error}`, type: 'error' });
      setFormError(
        `Error submitting form: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-container">
            {alert.message && (
        <AlertPopup
          message={alert.message}
          type={alert.type!}
          onClose={() => setAlert({ message: '', type: null })}
        />
      )}
      {formError && <div className="error-message form-error">{formError}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Display current book image */}
        <div className="image-preview">
          {typeof bookData.Photo === "string" && bookData.Photo ? (
            <img
              src={`data:image/jpeg;base64,${bookData.Photo}`}
              alt={bookData.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : bookData.Photo instanceof Blob ? (
            <img
              src={URL.createObjectURL(bookData.Photo)}
              alt={bookData.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
        </div>

        {/* ISBN */}
        <input
          className={`admin-input ${errors.ISBN ? "error-field" : ""}`}
          type="text"
          name="ISBN"
          placeholder="ISBN"
          value={bookData.ISBN}
          onChange={handleInputChange}
        />
        {errors.ISBN && <div className="error-message">{errors.ISBN}</div>}
        {bookData.ISBN !== originalISBN && originalISBN && (
          <div className="info-message">
            ISBN will be updated from {originalISBN} to {bookData.ISBN}
          </div>
        )}

        {/* Title */}
        <input
          className={`admin-input ${errors.Title ? "error-field" : ""}`}
          type="text"
          name="Title"
          placeholder="Title"
          value={bookData.Title}
          onChange={handleInputChange}
        />
        {errors.Title && <div className="error-message">{errors.Title}</div>}

        {/* genre dropdown */}
        <select
          className={`admin-select ${errors.GenreID ? "error-field" : ""}`}
          name="GenreID"
          value={bookData.GenreID}
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
        {errors.GenreID && (
          <div className="error-message">{errors.GenreID}</div>
        )}

        {/* Authors */}
        <input
          className={`admin-input ${errors.Authors ? "error-field" : ""}`}
          type="text"
          name="Authors"
          placeholder="Authors"
          value={bookData.Authors}
          onChange={handleInputChange}
        />
        {errors.Authors && (
          <div className="error-message">{errors.Authors}</div>
        )}

        {/* Publisher */}
        <input
          className={`admin-input ${errors.Publisher ? "error-field" : ""}`}
          type="text"
          name="Publisher"
          placeholder="Publisher"
          value={bookData.Publisher}
          onChange={handleInputChange}
        />
        {errors.Publisher && (
          <div className="error-message">{errors.Publisher}</div>
        )}

        {/* Publication Year */}
        <select
          className={`admin-select ${
            errors.PublicationYear ? "error-field" : ""
          }`}
          name="PublicationYear"
          value={bookData.PublicationYear || ""}
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
        {errors.PublicationYear && (
          <div className="error-message">{errors.PublicationYear}</div>
        )}

        {/* language dropdown */}
        <select
          className="admin-select"
          name="LanguageID"
          value={bookData.LanguageID}
          onChange={handleInputChange}
          required
        >
          {languages.map((language) => (
            <option key={language.LanguageID} value={language.LanguageID}>
              {language.Language}
            </option>
          ))}
        </select>

        {/* photo uploading field */}
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
            name="Photo"
            accept="image/*"
            onChange={handleFileChange}
          />
          {bookData.Photo && (
            <span className="admin-file-name">{fileName}</span>
          )}
        </div>

        {/* book summary field */}
        <div className="mb-4 w-full">
          <label
            htmlFor="Summary"
            className="flex text-sm font-medium text-gray-700 mb-1 items-center"
          >
            Summary{" "}
            <span className="ml-2 text-xs text-gray-500 italic">
              (optional, max 255 characters)
            </span>
          </label>
          <div className="relative">
            <textarea
              id="Summary"
              name="Summary"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none text-gray-800"
              placeholder="Enter book summary (optional)"
              value={bookData.Summary || ""}
              onChange={handleInputChange}
              maxLength={255}
              rows={4}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {(bookData.Summary || "").length}/255
            </div>
          </div>
        </div>

        <button type="submit" className="admin-submit">
          Update Book
        </button>
      </form>
    </div>
  );
};

export default BookForm;
