import React, { useState, useEffect } from "react";
import { addMedia } from "../queries";
import { type Genres } from "~/services/api";
import { type Languages } from "~/services/api";
import { type MediaInsert } from "~/services/api";
import Compressor from "compressorjs";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import "../edit.css";
import "../admin.css";

const MediaForm: React.FC = () => {
  const { email } = useOutletContext<AuthData>();
  const [genres, setGenres] = useState<Genres[]>([]);
  const [languages, setLanguages] = useState<Languages[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [mediaData, setMediaData] = useState<MediaInsert>({
    Title: "",
    TypeName: "Media",
    Director: "",
    Leads: "",
    ReleaseYear: 0,
    Format: "",
    Rating: 0,
    GenreID: 0,
    LanguageID: 0,
    Photo: null as File | null,
    CreatedBy: email,
  });

  const fetchGenres = () => {
    fetch("/api/mediagenres")
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
    director: "",
    title: "",
    releaseyear: "",
    genreid: "",
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
      name === "releaseyear" ||
      name === "languageid" ||
      name === "rating"
    ) {
      setMediaData((prev) => ({
        ...prev,
        [name]:
          name === "rating"
            ? Math.max(0, Math.min(100, parseInt(value, 10) || 0))
            : parseInt(value, 10) || 0,
      }));
    } else {
      setMediaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      director: "",
      title: "",
      releaseyear: "",
      genreid: "",
    };
    const { Director, Title, ReleaseYear, GenreID } = mediaData;

    if (!Director) newErrors.director = "Enter a value for director";
    if (!Title) newErrors.title = "Enter a title";
    if (GenreID === 0) newErrors.genreid = "Select a genre";
    if (!ReleaseYear) newErrors.releaseyear = "Select a year";

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
          setMediaData((prev) => ({ ...prev, photo: compressedFile }));
          // setIsLoading(false);
        })
        .catch((error) => {
          console.error("Image compression failed:", error);
          alert("Image compression failed. Please try another image.");
          // setIsLoading(false);
        });
    } else {
      setFileName("");
      setMediaData((prev) => ({ ...prev, photo: null }));
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
    console.log("Form submitted:", mediaData);

    const validationError = validateForm();
    if (!validationError) {
      return;
    }

    try {
      const result = await addMedia(mediaData);

      if (!result.success) {
        alert(`Error: ${result.error || "Registration failed"}`);
        return;
      }

      console.log("Success:", result);

      // Clear form
      setMediaData({
        Title: "",
        TypeName: "Media",
        Director: "",
        Leads: "",
        ReleaseYear: 0,
        GenreID: 0,
        LanguageID: 0,
        Photo: null,
        Format: "",
        Rating: 0,
        CreatedBy: email,
      });
      alert("Media entered successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error}`);
    }
  };

  return (
    <div className="admin-container">
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          className={`admin-input ${errors.title ? "error-field" : ""}`}
          type="text"
          name="Title"
          placeholder="Title"
          value={mediaData.Title}
          onChange={handleInputChange}
        />
        {errors.title && <div className="error-message">{errors.title}</div>}

        {/* Genre dropdown */}
        <select
          className={`admin-select ${errors.genreid ? "error-field" : ""}`}
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
        {errors.genreid && (
          <div className="error-message">{errors.genreid}</div>
        )}

        <input
          className={`admin-input ${errors.director ? "error-field" : ""}`}
          type="text"
          name="Director"
          placeholder="Director"
          value={mediaData.Director}
          onChange={handleInputChange}
        />
        {errors.director && (
          <div className="error-message">{errors.director}</div>
        )}
        <input
          className={`admin-input`}
          type="text"
          name="Leads"
          placeholder="Leads (Optional)"
          value={mediaData.Leads}
          onChange={handleInputChange}
        />
        <input
          className="admin-input"
          type="text"
          name="Format"
          placeholder="Format (e.g., DVD, Blu-ray, Digital)"
          value={mediaData.Format}
          onChange={handleInputChange}
        />

        <div className="admin-input-group">
          <label htmlFor="rating" className="admin-label">
            Rating (0-100)
          </label>
          <input
            className="admin-input"
            type="number"
            name="Rating"
            min="0"
            max="100"
            placeholder="Enter rating (0-100)"
            value={mediaData.Rating}
            onChange={handleInputChange}
          />
        </div>

        <select
          className={`admin-select ${errors.releaseyear ? "error-field" : ""}`}
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
        {errors.releaseyear && (
          <div className="error-message">{errors.releaseyear}</div>
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
          {mediaData.Photo && (
            <span className="admin-file-name">{fileName}</span>
          )}
        </div>

        <button type="submit" className="admin-submit">
          Add Media
        </button>
      </form>
    </div>
  );
};

export default MediaForm;
