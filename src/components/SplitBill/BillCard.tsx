
import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Calendar, User, Users } from "lucide-react";
import { Bill } from "@/lib/types";
import { Link } from "react-router-dom";

interface BillCardProps {
  bill: Bill;
  index: number;
}

const BillCard: React.FC<BillCardProps> = ({ bill, index }) => {
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
      <Link 
        to={`/split/${bill.id}`}
        className="block w-full"
      >
        <div className="glass-panel rounded-xl overflow-hidden card-lift p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-lg">{bill.title}</h3>
            <span className="font-medium text-lg">
              {formatCurrency(bill.totalAmount)}
            </span>
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
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-background"
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
      </Link>
    </motion.div>
  );
};

export default BillCard;
