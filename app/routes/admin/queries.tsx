// app/routes/signup/queries.ts
import { type Book } from "~/services/api";
import { type ApiResponse } from "~/services/api";
import { type Media } from "~/services/api";
import { type Device } from "~/services/api";

/**
 * @param bookData
 * @returns
 */
export const addBook = async (book: Book): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("isbn", book.isbn);
    formData.append("title", book.title);
    formData.append("typename", book.typename || "Book");
    formData.append("authors", book.authors);
    formData.append("publisher", book.publisher);
    formData.append("publicationyear", book.publicationyear.toString());
    formData.append("genreid", book.genreid.toString());
    formData.append("languageid", book.languageid.toString());
    formData.append("createdby", book.createdby);

    // Add photo if it exists
    if (book.photo) {
      formData.append("photo", book.photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${book.typename}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "inserting book failed",
      };
    }

    return {
      success: true,
      message: "Book inserted successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error inserting book:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * @param mediaData
 * @returns
 */
export const addMedia = async (media: Media): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("title", media.title);
    formData.append("typename", media.typename || "Media");
    formData.append("director", media.director);
    formData.append("leads", media.leads);
    formData.append("releaseyear", media.releaseyear.toString());
    formData.append("genreid", media.genreid.toString());
    formData.append("languageid", media.languageid.toString());
    formData.append("rating", media.rating.toString());
    formData.append("format", media.format.toString());
    formData.append("createdby", media.createdby);

    // Add photo if it exists
    if (media.photo) {
      formData.append("photo", media.photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${media.typename}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "inserting media failed",
      };
    }

    return {
      success: true,
      message: "Media inserted successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error inserting media:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * @param deviceData
 * @returns
 */
export const addDevice = async (device: Device): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("title", device.title);
    formData.append("typename", device.typename || "Device");
    formData.append("devicename", device.devicename);
    formData.append("devicetype", device.devicetype);
    formData.append("manufacturer", device.manufacturer);
    formData.append("createdby", device.createdby);

    // Add photo if it exists
    if (device.photo) {
      formData.append("photo", device.photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${device.typename}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "inserting device failed",
      };
    }

    return {
      success: true,
      message: "Device inserted successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error inserting device:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
