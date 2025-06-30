import React, { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";
import { HeaderActions } from "./HeaderActions";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Fixed Header (mobile only) */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full flex items-center justify-between px-4">
          <Logo />
          <HeaderActions
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            isAuthenticated={false}
          />
        </div>
      </header>

      {/* Centered Form */}
      <main className="flex-1 mt-16 px-4 pb-6 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthPageLayout;
