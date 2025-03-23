import { useNavigate } from "react-router";
import { useState } from "react";

export function LogoutButton() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/logout", {
        method: "DELETE",
      });

      if (response.ok) {
        // Clear shopping cart from sessionStorage
        sessionStorage.removeItem("shoppingCart");

        // Redirect to home page after successful logout
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-nav bg-sky-500 hover:bg-sky-700 rounded-lg"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
