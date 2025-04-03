import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import { Link, useLocation } from "react-router";
import "./admin.css";
export default function AddItem() {
  const location = useLocation();

  // Determine form type based on URL path
  const getFormType = () => {
    const path = location.pathname;
    if (path.includes("/book")) return "Book";
    if (path.includes("/media")) return "Media";
    if (path.includes("/device")) return "Device";
    return "Book"; // Default value
  };

  return (
    <div>
      <div className="admin-container">
        <h1 className="admin-header">Admin Portal - Add {getFormType()}</h1>
        <div className="admin-buttons">
          <Link to="/admin/insert/book" className="admin-button">
            Add Book
          </Link>
          <Link to="/admin/insert/media" className="admin-button">
            Add Media
          </Link>
          <Link to="/admin/insert/device" className="admin-button">
            Add Device
          </Link>
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
