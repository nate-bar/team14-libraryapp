import { type MediaEdit, type Genres, type Languages } from "~/services/api";
import React, { useState, useEffect } from "react";
import { editMedia } from "../queries";
import Compressor from "compressorjs";
import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import LoadingSpinner from "~/components/loadingspinner";
import AlertPopup from "~/components/buttons/AlertPopup";
import "../edit.css";
import "../admin.css";

const MediaForm: React.FC = () => {
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
  const [originalPhoto, setOriginalPhoto] = useState<Blob | null>();
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [mediaData, setMediaData] = useState<MediaEdit>({
    ItemID: numericItemId,
    MediaID: 0,
    Title: "",
    Director: "",
    Leads: "",
    TypeName: "Media",
    ReleaseYear: 0,
    GenreID: 0,
    LanguageID: 0,
    Photo: null as File | null | Blob,
    UpdatedBy: authData.email,
    Format: "",
    Rating: 0,
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
        setMediaData(data);
        setOriginalPhoto(data.Photo);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setFormError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/mediagenres");
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
    Title: "",
    Director: "",
    ReleaseYear: "",
    Format: "",
    GenreID: "",
    Rating: "",
  });

  useEffect(() => {
    Promise.all([fetchGenres(), fetchLanguages()]).catch((error) => {
      console.error("Error fetching reference data:", error);
      setFormError("Failed to load necessary data. Please refresh the page.");
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (
      name === "GenreID" ||
      name === "ReleaseYear" ||
      name === "LanguageID" ||
      name === "Rating"
    ) {
      setMediaData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setMediaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      setFileName(file.name);
      // Check file size
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSizeInBytes) {
        setErrors((prev) => ({
          ...prev,
          Photo: "File size exceeds the maximum allowed size (5MB)",
        }));
        return;
      }

      // Compress the image
      compressImage(file)
        .then((compressedFile) => {
          setMediaData((prev) => ({ ...prev, Photo: compressedFile }));
        })
        .catch((error) => {
          console.error("Image compression failed:", error);
          setErrors((prev) => ({
            ...prev,
            Photo: "Image compression failed. Please try another image.",
          }));
        });
    } else {
      setFileName("");
      setMediaData((prev) => ({ ...prev, Photo: null }));
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
      Title: "",
      Director: "",
      ReleaseYear: "",
      Format: "",
      GenreID: "",
      Rating: "",
    };

    let isValid = true;

    if (!mediaData.Director.trim()) {
      newErrors.Director = "Director is required";
      isValid = false;
    }

    if (!mediaData.Title.trim()) {
      newErrors.Title = "Title is required";
      isValid = false;
    }

    if (!mediaData.Format.trim()) {
      newErrors.Format = "Format is required";
      isValid = false;
    }

    if (mediaData.GenreID === 0) {
      newErrors.GenreID = "Please select a genre";
      isValid = false;
    }

    if (mediaData.ReleaseYear === 0) {
      newErrors.ReleaseYear = "Please select a publication year";
      isValid = false;
    }

    if (!mediaData.Rating) {
      newErrors.Rating = "Please select a rating";
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

    setFormError(null);

    const dataToSubmit = { ...mediaData };
    dataToSubmit.UpdatedBy = authData.email;
    if (dataToSubmit.Photo === null) {
      dataToSubmit.Photo = originalPhoto;
    }

    try {
      setIsSubmitting(true);

      const result = await editMedia(dataToSubmit);

      if (!result.success) {
        setFormError(result.error || "Update failed. Please try again.");
        return;
      }

      // Success - redirect or show success message
      setFileName("");
      setAlert({ message: "Media entered successfully!", type: "success" });
      navigate("/admin/edit");
    } catch (error) {
      setAlert({ message: `Error submitting form: ${error}`, type: "error" });
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
          onClose={() => setAlert({ message: "", type: null })}
        />
      )}
      {formError && <div className="error-message form-error">{formError}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Display current book image */}
        <div className="image-preview">
          {typeof mediaData.Photo === "string" && mediaData.Photo ? (
            <img
              src={`data:image/jpeg;base64,${mediaData.Photo}`}
              alt={mediaData.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : mediaData.Photo instanceof Blob ? (
            <img
              src={URL.createObjectURL(mediaData.Photo)}
              alt={mediaData.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
        </div>

        {/* Title */}
        <input
          className={`admin-input ${errors.Title ? "error-field" : ""}`}
          type="text"
          name="Title"
          placeholder="Title"
          value={mediaData.Title}
          onChange={handleInputChange}
        />
        {errors.Title && <div className="error-message">{errors.Title}</div>}

        {/* Genre dropdown */}
        <select
          className={`admin-select ${errors.GenreID ? "error-field" : ""}`}
          name="GenreID"
          value={mediaData.GenreID}
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

        {/* Director */}
        <input
          className={`admin-input ${errors.Director ? "error-field" : ""}`}
          type="text"
          name="Director"
          placeholder="Director"
          value={mediaData.Director}
          onChange={handleInputChange}
        />
        {errors.Director && (
          <div className="error-message">{errors.Director}</div>
        )}

        {/* Leads */}
        <input
          className={`admin-input`}
          type="text"
          name="Leads"
          placeholder="Leads (Optional)"
          value={mediaData.Leads}
          onChange={handleInputChange}
        />
        {/* Format */}
        <input
          className={`admin-input ${errors.Format ? "error-field" : ""}`}
          type="text"
          name="Format"
          placeholder="Format (e.g., DVD, Blu-ray, Digital)"
          value={mediaData.Format}
          onChange={handleInputChange}
        />
        {errors.Format && <div className="error-message">{errors.Format}</div>}

        {/* Rating */}
        <div className="admin-input-group">
          <label htmlFor="rating" className="admin-label">
            Rating (0-100)
          </label>
          <input
            className={`admin-input ${errors.Rating ? "error-field" : ""}`}
            type="number"
            name="Rating"
            min="0"
            max="100"
            placeholder="Enter rating (0-100)"
            value={mediaData.Rating}
            onChange={handleInputChange}
          />
          {errors.Rating && (
            <div className="error-message">{errors.Rating}</div>
          )}
        </div>

        {/* Release Year */}
        <select
          className={`admin-select ${errors.ReleaseYear ? "error-field" : ""}`}
          name="ReleaseYear"
          value={mediaData.ReleaseYear || ""}
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
        {errors.ReleaseYear && (
          <div className="error-message">{errors.ReleaseYear}</div>
        )}

        {/* Language dropdown */}
        <select
          className="admin-select"
          name="LanguageID"
          value={mediaData.LanguageID}
          onChange={handleInputChange}
          required
        >
          {languages.map((language) => (
            <option key={language.LanguageID} value={language.LanguageID}>
              {language.Language}
            </option>
          ))}
        </select>

        {/* Photo Uploading */}
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
          {mediaData.Photo && (
            <span className="admin-file-name">{fileName}</span>
          )}
        </div>

        <button type="submit" className="admin-submit">
          Update Media
        </button>
      </form>
    </div>
  );
};

export default MediaForm;
