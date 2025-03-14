// app/routes/signup/queries.ts
import { type AccountSignup } from "~/services/api";
import { type ApiResponse } from "~/services/api";

/**
 * @param userData
 * @returns
 */
export const createAccount = async (
  userData: AccountSignup
): Promise<ApiResponse> => {
  try {
    // Prepare data for API call
    const accountData = {
      email: userData.email,
      password: userData.password,
      group: userData.group || "Student",
    };

    // Make the API call
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Registration failed",
      };
    }

    return {
      success: true,
      message: "Account created successfully",
      userID: result.userID,
    };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
