
import React from "react";
import { AppLayout } from "@/components/AppLayout";
import TripManager from "@/components/SplitBill/TripManager";
import { useLanguage } from "@/components/LanguageProvider";

const PlacesAndGroups: React.FC = () => {
  const { t } = useLanguage();

  return (
    <AppLayout showBackButton title={t("Trips", "यात्राहरू")}>
      <div className="py-6">
        <TripManager />
      </div>
    </AppLayout>
  );
};

export default PlacesAndGroups;
