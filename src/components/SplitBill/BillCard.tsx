
import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Calendar, User, Users, X } from "lucide-react";
import { Bill } from "@/lib/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BillCardProps {
  bill: Bill;
  index: number;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(bill.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(bill.id);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(bill.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div 
        onClick={handleClick}
        className="block w-full cursor-pointer"
      >
        <div className={`glass-panel rounded-xl overflow-hidden card-lift p-4 mb-4 ${bill.isDummy ? 'bg-muted/70' : ''} ${settled ? 'opacity-70' : ''}`}>
          <div className="flex justify-between items-start mb-3">
            <h3 className={`font-medium text-lg ${bill.isDummy ? 'text-muted-foreground' : ''}`}>
              {bill.title}
              {bill.isDummy && <span className="ml-2 text-xs opacity-80">(demo)</span>}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`font-medium text-lg ${bill.isDummy ? 'text-muted-foreground' : ''}`}>
                {formatCurrency(bill.totalAmount)}
              </span>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={handleEdit}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Calendar className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
            <span>{new Date(bill.date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1.5" strokeWidth={2} />
              <span>{bill.participants.length} people</span>
            </div>
            
            <div className="flex -space-x-2">
              {bill.participants.slice(0, 3).map((participant, i) => (
                <div 
                  key={participant.id}
                  className={`h-8 w-8 rounded-full ${bill.isDummy ? 'bg-muted/70 text-muted-foreground' : 'bg-primary/10 text-primary'} flex items-center justify-center border-2 border-background`}
                >
                  {participant.avatar ? (
                    <img 
                      src={participant.avatar} 
                      alt={participant.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
              ))}
              
              {bill.participants.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{bill.participants.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BillCard;
