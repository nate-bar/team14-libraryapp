import { useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import { type AuthData } from "~/services/api";
import { type Profile } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import "./dashboard.css";

export default function Dashboard() {
  const authData = useOutletContext<AuthData>();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profile/${authData.memberID}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfileData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Could not load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authData.memberID]);

  // Format birth date to MM-DD-YYYY
  const formatBirthDate = (dateString: string): string => {
    if (!dateString) return "Not provided";

    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  };

  // Format balance as currency
  const formatCurrency = (balance: string | number): string => {
    if (balance === null || balance === undefined) return "$0.00";

    const numericBalance =
      typeof balance === "string" ? parseFloat(balance) : balance;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericBalance);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error || "No profile data available"}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-full w-full pl-25 pr-25">
      <div className="dashboard-container">
        <h1>
          {profileData.firstName} {profileData.lastName}
        </h1>
        <h2>Welcome to your profile, {profileData.firstName}! </h2>
        <h3>Current Balance: {formatCurrency(profileData.balance)}</h3>
        <p>
          Name: {profileData.firstName} {profileData.lastName}
        </p>
        <p>Date of Birth: {formatBirthDate(profileData.birthDate)}</p>
        <p>Phone Number: {profileData.phoneNumber}</p>
        <p>Email: {profileData.email}</p>
        <p>Address: {profileData.address || "Not provided"}</p>
      </div>
      <div className="text-center mt-4">
        <a href="./settings" className="edit-profile">
          Edit Profile
        </a>
      </div>
    </div>
  );
}
