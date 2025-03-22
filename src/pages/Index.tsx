
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BillCard from "@/components/SplitBill/BillCard";
import NewSplitButton from "@/components/SplitBill/NewSplitButton";
import { sampleBills } from "@/lib/utils";
import { Bill } from "@/lib/types";

const Index: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setBills(sampleBills);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <Layout>
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Split</h1>
          <p className="text-muted-foreground">
            Share expenses with friends easily
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="rounded-xl bg-muted/50 h-32 animate-pulse-soft"
              />
            ))}
          </div>
        ) : bills.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium mb-4">Recent Splits</h2>
            <div>
              {bills.map((bill, index) => (
                <BillCard 
                  key={bill.id} 
                  bill={bill}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No splits yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first split to get started
            </p>
          </div>
        )}
      </div>
      
      <NewSplitButton />
    </Layout>
  );
};

export default Index;
