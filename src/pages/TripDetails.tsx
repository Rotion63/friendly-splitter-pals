
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getTripById, saveTrip } from "@/lib/tripStorage";
import { getBillsByTripId, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Trip, Bill } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Receipt, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import ParticipantBalances from "@/components/SplitBill/ParticipantBalances";
import InitialContributionManager from "@/components/SplitBill/InitialContributionManager";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import TripCreationForm from "@/components/SplitBill/TripCreationForm";
import BillsList from "@/components/SplitBill/BillsList";

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const { t } = useLanguage();
  
  // Check for new trip creation or loading existing trip
  useEffect(() => {
    console.log("TripDetails mounted, id:", id);
    
    // If it's a new trip, the creation form will be shown
    if (id !== "new" && id) {
      console.log("Loading existing trip:", id);
      const tripData = getTripById(id);
      
      if (tripData) {
        setTrip(tripData);
        
        // Load all bills associated with this trip
        const tripBills = getBillsByTripId(id);
        setBills(tripBills);
      } else {
        toast.error(t("Trip not found", "यात्रा फेला परेन"));
        navigate("/");
      }
    }
  }, [id, navigate, t]);
  
  const handleTripCreated = (tripId: string) => {
    console.log("Trip created with ID:", tripId);
    // Navigate to the trip details page
    navigate(`/trip/${tripId}`, { replace: true });
  };
  
  const handleCreateBill = () => {
    if (!trip || !newBillTitle.trim()) return;
    
    const newBill = createEmptyBill(newBillTitle, trip.participants, trip.id);
    saveBill(newBill);
    
    // Update local state
    setBills([...bills, newBill]);
    setNewBillTitle("");
    setIsAddingBill(false);
    
    // Navigate to the bill details page
    navigate(`/split-details/${newBill.id}`);
  };
  
  const handleEditTrip = () => {
    // Navigate to trip edit page (would need to be created separately)
    // For now, just showing a toast
    toast.info("Trip editing will be available in a future update");
  };
  
  const handleDeleteBill = (billId: string) => {
    removeBill(billId);
    setBills(bills.filter(bill => bill.id !== billId));
    toast.success(t("Bill deleted successfully", "बिल सफलतापूर्वक मेटाइयो"));
  };
  
  const calculateTotalSpent = (): number => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0);
  };
  
  const updateParticipantBalance = (participantId: string, newBalance: number) => {
    if (!trip) return;
    
    const updatedParticipants = trip.participants.map(p => 
      p.id === participantId ? { ...p, balance: newBalance } : p
    );
    
    const updatedTrip = { ...trip, participants: updatedParticipants };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    toast.success(t("Balance updated", "ब्यालेन्स अपडेट गरियो"));
  };
  
  const handleParticipantsUpdate = (updatedParticipants: Trip["participants"]) => {
    if (!trip) return;
    
    const updatedTrip = { ...trip, participants: updatedParticipants };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    toast.success(t("Contributions updated", "योगदानहरू अपडेट गरिए"));
  };
  
  const handleMenuProcessed = (items: { name: string; price: number }[]) => {
    if (!trip || !newBillTitle.trim() || items.length === 0) {
      toast.error(t("Please enter a bill title first", "कृपया पहिले बिल शीर्षक प्रविष्ट गर्नुहोस्"));
      return;
    }
    
    // Create new bill with scanned items
    const newBill = createEmptyBill(newBillTitle, trip.participants, trip.id);
    
    let totalAmount = 0;
    
    // Add scanned items to bill
    newBill.items = items.map(item => {
      totalAmount += item.price;
      
      return {
        id: generateId("item-"),
        name: item.name,
        amount: item.price,
        participants: trip.participants.map(p => p.id) // Default to all participants
      };
    });
    
    newBill.totalAmount = totalAmount;
    
    saveBill(newBill);
    setBills([...bills, newBill]);
    setNewBillTitle("");
    setIsAddingBill(false);
    
    toast.success(t("Bill created with scanned items", "स्क्यान गरिएका आइटमहरू सहित बिल सिर्जना गरियो"));
    navigate(`/split-details/${newBill.id}`);
  };
  
  // Show trip creation form for new trips
  if (id === "new") {
    return (
      <AppLayout showBackButton title={t("New Trip", "नयाँ यात्रा")}>
        <TripCreationForm onSuccess={handleTripCreated} />
      </AppLayout>
    );
  }
  
  // Show loading state
  if (!trip) {
    return (
      <AppLayout showBackButton title={t("Loading...", "लोड हुँदैछ...")}>
        <div className="flex items-center justify-center h-full py-12">
          <div className="animate-pulse text-center">
            <div className="h-8 w-32 bg-muted/50 rounded mb-4 mx-auto" />
            <div className="h-32 w-full bg-muted/50 rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Render trip details once loaded
  return (
    <AppLayout showBackButton title={trip.name}>
      <div className="py-6 space-y-6">
        {/* Trip Details */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{trip.name}</h2>
              {trip.description && (
                <p className="text-muted-foreground mt-1">{trip.description}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditTrip}
            >
              <Edit2 className="h-4 w-4 mr-1" /> {t("Edit", "सम्पादन")}
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            {(trip.startDate || trip.endDate) && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""}
                  {trip.startDate && trip.endDate ? " - " : ""}
                  {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{trip.participants.length} {t("participants", "सहभागीहरू")}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Receipt className="h-4 w-4 mr-2" />
              <span>
                {bills.length} {bills.length === 1 ? t("bill", "बिल") : t("bills", "बिलहरू")} - {t("Total", "कुल")}: {formatCurrency(calculateTotalSpent())}
              </span>
            </div>
          </div>
        </div>
        
        {/* Initial Contributions */}
        <InitialContributionManager 
          participants={trip.participants}
          onParticipantUpdate={handleParticipantsUpdate}
        />
        
        {/* Participant Balances */}
        <div className="glass-panel rounded-xl p-4">
          <ParticipantBalances 
            participants={trip.participants}
            onBalanceUpdate={updateParticipantBalance}
          />
        </div>
        
        {/* Bills List */}
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-lg font-medium mb-4">{t("Bills", "बिलहरू")}</h3>
          
          <div className="space-y-3 mb-4">
            <BillsList bills={bills} onDelete={handleDeleteBill} />
          </div>
          
          {isAddingBill ? (
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">{t("New Bill", "नयाँ बिल")}</h4>
              <Input
                type="text"
                placeholder={t("Bill title", "बिल शीर्षक")}
                value={newBillTitle}
                onChange={(e) => setNewBillTitle(e.target.value)}
                className="mb-3"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (newBillTitle.trim()) {
                      setShowMenuScanner(true);
                    } else {
                      toast.error(t("Please enter a bill title first", "कृपया पहिले बिल शीर्षक प्रविष्ट गर्नुहोस्"));
                    }
                  }}
                >
                  {t("Scan Menu", "मेनु स्क्यान")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingBill(false)}
                >
                  {t("Cancel", "रद्द")}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreateBill}
                  disabled={!newBillTitle.trim()}
                >
                  {t("Create Empty", "खाली सिर्जना")}
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsAddingBill(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add New Bill", "नयाँ बिल थप्नुहोस्")}
            </Button>
          )}
        </div>

        <MenuScanner 
          isOpen={showMenuScanner}
          onClose={() => setShowMenuScanner(false)}
          onMenuProcessed={handleMenuProcessed}
        />
      </div>
    </AppLayout>
  );
};

export default TripDetails;
