// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { resetPassword } from "../firebaseService";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await resetPassword(email);
      setMessage(
        "Password reset email sent! Check your inbox or spam folder if you don't see it."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
        <p className="text-center text-gray-500 -mt-2">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />

          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01]"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-gray-500 mt-2">
          Remembered your password?{" "}
          <a href="/signin" className="text-indigo-600 font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
