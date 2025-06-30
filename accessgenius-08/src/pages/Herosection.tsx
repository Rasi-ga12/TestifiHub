import React from "react";
import { motion } from "framer-motion";
import heroImage from "../../assets/negative1.jpeg";
import heroImageLight from "../../assets/hero-image1.jpeg";
import { Link } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";

const HeroSection: React.FC = () => {
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <div className="fixed inset-0 w-full h-screen overflow-auto z-50 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex flex-col md:flex-row items-center justify-between pt-20 px-6 md:px-12 gap-8">
      
      <motion.div
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
  className={`w-full md:w-1/2 text-center md:text-left space-y-6 z-10 ${
    isTablet ? "px-8" : "md:pl-20"
  }`} // updated md:ml-6 to md:pl-20 for more rightward shift
>
  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-900 dark:text-blue-200 leading-tight">
    Welcome to{" "}
    <span className="text-indigo-600 dark:text-yellow-400">TestifyHub</span>
    <br />
    Your Learning Companion.
  </h1>
  <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-md mx-auto md:mx-0">
    Unlock Your Potential! Assess your knowledge, identify your strengths & weaknesses, and achieve your goals with our interactive online exam platform
  </p>
  <div className="mt-6">
    <Link to="/register">
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-lg transition duration-300"
      >
        Get Started Now
      </motion.button>
    </Link>
  </div>
</motion.div>


      {/* Image Section - Now shown on all devices */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="w-full md:w-1/2 flex justify-center items-center relative"
      >
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[480px] md:h-[480px] rounded-full overflow-hidden shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/10">
          {/* Animated image inside */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroImageLight}
              alt="Hero Light"
              className="w-full h-full object-cover rounded-full block dark:hidden opacity-90"
            />
            <img
              src={heroImage}
              alt="Hero Dark"
              className="w-full h-full object-cover rounded-full hidden dark:block opacity-90"
            />
          </motion.div>

          {/* Overlay for blending */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-indigo-100/30 dark:from-gray-900/60 dark:via-transparent dark:to-indigo-900/40 z-10" />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
