// app/routes/signup/queries.ts
import {
  type BookInsert,
  type MediaInsert,
  type DeviceInsert,
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
export const addMedia = async (media: MediaInsert): Promise<ApiResponse> => {
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
export const addDevice = async (device: DeviceInsert): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const formData = new FormData();
    formData.append("title", device.title);
    formData.append("typename", device.typename || "Device");
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
    formData.append("MediaID", mediaEdit.MediaID.toString());
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
      formData.append("Photo", mediaEdit.Photo);
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
    formData.append("DeviceID", deviceEdit.DeviceID.toString());
    formData.append("Title", deviceEdit.Title);
    formData.append("TypeName", deviceEdit.TypeName || "Device");
    formData.append("DeviceType", deviceEdit.DeviceType);
    formData.append("Manufacturer", deviceEdit.Manufacturer);
    formData.append("UpdatedBy", deviceEdit.UpdatedBy);

    // Add photo if it exists
    if (deviceEdit.Photo) {
      formData.append("Photo", deviceEdit.Photo);
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
