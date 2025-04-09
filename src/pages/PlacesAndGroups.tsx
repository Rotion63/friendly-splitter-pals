
import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceManager from "@/components/SplitBill/PlaceManager";
import TripManager from "@/components/SplitBill/TripManager";
import { useLanguage } from "@/components/LanguageProvider";

const PlacesAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trips");
  const { t } = useLanguage();

  return (
    <AppLayout showBackButton title={t("Trips & Places", "यात्रा र स्थानहरू")}>
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trips">{t("Trips", "यात्राहरू")}</TabsTrigger>
            <TabsTrigger value="places">{t("Places", "स्थानहरू")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trips" className="pt-6">
            <TripManager />
          </TabsContent>
          
          <TabsContent value="places" className="pt-6">
            <PlaceManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PlacesAndGroups;
