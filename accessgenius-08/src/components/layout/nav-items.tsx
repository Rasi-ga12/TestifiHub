import React from 'react';
import { Home, FileText, BarChart3, Users, Settings, Code, MessageCircle } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  hideOnMobile?: boolean; 
}

export const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { title: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Code Generator', href: '/code-generator', icon: <Code className="h-5 w-5" />,hideOnMobile: true, }
 
];

export const bottomNavItems: NavItem[] = [
  { title: 'Feedback', href: '/feedback', icon: <MessageCircle className="h-5 w-5" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> }
];