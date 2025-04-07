import { Outlet, useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Link } from "react-router"; // Using React Router
import "./settings.css";

export default function SettingsPage() {
    const authData = useOutletContext<AuthData>();
    return (
        <div className="settings-container">
            <h1>Edit Your Profile:</h1>
        </div>
    );
};