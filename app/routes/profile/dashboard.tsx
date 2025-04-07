import { useOutletContext } from "react-router";
import {type AuthData } from "~/services/api";
import "./dashboard.css";
import ProfilePage from "./profile";

export default function Dashboard() {
    const authData = useOutletContext<AuthData>();
  
    return (
        <div><ProfilePage/>
      <div className="dashboard-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src="/avatar-placeholder.png" alt="User Avatar" />
          </div>
        </div>
        <div className="profile-name">{authData.firstName} {authData.lastName}</div>
  
        <div className="profile-info">
          <div className="info-item"><i className="fas fa-user"></i>{authData.firstName} {authData.lastName}</div>
          <div className="info-item"><i className="fas fa-birthday-cake"></i>{authData.dateOfBirth}</div>
          <div className="info-item"><i className="fas fa-phone"></i>{authData.phoneNumber}</div>
          <div className="info-item"><i className="fas fa-envelope"></i>{authData.email}</div>
          <div className="info-item"><i className="fas fa-map-marker-alt"></i>{authData.address}</div>
        </div>
  
        <button className="edit-button">Edit Profile</button>
      </div>
      </div>
    );
  }
