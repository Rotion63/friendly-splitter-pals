
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Settings, PlusCircle, Users, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlusCircle, label: "New Split", path: "/new-split" },
    { icon: Users, label: "Places & Groups", path: "/places-and-groups" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
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
