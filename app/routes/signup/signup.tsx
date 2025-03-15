// app/routes/signup/signup.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type AccountSignup } from "~/services/api";
import { createAccount } from "./queries";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  // State to hold the input values
  const [accountData, setAccountData] = useState<AccountSignup>({
    email: "",
    password: "",
    group: "",
  });

  // Handle change for input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    console.log("Form submitted:", accountData);

    try {
      // HERE IS WHERE WE CALL createAccount FUNCTION FROM signup/queries.ts
      const result = await createAccount(accountData);

      if (!result.success) {
        alert(`Error: ${result.error || "Registration failed"}`);
        return;
      }

      console.log("Success:", result);

      // Clear form
      setAccountData({ email: "", password: "", group: "Student" });

      // Show success message
      alert("Registration successful! Redirecting to login page...");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Signup Form</h1>

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
            value={accountData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email..."
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
            value={accountData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password..."
          />
        </div>

        {/* Group Selection Dropdown */}

        <div>
          <label htmlFor="group" className="block text-white font-medium mb-1">
            I am a
          </label>

          <select
            id="group"
            name="group"
            value={accountData.group}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black"
            required
          >
            <option value="Student">Student</option>

            <option value="Faculty">Faculty</option>
          </select>
        </div>

        {/* Submit Button */}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
