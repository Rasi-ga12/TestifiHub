import React from "react";
import Navbar from "./Herosection";
import HeroSection from "./Navbar";

const Index: React.FC = () => {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Index;