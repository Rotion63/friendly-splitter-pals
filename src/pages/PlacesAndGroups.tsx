
import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripManager from "@/components/SplitBill/TripManager";
import { useLanguage } from "@/components/LanguageProvider";

const PlacesAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trips");
  const { t } = useLanguage();

  return (
    <AppLayout showBackButton title={t("Trips & Places", "यात्रा र स्थानहरू")}>
      <div className="py-6">
        <TripManager />
      </div>
    </AppLayout>
  );
};

export default PlacesAndGroups;
