import { type DeviceEdit } from "~/services/api";
import React, { useState, useEffect } from "react";
import { editDevice } from "../queries";
import Compressor from "compressorjs";
import { type AuthData } from "~/services/api";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import LoadingSpinner from "~/components/loadingspinner";
import "../edit.css";
import "../admin.css";

const BookForm: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const numericItemId = itemId ? parseInt(itemId, 10) : 0;
  const navigate = useNavigate();
  const authData = useOutletContext<AuthData>();
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [originalPhoto, setOriginalPhoto] = useState<Blob | null>();
  const [deviceData, setDeviceData] = useState<DeviceEdit>({
    ItemID: numericItemId,
    DeviceID: 0,
    Title: "",
    TypeName: "Device",
    DeviceName: "",
    DeviceType: "",
    Manufacturer: "",
    Photo: null as File | null | Blob,
    UpdatedBy: authData.email,
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
        setDeviceData(data);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setFormError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  const [errors, setErrors] = useState({
    Title: "",
    DeviceName: "",
    DeviceType: "",
    Manufacturer: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;

    setDeviceData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          setDeviceData((prev) => ({ ...prev, Photo: compressedFile }));
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
      setDeviceData((prev) => ({ ...prev, Photo: null }));
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
      DeviceName: "",
      DeviceType: "",
      Manufacturer: "",
    };

    let isValid = true;

    if (!deviceData.Title.trim()) {
      newErrors.Title = "Title is required";
      isValid = false;
    }

    if (!deviceData.DeviceName.trim()) {
      newErrors.DeviceName = "Device name is required";
      isValid = false;
    }

    if (!deviceData.DeviceType.trim()) {
      newErrors.DeviceType = "Device type is required";
      isValid = false;
    }

    if (!deviceData.Manufacturer.trim()) {
      newErrors.Manufacturer = "Manufacturer is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const dataToSubmit = { ...deviceData };
    if (dataToSubmit.Photo === null) {
      dataToSubmit.Photo = originalPhoto;
    }

    try {
      const result = await editDevice(deviceData);

      if (!result.success) {
        setFormError(result.error || "Update failed. Please try again.");
        return;
      }

      // Success - redirect or show success message
      alert("Device updated successfully!");
      navigate("/admin/edit"); // redirect back to edit list
    } catch (error) {
      console.error("Error submitting form:", error);
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
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          className={`admin-input ${errors.Title ? "error-field" : ""}`}
          type="text"
          name="Title"
          placeholder="Title"
          value={deviceData.Title}
          onChange={handleInputChange}
        />
        {errors.Title && <div className="error-message">{errors.Title}</div>}

        <input
          className={`admin-input ${errors.DeviceName ? "error-field" : ""}`}
          type="text"
          name="DeviceName"
          placeholder="Device name"
          value={deviceData.DeviceName}
          onChange={handleInputChange}
        />
        {errors.DeviceName && (
          <div className="error-message">{errors.DeviceName}</div>
        )}
        <input
          className={`admin-input ${errors.DeviceType ? "error-field" : ""}`}
          type="text"
          name="DeviceType"
          placeholder="Device Type"
          value={deviceData.DeviceType}
          onChange={handleInputChange}
        />
        {errors.DeviceType && (
          <div className="error-message">{errors.DeviceType}</div>
        )}

        <input
          className={`admin-input ${errors.Manufacturer ? "error-field" : ""}`}
          type="text"
          name="Manufacturer"
          placeholder="Manufacturer"
          value={deviceData.Manufacturer}
          onChange={handleInputChange}
        />
        {errors.Manufacturer && (
          <div className="error-message">{errors.Manufacturer}</div>
        )}

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
          {deviceData.Photo && (
            <span className="admin-file-name">{fileName}</span>
          )}
        </div>

        <button type="submit" className="admin-submit">
          Add Device
        </button>
      </form>
    </div>
  );
};

export default BookForm;
