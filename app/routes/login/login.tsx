import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type AccountLogin } from "~/services/api";
import { loginAccount } from "./queries";
import "../login/login.css";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState<AccountLogin>({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setMessage(null); // Clear any previous messages
    try {
      const result = await loginAccount(loginData);
      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Login failed" });
        return;
      }

      console.log("Success:", result);

      setLoginData({
        email: "",
        password: "",
      });

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: `Error submitting form: ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="">
      <div className="custom-container">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`text-center p-3 rounded-md ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

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
              className="input-field"
              placeholder="Enter your email..."
              required
            />
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
              value={loginData.password}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your password..."
              required
            />
          </div>

          <button type="submit" className="custom-button">
            Submit
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="sign">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
