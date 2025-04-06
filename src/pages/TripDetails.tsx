
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getTripById, saveTrip } from "@/lib/tripStorage";
import { getBillsByTripId, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Trip, Bill, Participant } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils"; // Added generateId import
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Receipt, 
  Plus, 
  Edit2, 
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import ParticipantBalances from "@/components/SplitBill/ParticipantBalances";
import DeleteBillButton from "@/components/SplitBill/DeleteBillButton";
import InitialContributionManager from "@/components/SplitBill/InitialContributionManager";
import MenuScanner from "@/components/SplitBill/MenuScanner";

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    
    const tripData = getTripById(id);
    if (tripData) {
      setTrip(tripData);
      
      // Load all bills associated with this trip
      const tripBills = getBillsByTripId(id);
      setBills(tripBills);
    } else {
      toast.error("Trip not found");
      navigate("/");
    }
  }, [id, navigate]);
  
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
  
  const handleViewBill = (billId: string) => {
    navigate(`/split-summary/${billId}`);
  };
  
  const handleEditBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
  };
  
  const handleDeleteBill = (billId: string) => {
    removeBill(billId);
    setBills(bills.filter(bill => bill.id !== billId));
    toast.success("Bill deleted successfully");
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
    toast.success("Balance updated");
  };
  
  const handleParticipantsUpdate = (updatedParticipants: Participant[]) => {
    if (!trip) return;
    
    const updatedTrip = { ...trip, participants: updatedParticipants };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    toast.success("Contributions updated");
  };
  
  const handleMenuProcessed = (items: { name: string; price: number }[]) => {
    if (!trip || !newBillTitle.trim() || items.length === 0) {
      toast.error("Please enter a bill title first");
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
    
    toast.success("Bill created with scanned items");
    navigate(`/split-details/${newBill.id}`);
  };
  
  if (!trip) {
    return (
      <AppLayout showBackButton title="Loading...">
        <div className="flex items-center justify-center h-full py-12">
          <div className="animate-pulse text-center">
            <div className="h-8 w-32 bg-muted/50 rounded mb-4 mx-auto" />
            <div className="h-32 w-full bg-muted/50 rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
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
              <Edit2 className="h-4 w-4 mr-1" /> Edit
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
              <span>{trip.participants.length} participants</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Receipt className="h-4 w-4 mr-2" />
              <span>
                {bills.length} {bills.length === 1 ? "bill" : "bills"} - Total: {formatCurrency(calculateTotalSpent())}
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
          <h3 className="text-lg font-medium mb-4">Bills</h3>
          
          {bills.length > 0 ? (
            <div className="space-y-3 mb-4">
              {bills.map(bill => (
                <div 
                  key={bill.id} 
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{bill.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bill.date).toLocaleDateString()} - {formatCurrency(bill.totalAmount)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditBill(bill.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewBill(bill.id)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <DeleteBillButton
                        onDelete={() => handleDeleteBill(bill.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No bills added to this trip yet</p>
            </div>
          )}
          
          {isAddingBill ? (
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">New Bill</h4>
              <input
                type="text"
                placeholder="Bill title"
                value={newBillTitle}
                onChange={(e) => setNewBillTitle(e.target.value)}
                className="w-full p-2 rounded-md border mb-3"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (newBillTitle.trim()) {
                      setShowMenuScanner(true);
                    } else {
                      toast.error("Please enter a bill title first");
                    }
                  }}
                >
                  Scan Menu
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingBill(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreateBill}
                  disabled={!newBillTitle.trim()}
                >
                  Create Empty
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
              Add New Bill
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
