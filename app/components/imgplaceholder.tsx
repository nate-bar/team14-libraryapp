import React from "react";

const NoImage = ({ width = "100%", height = "12rem", className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={`object-contain rounded-lg ${className}`}
      style={{
        backgroundColor: "#f0f0f0",
        width,
        height,
      }}
    >
      <rect width="200" height="200" fill="#e0e0e0" />
      <path
        d="M50 75 L150 75 Q175 75, 175 100 L175 125 Q175 150, 150 150 L50 150 Q25 150, 25 125 L25 100 Q25 75, 50 75 Z"
        fill="white"
        stroke="#a0a0a0"
        strokeWidth="2"
      />
      <text
        x="100"
        y="110"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        textAnchor="middle"
        fill="#a0a0a0"
      >
        No Image
      </text>
      <path
        d="M70 85 L130 135 M130 85 L70 135"
        stroke="#a0a0a0"
        strokeWidth="2"
      />
    </svg>
  );
};

export default NoImage;
