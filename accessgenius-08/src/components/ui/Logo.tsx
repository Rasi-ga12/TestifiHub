
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className,
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <Link 
      to="/" 
      className={cn(
        "flex items-center gap-2 font-medium transition-all hover:opacity-90",
        className
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
        sizeClasses[size],
        size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : 'w-12'
      )}>
        <div className="absolute inset-0 bg-primary rounded-lg animate-pulse opacity-20"></div>
        <span className="font-bold">T</span>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold leading-none",
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
          )}>
            TestifyHub
          </span>
          <span className="text-xs text-muted-foreground">Assessment Platform</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
