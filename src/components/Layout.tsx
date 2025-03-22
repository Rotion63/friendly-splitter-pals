
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBackButton = false,
  title 
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          {showBackButton ? (
            <Link 
              to="/"
              className="rounded-full p-2 -ml-2 hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : <div className="w-9" />} {/* Empty div for flex spacing */}
          
          {title && (
            <h1 className="text-lg font-medium absolute left-1/2 transform -translate-x-1/2">
              {title}
            </h1>
          )}
          
          <div className="w-9" /> {/* Empty div for flex spacing */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ 
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
