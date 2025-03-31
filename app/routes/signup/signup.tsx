import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type AccountSignup } from "~/services/api";
import { createAccount } from "./queries";
import "./signup.css";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  const [accountData, setAccountData] = useState<AccountSignup>({
    email: "",
    password: "",
    GroupID: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    birthdate: "",
    phoneNumber: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    const { email, password, phoneNumber, birthdate } = accountData;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email.";
    if (!password || password.length < 6)
      return "Password must be at least 6 characters.";
    if (!phoneNumber || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber))
      return "Enter a valid phone number (e.g. 123-456-7890).";
    if (!birthdate) return "Birthdate is required.";

    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    console.log("Form submitted:", accountData);

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const result = await createAccount(accountData);

      if (!result.success) {
        alert(`Error: ${result.error || "Registration failed"}`);
        return;
      }

      console.log("Success:", result);

      // Clear form
      setAccountData({
        email: "",
        password: "",
        GroupID: "",
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        birthdate: "",
        phoneNumber: "",
      });

      alert("Registration successful! Redirecting to login page...");
      navigate("/login");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error}`);
    }
  };

  return (
    <div>
      <div className="custom-container">
        <h1 className="text-2xl font-bold mb-6 text-center">Signup Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="form-group">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={accountData.firstName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Abigail"
              />
            </div>

            <div>
              <label htmlFor="middleName" className="block text-gray-700 font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={accountData.middleName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Jane"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={accountData.lastName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Sanders"
              />
            </div>
          </div>

          {/* Birthdate & Address */}
          <div className="row-group">
            <div>
              <label htmlFor="birthdate" className="block text-gray-700 font-medium mb-1">
                Birthdate
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={accountData.birthdate}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={accountData.address}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. 123 Main St"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={accountData.phoneNumber}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Eg. 123-456-7890"
            />
          </div>

          {/* Email and Password */}
          <div className="row-group">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={accountData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Abigail.Sanders@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={accountData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your password..."
              />
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <label htmlFor="GroupID" className="block text-gray-700 font-medium mb-1">
              I am a
            </label>
            <select
              id="GroupID"
              name="GroupID"
              value={accountData.group}
              onChange={handleInputChange}
              className="custom-select"
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="custom-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
