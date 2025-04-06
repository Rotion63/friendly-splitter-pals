
import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bill } from "@/lib/types";
import { formatAmount, getActiveCurrency } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface BillCardProps {
  bill: Bill;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  settled?: boolean;
}

const BillCard: React.FC<BillCardProps> = ({ 
  bill, 
  index, 
  onClick, 
  onEdit,
  onDelete,
  settled = false 
}) => {
  const currency = getActiveCurrency();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    onClick();
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    onEdit();
  };

  const handleDeleteClick = () => {
    onDelete();
  };
  
  const calculateTotalAmount = () => {
    let total = 0;
    if (bill.items) {
      total = bill.items.reduce((sum, item) => sum + item.price, 0);
    }
    return total;
  };
  
  const participantCount = bill.participants?.length || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { delay: index * 0.05 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "rounded-xl p-4 border cursor-pointer transition-all",
        settled 
          ? "bg-muted/50 border-muted" 
          : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 card-lift"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={cn(
            "font-semibold text-lg mb-1",
            settled ? "text-muted-foreground" : ""
          )}>
            {bill.title || "Untitled Bill"}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {bill.date ? new Date(bill.date).toLocaleDateString() : "No date"}
            {bill.place && ` • ${bill.place}`}
          </p>
        </div>
        
        <div className="flex gap-1">
          {settled && (
            <div className="bg-green-100 text-green-700 rounded-full px-2 py-1 flex items-center text-xs font-medium">
              <Check className="h-3 w-3 mr-1" />
              Settled
            </div>
          )}
          
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Bill</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this bill? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{participantCount} {participantCount === 1 ? 'person' : 'people'}</span>
        </div>
        
        <div className={cn(
          "font-semibold text-lg",
          settled ? "text-muted-foreground" : ""
        )}>
          {formatAmount(calculateTotalAmount(), currency)}
        </div>
      </div>
    </motion.div>
  );
};

export default BillCard;
