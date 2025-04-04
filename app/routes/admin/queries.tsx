// app/routes/signup/queries.ts
import {
  type BookInsert,
  type MediaInsert,
  type DeviceInsert,
  type Media,
} from "~/services/api";
import { type ApiResponse } from "~/services/api";
import { type BookEdit, type MediaEdit, type DeviceEdit } from "~/services/api";

/**
 * @param bookData
 * @returns
 */
export const addBook = async (book: BookInsert): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("isbn", book.ISBN);
    formData.append("title", book.Title);
    formData.append("typename", book.TypeName || "Book");
    formData.append("authors", book.Authors);
    formData.append("publisher", book.Publisher);
    formData.append("publicationyear", book.PublicationYear.toString());
    formData.append("genreid", book.GenreID.toString());
    formData.append("languageid", book.LanguageID.toString());
    formData.append("createdby", book.CreatedBy);

    // Add photo if it exists
    if (book.Photo) {
      formData.append("photo", book.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${book.TypeName}`, {
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
export const addMedia = async (media: MediaInsert): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("title", media.Title);
    formData.append("typename", media.TypeName || "Media");
    formData.append("director", media.Director);
    formData.append("leads", media.Leads);
    formData.append("releaseyear", media.ReleaseYear.toString());
    formData.append("genreid", media.GenreID.toString());
    formData.append("languageid", media.LanguageID.toString());
    formData.append("rating", media.Rating.toString());
    formData.append("format", media.Format);
    formData.append("createdby", media.CreatedBy);

    // Add photo if it exists
    if (media.Photo) {
      formData.append("photo", media.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${media.TypeName}`, {
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
export const addDevice = async (device: DeviceInsert): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("title", device.Title);
    formData.append("typename", device.TypeName || "Device");
    formData.append("devicename", device.DeviceName);
    formData.append("devicetype", device.DeviceType);
    formData.append("manufacturer", device.Manufacturer);
    formData.append("createdby", device.CreatedBy);

    // Add photo if it exists
    if (device.Photo) {
      formData.append("photo", device.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/insert/${device.TypeName}`, {
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

/**
 * @param bookEditData
 * @returns
 */
export const editBook = async (bookEdit: BookEdit): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("ItemID", bookEdit.ItemID.toString());
    formData.append("ISBN", bookEdit.ISBN);
    formData.append("Title", bookEdit.Title);
    formData.append("TypeName", bookEdit.TypeName || "Book");
    formData.append("Authors", bookEdit.Authors);
    formData.append("Publisher", bookEdit.Publisher);
    formData.append("PublicationYear", bookEdit.PublicationYear.toString());
    formData.append("GenreID", bookEdit.GenreID.toString());
    formData.append("LanguageID", bookEdit.LanguageID.toString());
    formData.append("UpdatedBy", bookEdit.UpdatedBy);
    formData.append("newISBN", bookEdit.newISBN);

    // Add photo if it exists
    if (bookEdit.Photo) {
      formData.append("Photo", bookEdit.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/edit/${bookEdit.TypeName}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "updating book failed",
      };
    }

    return {
      success: true,
      message: "Book updated successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error updating book:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * @param mediaEditData
 * @returns
 */
export const editMedia = async (mediaEdit: MediaEdit): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    // Prepare data for API call
    const formData = new FormData();
    formData.append("ItemID", mediaEdit.ItemID.toString());
    formData.append("Title", mediaEdit.Title);
    formData.append("TypeName", mediaEdit.TypeName || "Media");
    formData.append("Director", mediaEdit.Director);
    formData.append("Leads", mediaEdit.Leads);
    formData.append("ReleaseYear", mediaEdit.ReleaseYear.toString());
    formData.append("GenreID", mediaEdit.GenreID.toString());
    formData.append("LanguageID", mediaEdit.LanguageID.toString());
    formData.append("Rating", mediaEdit.Rating.toString());
    formData.append("Format", mediaEdit.Format.toString());
    formData.append("UpdatedBy", mediaEdit.UpdatedBy);

    // Add photo if it exists
    if (mediaEdit.Photo) {
      formData.append("photo", mediaEdit.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/edit/${mediaEdit.TypeName}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "updating media failed",
      };
    }

    return {
      success: true,
      message: "media updated successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error updating media:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * @param deviceEditMedia
 * @returns
 */
export const editDevice = async (
  deviceEdit: DeviceEdit
): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("ItemID", deviceEdit.ItemID.toString());
    formData.append("title", deviceEdit.Title);
    formData.append("typename", deviceEdit.TypeName || "Device");
    formData.append("devicename", deviceEdit.DeviceName);
    formData.append("devicetype", deviceEdit.DeviceType);
    formData.append("manufacturer", deviceEdit.Manufacturer);
    formData.append("createdby", deviceEdit.UpdatedBy);

    // Add photo if it exists
    if (deviceEdit.Photo) {
      formData.append("photo", deviceEdit.Photo);
    }

    // Make the API call
    const response = await fetch(`/api/edit/${deviceEdit.TypeName}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "updating device failed",
      };
    }

    return {
      success: true,
      message: "device updated successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error updating device:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
