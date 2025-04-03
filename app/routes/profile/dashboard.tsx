import { useOutletContext } from "react-router";
import {type AuthData } from "~/services/api";
import "./dashboard.css";

export default function Dashboard() {
    const authData = useOutletContext<AuthData>();
    return (
        <div>
            <h2>Welcome to your profile, {authData.firstName} </h2>
        </div>
    );
}
