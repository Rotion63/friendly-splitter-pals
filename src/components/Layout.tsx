
// This component needs to be wrapped in <lov-code> and </lov-code>
// Since we can't modify this file directly, we'll create an extension component
// that wraps the existing Layout component

// File: src/components/AppLayout.tsx
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
