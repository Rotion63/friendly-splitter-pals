
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceManager from "@/components/SplitBill/PlaceManager";
import GroupManager from "@/components/SplitBill/GroupManager";
import FriendsList from "@/components/SplitBill/FriendsList";
import { Participant } from "@/lib/types";
import { getFriends, saveFriend, removeFriend } from "@/lib/friendsStorage";
import { useLanguage } from "@/components/LanguageProvider";

const PlacesAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("groups");
  const [friends, setFriends] = useState<Participant[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    setFriends(getFriends());
  }, []);

  const handleAddFriend = (friend: Participant) => {
    saveFriend(friend);
    setFriends([...friends, friend]);
  };

  const handleRemoveFriend = (id: string) => {
    removeFriend(id);
    setFriends(friends.filter(f => f.id !== id));
  };

  return (
    <AppLayout showBackButton title={t("Places & Groups", "स्थान र समूह")}>
      <div className="py-6">
        <FriendsList
          friends={friends}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">{t("Groups", "समूहहरू")}</TabsTrigger>
            <TabsTrigger value="places">{t("Places", "स्थानहरू")}</TabsTrigger>
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
