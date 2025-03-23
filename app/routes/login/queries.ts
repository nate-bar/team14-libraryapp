// app/routes/signup/queries.ts
import { type AccountLogin } from "~/services/api";
import { type ApiResponse } from "~/services/api";

/**
 * Handles user login
 * @param userData - The login credentials
 * @returns API response with success/error info
 */
export const loginAccount = async (
  userData: AccountLogin
): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const accountData = {
      email: userData.email,
      password: userData.password,
    };

    // Make the API call
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
      credentials: "include", // Important for cookies
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Login failed",
      };
    }

    // Return success response with user data
    return {
      success: true,
      message: "Login Successful",
      userID: result.user?.MemberID,
      user: result.user,
    };
  } catch (error: any) {
    console.error("Error logging in:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};