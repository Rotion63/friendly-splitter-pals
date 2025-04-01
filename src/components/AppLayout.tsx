
import React from "react";
import Layout from "./Layout";
import { BottomNavigation } from "./BottomNavigation";

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
  return (
    <>
      <Layout title={title} showBackButton={showBackButton}>
        <div className="pb-16">
          {children}
        </div>
      </Layout>
      <BottomNavigation />
    </>
  );
};
