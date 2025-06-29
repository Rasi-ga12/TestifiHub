import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import { Sun, Moon } from "lucide-react";
import Logo from "@/components/ui/Logo";

const Navbar: React.FC = () => {
  const navigate = useNavigate();  // Initialize navigate
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("theme")) {
        return localStorage.getItem("theme") === "dark";
      } else {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
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

  const handleLoginClick = () => {
    navigate("/login");  // Navigate to the login page
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-white bg-opacity-90 backdrop-blur-md shadow-lg flex items-center justify-between px-4 sm:px-8 dark:bg-gray-900 dark:bg-opacity-90 transition-colors duration-300">
      <div className="text-2xl font-extrabold text-blue-600 tracking-wide select-none cursor-pointer dark:text-blue-400">
        <Logo />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </button>

        <button
          onClick={handleLoginClick}   
          className="px-3 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-base bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
