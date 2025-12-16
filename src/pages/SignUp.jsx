// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../firebaseService";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup(email, password, matric);
      alert("Signup successful!");
      navigate("/signin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Please create your account here!
        </h1>
        <p className="text-center text-gray-500 -mt-2">
          Please provide us with your details to proceed
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-xl"
            required
          />
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
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 mt-2">
          Already have an account?{" "}
          <a href="/signin" className="text-indigo-600 font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
