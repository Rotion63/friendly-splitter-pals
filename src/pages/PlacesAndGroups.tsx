
import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceManager from "@/components/SplitBill/PlaceManager";
import GroupManager from "@/components/SplitBill/GroupManager";

const PlacesAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("groups");

  return (
    <AppLayout showBackButton title="Places & Groups">
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="pt-6">
            <GroupManager />
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
