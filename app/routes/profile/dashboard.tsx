import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { type Profile } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import "./dashboard.css";
import ProfilePage from "./profile";

export default function Dashboard() {
  const authData = useOutletContext<AuthData>();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    "avatar-placeholder.png"
  ); // Default avatar

  // Load selected avatar from localStorage on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

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

  const formatBirthDate = (dateString: string): string => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const formatCurrency = (balance: string | number): string => {
    if (balance === null || balance === undefined) return "$0.00";
    const numericBalance =
      typeof balance === "string" ? parseFloat(balance) : balance;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericBalance);
  };

  const openModal = () => setIsModalOpen(true); // Open the modal
  const closeModal = () => setIsModalOpen(false); // Close the modal
  const selectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    localStorage.setItem("selectedAvatar", avatar); // Save the selected avatar to localStorage
    closeModal(); // Close modal after selecting avatar
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
    <div>
      <ProfilePage />
      <div className="dashboard-container">
        <div className="profile-header">
          <div className="profile-avatar" onClick={openModal}>
            <img src={`./${selectedAvatar}`} alt="User Avatar" />
          </div>
        </div>
        <div className="profile-name">
          {profileData.firstName} {profileData.lastName} {authData.memberID}
        </div>
        <div className="current-balance">
          <strong>Current Balance:</strong>{" "}
          {formatCurrency(profileData.balance)}
        </div>
        <div className="profile-info">
          <div className="info-item">
            <div className="info-item-label">Full Name</div>
            <div className="info-item-value">
              <i className="fas fa-user"></i>
              {profileData.firstName} {profileData.lastName}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Birth Date</div>
            <div className="info-item-value">
              <i className="fas fa-birthday-cake"></i>
              {formatBirthDate(profileData.birthDate)}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Phone Number</div>
            <div className="info-item-value">
              <i className="fas fa-phone"></i>
              {profileData.phoneNumber}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Email</div>
            <div className="info-item-value">
              <i className="fas fa-envelope"></i>
              {profileData.email}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Address</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.address || "Not provided"}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Group</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.memberGroup || "Not provided"}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Lending Period</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.lendingPeriod + " Weeks" || "Not provided"}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Item Limit</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.itemLimit || "Not provided"}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Media Item Limit</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.mediaItemLimit || "Not provided"}
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Device Limit</div>
            <div className="info-item-value">
              <i className="fas fa-map-marker-alt"></i>
              {profileData.deviceLimit || "Not provided"}
            </div>
          </div>
        </div>
        <div className="text-center">
          <a href="./settings" className="edit-button">
            Edit Profile
          </a>
        </div>
        <div className="text-center">
          <a href="./payoverdue" className="edit-button">Pay Fine</a>
        </div>
      </div>

      {/* Modal for Avatar Selection */}
      {isModalOpen && (
        <div className="avatar-modal">
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content">
            <h3>Select Avatar</h3>
            <div className="avatar-options">
              <img
                src="/avatar1.png"
                alt="Avatar 1"
                onClick={() => selectAvatar("avatar1.png")}
              />
              <img
                src="/avatar2.png"
                alt="Avatar 2"
                onClick={() => selectAvatar("avatar2.png")}
              />
              <img
                src="/avatar3.png"
                alt="Avatar 3"
                onClick={() => selectAvatar("avatar3.png")}
              />
              <img
                src="/avatar4.png"
                alt="Avatar 4"
                onClick={() => selectAvatar("avatar4.png")}
              />
              <img
                src="/avatar5.png"
                alt="Avatar 5"
                onClick={() => selectAvatar("avatar5.png")}
              />
              <img
                src="/avatar6.png"
                alt="Avatar 6"
                onClick={() => selectAvatar("avatar6.png")}
              />
              <img
                src="/avatar7.png"
                alt="Avatar 7"
                onClick={() => selectAvatar("avatar7.png")}
              />
              <img
                src="/avatar8.png"
                alt="Avatar 8"
                onClick={() => selectAvatar("avatar8.png")}
              />
              <img
                src="/avatar9.png"
                alt="Avatar 9"
                onClick={() => selectAvatar("avatar9.png")}
              />
            </div>
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
