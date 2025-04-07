// app/routes/profile/profilequeries.ts
import { type EditProfile } from "~/services/api";
import { type ApiResponse } from "~/services/api";

/**
 *  Update user profile information
 * * @param userData - The data to update the user's profile
 * * @returns A promise that resolves to an ApiResponse object
 */

export const updateProfile = async (
    userData: EditProfile
): Promise<ApiResponse> => {
    try {
        // Prepare data for API call
        const profileData = {
            email: userData.email,
            firstName: userData.firstName,
            middleName: userData.middleName || null,
            lastName: userData.lastName,
            address: userData.address || null,
            phoneNumber: userData.phoneNumber,
            birthDate: userData.dateOfBirth || null,
        };

        // Make the API call
        const response = await fetch("/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "Profile update failed",
            };
        }

        return {
            success: true,
            message: "Profile updated successfully",
        };
    } catch (error: any) {
        console.error("Error updating account:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred",
        };
    }
};
