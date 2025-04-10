
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FriendGroup } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

interface SelectGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: FriendGroup[];
  onSelectGroup: (group: FriendGroup) => void;
}

const SelectGroupDialog: React.FC<SelectGroupDialogProps> = ({
  open,
  onOpenChange,
  groups,
  onSelectGroup
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Select Group", "समूह चयन गर्नुहोस्")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {groups.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {groups.map(group => (
                <div 
                  key={group.id} 
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                  onClick={() => onSelectGroup(group)}
                >
                  <div>
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {group.members.length} {group.members.length === 1 ? t('member', 'सदस्य') : t('members', 'सदस्यहरू')}
                    </p>
                  </div>
                  <Button size="sm">
                    {t("Select", "चयन गर्नुहोस्")}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md text-muted-foreground">
              {t("No groups available. Create a group first.", "कुनै समूहहरू उपलब्ध छैनन्। पहिले समूह सिर्जना गर्नुहोस्।")}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button">
              {t("Close", "बन्द गर्नुहोस्")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectGroupDialog;
