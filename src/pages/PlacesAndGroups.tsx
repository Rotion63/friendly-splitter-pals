
import React from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupManager from "@/components/SplitBill/GroupManager";
import PlaceManager from "@/components/SplitBill/PlaceManager";

const PlacesAndGroups: React.FC = () => {
  return (
    <Layout showBackButton title="Places & Groups">
      <div className="py-6">
        <Tabs defaultValue="places" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="places">Places & Menus</TabsTrigger>
            <TabsTrigger value="groups">Friend Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="places" className="space-y-6">
            <p className="text-muted-foreground text-sm">
              Manage your frequently visited places and their menu items for quick bill creation.
            </p>
            <PlaceManager />
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-6">
            <p className="text-muted-foreground text-sm">
              Create and manage groups of friends for easier bill splitting.
            </p>
            <GroupManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PlacesAndGroups;
