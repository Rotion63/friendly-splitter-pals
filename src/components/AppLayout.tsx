
import React from "react";
import Layout from "./Layout";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  return (
    <>
      <Layout title={title} showBackButton={showBackButton}>
        <div className={`${isMobile ? 'pb-20' : 'pb-16'}`}>
          {children}
        </div>
      </Layout>
      <BottomNavigation />
    </>
  );
};
