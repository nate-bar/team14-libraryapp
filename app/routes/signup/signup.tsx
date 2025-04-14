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
    groupID: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    birthDate: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    birthDate: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({
    text: "",
    type: null,
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

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
      phoneNumber: "",
      birthDate: "",
      firstName: "",
      lastName: "",
    };
    const { email, password, phoneNumber, birthDate, firstName, lastName } =
      accountData;

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email.";
    if (!password || password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (!phoneNumber || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber))
      newErrors.phoneNumber = "Enter a valid phone number (e.g. 123-456-7890).";
    if (!birthDate) newErrors.birthDate = "Birthdate is required.";
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const validationError = validateForm();
    if (!validationError) return;

    try {
      const result = await createAccount(accountData);

      if (!result.success) {
        setMessage({
          text: result.error || "Registration failed",
          type: "error",
        });
        return;
      }

      setMessage({
        text: "Registration successful! Redirecting to login page...",
        type: "success",
      });

      // Clear form
      setAccountData({
        email: "",
        password: "",
        groupID: "",
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        birthDate: "",
        phoneNumber: "",
      });

      // Redirect to login page after a short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({ text: `Error submitting form: ${error}`, type: "error" });
    }
  };

  return (
    <div>
      <div className="custom-container">
        <h1 className="text-2xl font-bold mb-6 text-center">Signup Form</h1>

        {message.text && (
          <div
            className={`message-container ${
              message.type ? message.type + "-message" : ""
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="form-group">
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 font-medium mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={accountData.firstName}
                onChange={handleInputChange}
                className={`input-field ${
                  errors.firstName ? "error-field" : ""
                }`}
                placeholder="Eg. Abigail"
              />
              {errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="middleName"
                className="block text-gray-700 font-medium mb-1"
              >
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
              <label
                htmlFor="lastName"
                className="block text-gray-700 font-medium mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={accountData.lastName}
                onChange={handleInputChange}
                className={`input-field ${
                  errors.lastName ? "error-field" : ""
                }`}
                placeholder="Eg. Sanders"
              />
              {errors.lastName && (
                <div className="error-message">{errors.lastName}</div>
              )}
            </div>
          </div>

          {/* Birthdate & Address */}
          <div className="row-group">
            <div>
              <label
                htmlFor="birthDate"
                className="block text-gray-700 font-medium mb-1"
              >
                Birthdate
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={accountData.birthDate}
                onChange={handleInputChange}
                className={`input-field ${
                  errors.birthDate ? "error-field" : ""
                }`}
              />
              {errors.birthDate && (
                <div className="error-message">{errors.birthDate}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium mb-1"
              >
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
            <label
              htmlFor="phoneNumber"
              className="block text-gray-700 font-medium mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={accountData.phoneNumber}
              onChange={handleInputChange}
              className={`input-field ${
                errors.phoneNumber ? "error-field" : ""
              }`}
              placeholder="Eg. 123-456-7890"
            />
            {errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>

          {/* Email and Password */}
          <div className="row-group">
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
                className={`input-field ${errors.email ? "error-field" : ""}`}
                placeholder="Eg. Abigail.Sanders@gmail.com"
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

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
                className={`input-field ${
                  errors.password ? "error-field" : ""
                }`}
                placeholder="Enter your password..."
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <label
              htmlFor="groupID"
              className="block text-gray-700 font-medium mb-1"
            >
              I am a
            </label>
            <select
              id="groupID"
              name="groupID"
              value={accountData.groupID}
              onChange={handleInputChange}
              className="custom-select"
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Test">Test</option>
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
