// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Home = () => {
  const navigate = useNavigate();

  const handleViewQuestions = () => {
    navigate("/past-questions");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Header with Sign Out Button */}
      <header className="absolute top-0 right-0 p-4 sm:p-6 w-full flex justify-end">
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition duration-150 shadow-md text-sm sm:text-base"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content Card */}
      <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl shadow-2xl text-center space-y-6 sm:space-y-8 max-w-md sm:max-w-lg md:max-w-xl w-full">
        {/* Title Block */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">
          A Space Where You Can Download Past <span className="text-blue-500">Questions</span>
        </h1>

        {/* Description */}
        <p className="text-gray-600 max-w-full sm:max-w-xl mx-auto text-sm sm:text-base md:text-lg">
          This platform is designed as a centralized digital space to provide easy access to academic past questions and exam preparation materials.
        </p>

        {/* Illustration Placeholder */}
        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-indigo-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H16.5m-13.5-3.375H12M3.75 16.5h-.00775v.0075H3.75v-.0075Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 10.5h.00825m-.00825-.00825v.00825m-.00825.00825H18.75m.00825-.00825v.00825"
            />
          </svg>
        </div>

        {/* Call to Action Button */}
        <button
          onClick={handleViewQuestions}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-3 px-6 sm:px-10 md:px-12 rounded-full transition transform hover:scale-105 shadow-xl text-sm sm:text-base md:text-lg tracking-wide"
        >
          View Past Questions
        </button>
      </div>
    </div>
  );
};

export default Home;
