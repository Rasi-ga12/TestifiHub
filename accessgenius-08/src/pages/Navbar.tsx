import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import Logo from "@/components/ui/Logo";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const handleLoginClick = () => navigate("/login");

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-white bg-opacity-90 backdrop-blur-md shadow-md flex items-center justify-between px-4 sm:px-8 dark:bg-gray-900 dark:bg-opacity-90 transition-colors duration-300">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="text-2xl font-extrabold text-blue-600 tracking-wide select-none cursor-pointer dark:text-blue-400 hover:scale-105 transition-transform duration-200"
        aria-label="Home"
      >
        <Logo />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-800 dark:text-gray-100" />}
        </button>

        {/* Login */}
        <button
          onClick={handleLoginClick}
          className="px-3 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
