
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getTripById, saveTrip } from "@/lib/tripStorage";
import { getBillsByTripId, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Trip, Bill, Participant } from "@/lib/types";
import { calculateParticipantBalances, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import ParticipantBalances from "@/components/SplitBill/ParticipantBalances";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/LanguageProvider";
import { getFriends, saveFriend } from "@/lib/billStorage";
import InitialContributionManager from "@/components/SplitBill/InitialContributionManager";
import TripHeader from "@/components/SplitBill/TripHeader";
import BillsList from "@/components/SplitBill/BillsList";
import CreateBillForm from "@/components/SplitBill/CreateBillForm";
import AddParticipantDialog from "@/components/SplitBill/AddParticipantDialog";

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("bills");
  const [calculatedBalances, setCalculatedBalances] = useState<Participant[]>([]);
  
  const { t } = useLanguage();
  
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
      
      // Calculate balances based on initial contributions and bills
      const updatedBalances = calculateParticipantBalances(tripData, tripBills);
      setCalculatedBalances(updatedBalances);
      
      // If we have participants in the trip, pre-select them for new bills
      if (tripData.participants && tripData.participants.length > 0) {
        setSelectedParticipantIds(tripData.participants.map(p => p.id));
      }
      
      // Load available participants (existing friends)
      const friends = getFriends();
      setAvailableParticipants([...friends]);
    } else {
      toast.error("Trip not found");
      navigate("/");
    }
  }, [id, navigate]);
  
  // Recalculate balances whenever bills or trip changes
  useEffect(() => {
    if (trip) {
      const updatedBalances = calculateParticipantBalances(trip, bills);
      setCalculatedBalances(updatedBalances);
    }
  }, [bills, trip]);
  
  const handleCreateBill = (title: string, participantIds: string[]) => {
    if (!trip || !title.trim()) return;
    
    // Select participants for this bill
    const selectedParticipants = trip.participants.filter(p => 
      participantIds.includes(p.id)
    );
    
    const newBill = createEmptyBill(title, selectedParticipants, trip.id);
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
    const updatedBills = bills.filter(bill => bill.id !== billId);
    setBills(updatedBills);
    
    // Recalculate balances after bill is removed
    if (trip) {
      const updatedBalances = calculateParticipantBalances(trip, updatedBills);
      setCalculatedBalances(updatedBalances);
    }
    
    toast.success("Bill deleted successfully");
  };
  
  const calculateTotalSpent = (): number => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0);
  };
  
  const handleParticipantsUpdate = (updatedParticipants: Participant[]) => {
    if (!trip) return;
    
    const updatedTrip = { ...trip, participants: updatedParticipants };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    
    // Recalculate balances
    const updatedBalances = calculateParticipantBalances(updatedTrip, bills);
    setCalculatedBalances(updatedBalances);
    
    toast.success("Initial contributions updated");
  };
  
  const handleMenuProcessed = (items: { name: string; price: number }[]) => {
    if (!trip || !newBillTitle.trim() || items.length === 0) {
      toast.error("Please enter a bill title first");
      return;
    }
    
    // Get selected participants for this bill
    const selectedParticipants = trip.participants.filter(p => 
      selectedParticipantIds.includes(p.id)
    );
    
    // Create new bill with scanned items
    const newBill = createEmptyBill(newBillTitle, selectedParticipants, trip.id);
    
    let totalAmount = 0;
    
    // Add scanned items to bill
    newBill.items = items.map(item => {
      totalAmount += item.price;
      
      return {
        id: generateId("item-"),
        name: item.name,
        amount: item.price,
        participants: selectedParticipants.map(p => p.id) // Default to all selected participants
      };
    });
    
    newBill.totalAmount = totalAmount;
    
    saveBill(newBill);
    
    // Update local state and recalculate balances
    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    
    if (trip) {
      const updatedBalances = calculateParticipantBalances(trip, updatedBills);
      setCalculatedBalances(updatedBalances);
    }
    
    setNewBillTitle("");
    setIsAddingBill(false);
    setShowMenuScanner(false);
    
    toast.success("Bill created with scanned items");
    navigate(`/split-details/${newBill.id}`);
  };
  
  const handleAddParticipant = (name: string) => {
    if (!trip) return;
    
    // Create new participant
    const newParticipant: Participant = {
      id: generateId("friend-"),
      name: name,
      initialContribution: 0
    };
    
    // Save to friends list
    saveFriend(newParticipant);
    
    // Add to trip participants
    const updatedParticipants = [...trip.participants, newParticipant];
    const updatedTrip = { ...trip, participants: updatedParticipants };
    
    // Save trip
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    
    // Update available participants
    setAvailableParticipants([...availableParticipants, newParticipant]);
    
    // Select the new participant for bill
    setSelectedParticipantIds([...selectedParticipantIds, newParticipant.id]);
    
    setShowAddParticipantDialog(false);
    
    // Recalculate balances
    const updatedBalances = calculateParticipantBalances(updatedTrip, bills);
    setCalculatedBalances(updatedBalances);
    
    toast.success("Participant added to trip");
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
        {/* Trip Header */}
        <TripHeader 
          trip={trip}
          billsCount={bills.length}
          totalSpent={calculateTotalSpent()}
          onEditTrip={handleEditTrip}
        />
        
        {/* Tabs for Bills and Participants */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bills" className="space-y-4">
            {/* Bills List */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-lg font-medium mb-4">Bills</h3>
              
              <BillsList 
                bills={bills}
                onEditBill={handleEditBill}
                onViewBill={handleViewBill}
                onDeleteBill={handleDeleteBill}
              />
              
              {isAddingBill ? (
                <CreateBillForm 
                  trip={trip}
                  onCreateBill={(title, participantIds) => handleCreateBill(title, participantIds)}
                  onCancel={() => setIsAddingBill(false)}
                  onScanMenu={() => setShowMenuScanner(true)}
                />
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
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            {/* Initial Contributions */}
            <InitialContributionManager 
              participants={trip.participants}
              onParticipantUpdate={handleParticipantsUpdate}
            />
            
            {/* Participant Final Balances */}
            <div className="glass-panel rounded-xl p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Balances</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddParticipantDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" /> Add Participant
                </Button>
              </div>
              
              <div className="mt-4">
                <ParticipantBalances 
                  participants={calculatedBalances}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Menu Scanner */}
        <MenuScanner 
          isOpen={showMenuScanner}
          onClose={() => setShowMenuScanner(false)}
          onMenuProcessed={handleMenuProcessed}
        />
        
        {/* Add Participant Dialog */}
        <AddParticipantDialog 
          open={showAddParticipantDialog}
          onOpenChange={setShowAddParticipantDialog}
          onAddParticipant={handleAddParticipant}
        />
      </div>
    </AppLayout>
  );
};

export default TripDetails;
