
import React, { useState } from "react";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ReceiptScanner from "./ReceiptScanner";
import { BillItem } from "@/lib/types";

interface AddReceiptButtonProps {
  onItemsDetected: (items: Array<{ name: string; amount: number }>) => void;
}

const AddReceiptButton: React.FC<AddReceiptButtonProps> = ({ onItemsDetected }) => {
  const [showScanner, setShowScanner] = useState(false);
  
  const handleCloseScanner = () => {
    setShowScanner(false);
  };
  
  const handleItemsDetected = (items: Array<{ name: string; price: number }>) => {
    // Convert price to amount to match BillItem type
    const convertedItems = items.map(item => ({
      name: item.name,
      amount: item.price
    }));
    
    onItemsDetected(convertedItems);
    setShowScanner(false);
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center mt-4"
        onClick={() => setShowScanner(true)}
      >
        <Receipt className="h-4 w-4 mr-2" />
        Scan Receipt
      </Button>
      
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <ReceiptScanner 
            onItemsDetected={handleItemsDetected}
            onClose={handleCloseScanner}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReceiptButton;
