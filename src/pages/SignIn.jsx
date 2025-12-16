// src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginByMatric } from "../firebaseService";
import { auth } from "../firebase"; // your Firebase config
import { signInWithEmailAndPassword, getIdTokenResult } from "firebase/auth";

const SignIn = () => {
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  // =======================
  // Student Sign-In
  // =======================
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginByMatric(matric, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  // =======================
  // Admin Sign-In
  // =======================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with Firebase email/password
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      // Check for admin custom claim
      const idTokenResult = await getIdTokenResult(user);
      if (idTokenResult.claims.admin) {
        navigate("/admin-upload"); // Redirect to admin page
      } else {
        setError("You are not authorized as admin.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Please sign in here</h1>
        <p className="text-center text-gray-500 -mt-2">Please provide us with your details to proceed</p>

        {/* Student Login */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="text"
            placeholder="Matric Number"
            value={matric}
            onChange={(e) => setMatric(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01]"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-between items-center">
          <a href="/reset-password" className="text-indigo-600 font-semibold hover:text-indigo-500 text-sm">
            Forgot Password?
          </a>
        </div>

        <p className="text-center text-gray-500 mt-2">
          Don't have an account? <a href="/signup" className="text-indigo-600 font-semibold">Sign Up</a>
        </p>

        {/* Admin Login Toggle */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAdminLogin(!showAdminLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-500 underline"
          >
            {showAdminLogin ? "Hide Admin Login" : "Admin Login"}
          </button>
        </div>

        {/* Admin Login Form */}
        {showAdminLogin && (
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full border p-3 rounded-xl"
              required
            />
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border p-3 rounded-xl"
              required
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01]"
            >
              Admin Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignIn;
