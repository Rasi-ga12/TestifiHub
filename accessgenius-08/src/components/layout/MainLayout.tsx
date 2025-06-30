import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useBreakpoint } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Navigation } from "./Navigation";
import { HeaderActions } from "./HeaderActions";
import { mainNavItems, bottomNavItems } from "./nav-items";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pageTransition, setPageTransition] = useState(false);
  const authRoutes = ["/login", "/register"];
  const isAuthPage = authRoutes.includes(location.pathname);

  useEffect(() => {
    const isPrivateRoute = !["/", "/login", "/register"].includes(
      location.pathname
    );
    setIsAuthenticated(isPrivateRoute);

    if (isPrivateRoute) {
      setUserRole("admin");
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const filteredMainNavItems = mainNavItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const filteredBottomNavItems = bottomNavItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden max-w-full">

      {/* Header */}
<header className="fixed top-0 left-0 w-full h-16 z-40 border-b bg-background/95">
        <div className="flex h-16 items-center justify-between py-4 px-4 w-full">
          <div className="flex items-center gap-2">
            {isAuthenticated && (isMobile || isTablet) && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <Logo />
                  <Navigation
                    items={filteredMainNavItems}
                    bottomItems={filteredBottomNavItems}
                    mobile={true}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Logo size={isMobile ? "sm" : "md"} />
            
          </div>

          <HeaderActions
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {isAuthenticated && !isMobile && !isTablet &&(
          <aside className="w-64 fixed top-16 bottom-0 left-0 border-r bg-sidebar px-4 py-6 hidden md:block overflow-y-auto">
            <Navigation
              items={filteredMainNavItems}
              bottomItems={filteredBottomNavItems}
            />
          </aside>
        )}

        <main
          className={cn(
            "absolute top-16 left-0 right-0 bottom-0 overflow-y-auto px-6 pb-6",
            isAuthenticated && !(isMobile || isTablet) ? "ml-64" : "",
            isAuthPage ? "flex items-center justify-center" : "",
            pageTransition
              ? "page-transition-enter page-transition-enter-active"
              : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;