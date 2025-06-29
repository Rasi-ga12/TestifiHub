import React from "react";
import heroImage from "../../assets/hero-image.jpeg";

const HeroSection: React.FC = () => {
  return (
    <div className="fixed flex flex-col md:flex-row items-center justify-between left-0 w-full min-h-screen pt-16 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="md:w-1/2 w-full space-y-4 md:space-y-6 px-4 md:px-20 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight dark:text-blue-400">
          Bring Tutoring <br /> Right to Your Home.
        </h1>
        <p className="text-base sm:text-lg text-gray-700 max-w-md mx-auto md:mx-0 dark:text-gray-300">
          Personalized learning experience at your fingertips. Join thousands who trust EduTutor for expert guidance.
        </p>
      </div>

      <div className="md:w-1/2 w-full flex justify-center items-center p-6 mt-6 md:mt-0">
        <img
          src={heroImage}
          alt="Tutoring Illustration"
          className="max-h-[50vh] sm:max-h-[60vh] md:max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>
    </div>
  );
};

export default HeroSection;
