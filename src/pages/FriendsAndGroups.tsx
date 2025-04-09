
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
    loadFriends();
  }, []);

  const loadFriends = () => {
    setFriends(getFriends());
  };

  const handleAddFriend = (friend: Participant) => {
    saveFriend(friend);
    loadFriends();
  };

  const handleRemoveFriend = (id: string) => {
    removeFriend(id);
    loadFriends();
  };

  return (
    <AppLayout showBackButton title={t("Friends & Groups", "साथी र समूह")}>
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">{t("Friends", "साथीहरू")}</TabsTrigger>
            <TabsTrigger value="groups">{t("Groups", "समूहहरू")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="pt-6">
            <div className="text-sm text-muted-foreground mb-4">
              {t("Manage your friends list. These friends will be available across the app.", 
                "तपाईंको साथीहरूको सूची व्यवस्थापन गर्नुहोस्। यी साथीहरू एपभरि उपलब्ध हुनेछन्।")}
            </div>
            
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
