
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupManager from "@/components/SplitBill/GroupManager";
import FriendsList from "@/components/SplitBill/FriendsList";
import { Participant } from "@/lib/types";
import { getFriends, saveFriend, removeFriend } from "@/lib/friendsStorage";
import { useLanguage } from "@/components/LanguageProvider";

const FriendsAndGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState("friends");
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
    <AppLayout showBackButton title={t("Friends & Groups", "मित्रहरू र समूहहरू")}>
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">{t("Friends", "मित्रहरू")}</TabsTrigger>
            <TabsTrigger value="groups">{t("Groups", "समूहहरू")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="pt-6">
            <FriendsList
              friends={friends}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
            />
          </TabsContent>
          
          <TabsContent value="groups" className="pt-6">
            <GroupManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FriendsAndGroups;
