import { Link, useNavigate } from "react-router";
import "../components/footer.css";
import { useState } from "react";

export function Footer() {
    return (
      <div className="footer">
        {/* Left Side - Navigation Links */}
        <div className="footer-links">
          <a href="/contactus">Contact Us</a>
          <a href="/resources">Resources</a>
          <a href="/faq">FAQ</a>
          <a href="/about">About Us</a>
        </div>
  
        {/* Right Side - Social Media Icons */}
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/facebook-logo-transparent-background-free-png.webp" alt="Facebook" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src="/twitter-new-logo-twitter-icons-new-twitter-logo-x-2023-x-social-media-icon-free-png.webp" alt="Twitter" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src="/instagram-logo-instagram-icon-transparent-free-png.webp" alt="Instagram" />
          </a>

        </div>
      </div>
    );
  }