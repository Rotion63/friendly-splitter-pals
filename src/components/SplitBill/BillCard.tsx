
import React from "react";
import { motion } from "framer-motion";
import { Edit, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Bill } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface BillCardProps {
  bill: Bill;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  settled?: boolean;
}

const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  index, 
  onClick, 
  onEdit, 
  settled = false 
}) => {
  const animationDelay = index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className="bg-white rounded-lg p-4 shadow-soft relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{bill.title}</h3>
          <p className="text-muted-foreground text-sm">
            {new Date(bill.date).toLocaleDateString()}
          </p>
        </div>
        {settled && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 opacity-70" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</p>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-2 py-1"
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Edit</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClick}
          className="px-2 py-1"
        >
          <span className="text-xs">View</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default BillCard;
