import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { type EditProfile } from "~/services/api";
import { updateProfile } from "./profilequeries";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import "./settings.css";

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const authData = useOutletContext<AuthData>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userData, setUserData] = useState<EditProfile>({
    memberID: 0,
    firstName: "",
    lastName: "",
    email: "",
    middleName: "",
    address: "",
    phoneNumber: "",
    birthDate: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    birthDate: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });

  // Fetch user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/profile/${authData.memberID}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        setUserData({
          memberID: data.memberID || authData.memberID,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          middleName: data.middleName || "",
          email: data.email || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          birthDate: data.birthDate
            ? new Date(data.birthDate).toISOString().split("T")[0]
            : "",
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authData.memberID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
      phoneNumber: "",
      birthDate: "",
      firstName: "",
      lastName: "",
    };
    const { email, phoneNumber, birthDate, firstName, lastName } = userData;

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email.";
    if (!phoneNumber || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber))
      newErrors.phoneNumber = "Enter a valid phone number (e.g. 123-456-7890).";
    if (!birthDate) newErrors.birthDate = "Birthdate is required.";
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateProfile(userData);

      if (result.success) {
        alert("Profile updated successfully!");
        navigate("/profile/dashboard"); // Redirect to the dashboard after successful update
      } else {
        alert(`Error: ${result.error}`); // Fixed template literal syntax
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Edit Your Profile:</h2>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/*First Name*/}
        <input
          type="text"
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className={`w-full p-2 border rounded ${
            errors.firstName ? "error-field" : ""
          }`}
        />
        {errors.firstName && (
          <div className="error-message">{errors.firstName}</div>
        )}

        {/*Middle Name*/}
        <input
          type="text"
          name="middleName"
          value={userData.middleName}
          onChange={handleChange}
          placeholder="Middle Name"
          className="w-full p-2 border rounded"
        />

        {/*Last Name*/}
        <input
          type="text"
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className={`w-full p-2 border rounded ${
            errors.lastName ? "error-field" : ""
          }`}
        />
        {errors.lastName && (
          <div className="error-message">{errors.lastName}</div>
        )}

        {/*Email*/}
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full p-2 border rounded ${
            errors.email ? "error-field" : ""
          }`}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}

        {/*Phone Number*/}
        <input
          type="tel"
          name="phoneNumber"
          value={userData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number (e.g. 123-456-7890)"
          className={`w-full p-2 border rounded ${
            errors.phoneNumber ? "error-field" : ""
          }`}
        />
        {errors.phoneNumber && (
          <div className="error-message">{errors.phoneNumber}</div>
        )}

        {/*Birth Date*/}
        <input
          type="date"
          name="birthDate"
          value={userData.birthDate}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${
            errors.birthDate ? "error-field" : ""
          }`}
        />
        {errors.birthDate && (
          <div className="error-message">{errors.birthDate}</div>
        )}

        {/*Address*/}
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full p-2 border rounded"
        />

        {/*Submit Button*/}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isSubmitting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          } text-white p-2 rounded`}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
