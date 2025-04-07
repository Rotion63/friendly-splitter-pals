
import React, { useEffect } from "react";
import Layout from "./Layout";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "./ThemeProvider";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false 
}) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  // Set the theme class on the HTML element to ensure it's applied app-wide
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  return (
    <div className={`${theme === "dark" ? "dark" : ""} min-h-screen`}>
      <Layout title={title} showBackButton={showBackButton}>
        <div className={`${isMobile ? 'pb-20' : 'pb-16'}`}>
          {children}
        </div>
      </Layout>
      <BottomNavigation />
    </div>
  );
};
