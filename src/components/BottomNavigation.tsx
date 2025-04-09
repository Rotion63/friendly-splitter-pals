
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Settings, PlusCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { icon: Home, label: t("Home", "होम"), path: "/" },
    { icon: PlusCircle, label: t("New Split", "नयाँ बिल"), path: "/new-split" },
    { icon: Users, label: t("Places & Groups", "स्थान र समूह"), path: "/places-and-groups" },
    { icon: Settings, label: t("Settings", "सेटिङहरू"), path: "/settings" },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t z-50 dark:border-gray-800">
      <div className="grid grid-cols-4 h-16">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
