// app/routes/login/login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type AccountLogin } from "~/services/api";
import { loginAccount } from "./queries";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  // State to hold the input values
  const [loginData, setLoginData] = useState<AccountLogin>({
    email: "",
    password: "",
  });

  // Handle change for input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      // Call your login API
      const result = await loginAccount(loginData);
      if (!result.success) {
        alert(`Error: ${result.error || "Login failed"}`);
        return;
      }
      console.log("Success:", result);

      // Reset form on success
      setLoginData({
        email: "",
        password: "",
      });

      // Show success message
      alert("Login successful! Redirecting to home page...");

      // Instead of trying to call createUserSession directly,
      // just navigate to the homepage - the session should
      // already be set by your backend API
      navigate("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email..."
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password..."
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></button>

        {/* Signup Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:text-blue-600">
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
