//note to self - FIGURE OUT WHAT THE FUCK IS WRONG W CREATING A FOLDER UGH
import { useState, useEffect } from "react";
import { type Items } from "~/services/api";
import { useOutletContext } from "react-router";
import { Link, useNavigate } from "react-router"; // Using React Router
import {type AuthData } from "~/services/api";
import {Outlet} from "react-router";
import "./dashboard.css";

export default function Dashboard() {
    const {
        isLoggedIn,
        memberID,
        groupID,
        firstName,
        lastName,
        middleName,
        address,
      } = useOutletContext<AuthData>();
    return (
        <div>
            <h2>Welcome to your profile, {firstName} {lastName}</h2>
            <Outlet />
        </div>
    )
}