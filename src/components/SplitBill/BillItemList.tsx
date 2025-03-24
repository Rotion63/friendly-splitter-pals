
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Trash2 } from "lucide-react";
import { BillItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface BillItemListProps {
  items: BillItem[];
  onRemoveItem: (id: string) => void;
}

const BillItemList: React.FC<BillItemListProps> = ({ items, onRemoveItem }) => {
  return (
    <AnimatePresence>
      {items.length > 0 ? (
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between bg-white rounded-lg p-3 shadow-soft"
            >
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                {item.rate && item.quantity && (
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatCurrency(item.rate)} × {item.quantity}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Split among {item.participants.length} people
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(item.id)}
                className="ml-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-muted-foreground"
        >
          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No items yet</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillItemList;
