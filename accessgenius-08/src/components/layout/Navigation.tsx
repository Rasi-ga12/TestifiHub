import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  hideOnMobile ?: boolean;
}

interface NavigationProps {
  items: NavItem[];
  bottomItems?: NavItem[];
  mobile?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ items, bottomItems = [], mobile = false }) => {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "flex flex-col h-full justify-between",
        //mobile ? "mt-4" : "justify-between"
      )}
    >
      {/* Top/Main Nav */}
      <div className="flex flex-col gap-1">
        {items.filter(item => !(mobile && item.hideOnMobile))
        .map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-primary/10 hover:text-foreground",
              mobile ? "text-base" : "text-sm"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>

      {/* Bottom/Sticky Nav */}
      {bottomItems.length > 0 && (
        <div className="flex flex-col gap-1 mt-8 pt-4 border-t border-border">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-primary/10 hover:text-foreground",
                mobile ? "text-base" : "text-sm"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};