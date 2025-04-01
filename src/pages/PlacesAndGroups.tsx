
import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceManager from "@/components/SplitBill/PlaceManager";
import GroupManager from "@/components/SplitBill/GroupManager";

const PlacesAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("places");

  return (
    <AppLayout showBackButton title="Places & Groups">
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="places" className="pt-6">
            <PlaceManager />
          </TabsContent>
          
          <TabsContent value="groups" className="pt-6">
            <GroupManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PlacesAndGroups;
