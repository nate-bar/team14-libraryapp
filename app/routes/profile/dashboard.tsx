import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import "./dashboard.css";

export default function Dashboard() {
  const authData = useOutletContext<AuthData>();
  return (
    <div className="flex justify-center items-center h-full">
      <div className="dashboard-container">
        <h1>
          {authData.firstName} {authData.lastName}
        </h1>
        <h2>Welcome to your profile, {authData.firstName}! </h2>
        <p>
          Name: {authData.firstName} {authData.lastName}
        </p>
        <p>add bio here</p>
        <p>Date of Birth: {authData.birthdate}</p>
        <p>Phone Number: {authData.phonenumber}</p>
        <p> Email: {authData.email}</p>
        <p>Address: {authData.address}</p>
        <p>Balance: {authData.balance}</p>
      </div>
    </div>
  );
}
