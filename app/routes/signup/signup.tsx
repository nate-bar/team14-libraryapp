// app/routes/signup/signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type AccountSignup } from "~/services/api";
import { createAccount } from "./queries";
import { NavBar } from "~/components/navbar";
import { NavBar2 } from "~/components/Navbar2";
import { Footer } from "~/components/footer";
import "./signup.css";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  // State to hold the input values (make sure AccountSignup has these fields defined)
  const [accountData, setAccountData] = useState<AccountSignup>({
    email: "",
    password: "",
    group: "",
    fname: "",
    mname: "",
    lname: "",
    Bdate: "",
    Address: ""
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
      setAccountData({ email: "", password: "", group: "Student", fname: "", mname: "", lname: "", Bdate: "", Address: "" });

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
    <div>
      <NavBar/>
      <NavBar2/>
      <div className="custom-container">
        <h1 className="text-2xl font-bold mb-6 text-center">Signup Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group: First Name, Middle Name, Last Name (stacked vertically) */}
          <div className="form-group">
            {/* First Name Field */}
            <div>
              <label htmlFor="fname" className="block text-gray-700 font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={accountData.fname}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Abigail"
              />
            </div>
            {/* Middle Name Field */}
            <div>
              <label htmlFor="mname" className="block text-gray-700 font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                id="mname"
                name="mname"
                value={accountData.mname}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Jane"
              />
            </div>
            {/* Last Name Field */}
            <div>
              <label htmlFor="lname" className="block text-gray-700 font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={accountData.lname}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. Sanders"
              />
            </div>
          </div>

          {/* Row Group: Birthdate and Address (side by side) */}
          <div className="row-group">
            <div>
              <label htmlFor="Bdate" className="block text-gray-700 font-medium mb-1">
                Birthdate
              </label>
              <input
                type="date"
                id="Bdate"
                name="Bdate"
                value={accountData.Bdate}
                onChange={handleInputChange}
                className="input-field"
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label htmlFor="Address" className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                id="Address"
                name="Address"
                value={accountData.Address}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Eg. 123 Main St"
              />
            </div>
          </div>

          {/* Row Group: Email and Password (side by side) */}
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

          {/* Group Selection Dropdown */}
          <div>
            <label htmlFor="group" className="block text-gray-700 font-medium mb-1">
              I am a
            </label>
            <select
              id="group"
              name="group"
              value={accountData.group}
              onChange={handleInputChange}
              className="custom-select"
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="custom-button"
          >
            Submit
          </button>
        </form>
      </div>
      <Footer/>
    </div>
  );
};

export default SignupForm;
