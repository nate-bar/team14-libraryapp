import { useState, useEffect } from "react";
import { Link } from "react-router";
import { type AuthData } from "~/services/api";
import { type Profile } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import { LogoutButton } from "./buttons/logoutbutton";
import "../components/navbar.css";

export function NavBar({ isLoggedIn, groupID, memberID }: AuthData) {
  const isAdmin = groupID === "Administrator";

  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && memberID) {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/profile/${memberID}`);

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
    }
  }, [isLoggedIn, memberID]); // Trigger effect only if logged in

  // Loading or error states
  if (loading && isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  /*
  if (error || !profileData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error || "No profile data available"}</p>
      </div>
    );
  }
  */

  return (
    <div className="bg-nav w-full">
      <div className="m-2.5 p-2.5">
        <ul className="flex space-x-10">
          <li className="text-nav">
            <Link to="/">Symphony's Library</Link>
          </li>
          {isLoggedIn && isAdmin && (
            <li className="text-nav">
              <Link to="/admin" className="text-white font-bold">
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-right ml-auto mr-4">
        {isLoggedIn ? (
          <div className="logged-in-content flex flex-row items-center gap-4">
            <h1 className="text-nav m-0">Welcome {profileData?.firstName}</h1>

            <ul
              className="user-links flex items-center m-0 p-0"
              style={{ listStyleType: "none" }}
            >
              <li className="text-nav mx-4">
                <Link to="/dashboard">Profile</Link>
              </li>
            </ul>

            <LogoutButton />
          </div>
        ) : (
          <div className="logged-out-content">
            <ul style={{ listStyleType: "none" }}>
              <li className="text-nav">
                <Link to="/login">Login/Signup</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
