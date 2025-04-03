import { type Device } from "~/services/api";
import React, { useState } from "react";
import { addDevice } from "./queries";
import Compressor from "compressorjs";

const DeviceForm: React.FC = () => {
  const [fileName, setFileName] = useState<string>("");
  const [deviceData, setDeviceData] = useState<Device>({
    title: "",
    typename: "Device",
    devicename: "",
    devicetype: "",
    manufacturer: "",
    photo: null as File | null,
  });

  const [errors, setErrors] = useState({
    title: "",
    devicename: "",
    devicetype: "",
    manufacturer: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;

    // Since Device type doesn't have numeric fields like genreid or publicationyear
    // This method can be simplified
    setDeviceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      devicename: "",
      devicetype: "",
      manufacturer: "",
    };
    const { title, devicename, devicetype, manufacturer } = deviceData;
    if (!title) newErrors.title = "Enter a title";
    if (!devicename) newErrors.devicename = "Enter a device name";
    if (!devicetype) newErrors.devicetype = "Enter a device type";
    if (!manufacturer)
      newErrors.manufacturer = "Enter a value for manufacturer";

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
          setDeviceData((prev) => ({ ...prev, photo: compressedFile }));
          // setIsLoading(false);
        })
        .catch((error) => {
          console.error("Image compression failed:", error);
          alert("Image compression failed. Please try another image.");
          // setIsLoading(false);
        });
    } else {
      setFileName("");
      setDeviceData((prev) => ({ ...prev, photo: null }));
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
    console.log("Form submitted:", deviceData);

    const validationError = validateForm();
    if (!validationError) {
      return;
    }

    try {
      const result = await addDevice(deviceData);

      if (!result.success) {
        alert(`Error: ${result.error || "Registration failed"}`);
        return;
      }

      console.log("Success:", result);

      // Clear form
      setDeviceData({
        title: "",
        typename: "Device",
        devicename: "",
        devicetype: "",
        manufacturer: "",
        photo: null,
      });
      alert("Device entered successfully!");
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
          name="title"
          placeholder="Title"
          value={deviceData.title}
          onChange={handleInputChange}
        />
        {errors.title && <div className="error-message">{errors.title}</div>}

        <input
          className={`admin-input ${errors.devicename ? "error-field" : ""}`}
          type="text"
          name="devicename"
          placeholder="Device name"
          value={deviceData.devicename}
          onChange={handleInputChange}
        />
        {errors.devicename && (
          <div className="error-message">{errors.devicename}</div>
        )}
        <input
          className={`admin-input ${errors.devicetype ? "error-field" : ""}`}
          type="text"
          name="devicetype"
          placeholder="Device Type"
          value={deviceData.devicetype}
          onChange={handleInputChange}
        />
        {errors.devicetype && (
          <div className="error-message">{errors.devicetype}</div>
        )}

        <input
          className={`admin-input ${errors.manufacturer ? "error-field" : ""}`}
          type="text"
          name="manufacturer"
          placeholder="Manufacturer"
          value={deviceData.manufacturer}
          onChange={handleInputChange}
        />
        {errors.manufacturer && (
          <div className="error-message">{errors.manufacturer}</div>
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
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
          {deviceData.photo && (
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

export default DeviceForm;
