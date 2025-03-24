
import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface IndividualConsumptionProps {
  bill: Bill;
  individualConsumption: Record<string, number>;
}

const IndividualConsumption: React.FC<IndividualConsumptionProps> = ({
  bill,
  individualConsumption
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-6"
    >
      <h3 className="text-lg font-medium mb-3">Individual Consumption</h3>
      <div className="space-y-2 mb-4">
        {Object.entries(individualConsumption).map(([participantId, amount], index) => {
          const participant = bill.participants.find(p => p.id === participantId);
          if (!participant || amount === 0) return null;
          
          return (
            <div key={participantId} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-soft">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 bg-muted">
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
                <span>{participant.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default IndividualConsumption;
