
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Receipt, Plus } from "lucide-react";
import { Participant, MenuItem } from "@/lib/types";
import BillItemForm from "./BillItemForm";
import BillScanner from "./BillScanner";
import MenuScanner from "./MenuScanner";
import MenuSelector from "./MenuSelector";

interface BillItemEntryProps {
  participants: Participant[];
  onAddItem: (
    name: string, 
    amount: number, 
    participants: string[],
    rate?: number,
    quantity?: number
  ) => void;
  onBillScanned: (items: { name: string; amount: number }[]) => void;
  onMenuScanned: (items: { name: string; price: number }[]) => void;
  onMenuItemSelected: (menuItem: MenuItem) => void;
}

const BillItemEntry: React.FC<BillItemEntryProps> = ({
  participants,
  onAddItem,
  onBillScanned,
  onMenuScanned,
  onMenuItemSelected
}) => {
  const [activeTab, setActiveTab] = useState("manual");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showBillScanner, setShowBillScanner] = useState(false);
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="scan">Scan Receipt</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          {isAddingItem ? (
            <BillItemForm 
              participants={participants}
              onAddItem={onAddItem}
              onCancel={() => setIsAddingItem(false)}
            />
          ) : (
            <Button
              variant="outline"
              className="w-full py-3 mt-3"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="scan">
          <div className="p-4 border rounded-md mt-3">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="w-full py-6 flex items-center justify-center gap-2"
                onClick={() => setShowBillScanner(true)}
              >
                <Receipt className="h-5 w-5" />
                Scan Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-6 flex items-center justify-center gap-2"
                onClick={() => setShowMenuScanner(true)}
              >
                <Camera className="h-5 w-5" />
                Scan Menu
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Use OCR to automatically extract items from receipts or menus
            </p>
          </div>
          <BillScanner 
            isOpen={showBillScanner}
            onClose={() => setShowBillScanner(false)}
            onBillProcessed={onBillScanned}
          />
          <MenuScanner
            isOpen={showMenuScanner}
            onClose={() => setShowMenuScanner(false)}
            onMenuProcessed={onMenuScanned}
          />
        </TabsContent>
        
        <TabsContent value="menu">
          <div className="mt-3">
            <MenuSelector onMenuItemSelected={onMenuItemSelected} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillItemEntry;
