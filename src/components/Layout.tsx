
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageProvider";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="mr-2 p-1 rounded-full hover:bg-primary-foreground/20"
              aria-label={t("Go back", "पछाडि जानुहोस्")}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </header>
      <main className="flex-1 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
