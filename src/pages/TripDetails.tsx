
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getTripById, saveTrip } from "@/lib/tripStorage";
import { getBillsByTripId, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Trip, Bill, Participant } from "@/lib/types";
import { formatCurrency, generateId, calculateParticipantBalances } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Receipt,
  Plus,
  Edit2,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import ParticipantBalances from "@/components/SplitBill/ParticipantBalances";
import DeleteBillButton from "@/components/SplitBill/DeleteBillButton";
import InitialContributionManager from "@/components/SplitBill/InitialContributionManager";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import { getFriends, saveFriend } from "@/lib/billStorage";
import { getGroups } from "@/lib/groupsStorage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
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
  
  const handleCreateBill = () => {
    if (!trip || !newBillTitle.trim()) return;
    
    // Select participants for this bill
    const selectedParticipants = trip.participants.filter(p => 
      selectedParticipantIds.includes(p.id)
    );
    
    const newBill = createEmptyBill(newBillTitle, selectedParticipants, trip.id);
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
  
  const updateParticipantBalance = (participantId: string, newBalance: number) => {
    if (!trip) return;
    
    // This now updates the initialContribution, not the calculated balance
    const updatedParticipants = trip.participants.map(p => 
      p.id === participantId ? { ...p, initialContribution: newBalance } : p
    );
    
    const updatedTrip = { ...trip, participants: updatedParticipants };
    setTrip(updatedTrip);
    saveTrip(updatedTrip);
    toast.success("Initial contribution updated");
    
    // Recalculate balances
    const updatedBalances = calculateParticipantBalances(updatedTrip, bills);
    setCalculatedBalances(updatedBalances);
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
  
  const handleAddParticipant = () => {
    if (!trip || !newParticipantName.trim()) return;
    
    // Create new participant
    const newParticipant: Participant = {
      id: generateId("friend-"),
      name: newParticipantName.trim(),
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
    
    setNewParticipantName("");
    setShowAddParticipantDialog(false);
    
    // Recalculate balances
    const updatedBalances = calculateParticipantBalances(updatedTrip, bills);
    setCalculatedBalances(updatedBalances);
    
    toast.success("Participant added to trip");
  };
  
  const toggleBillParticipant = (participantId: string) => {
    if (selectedParticipantIds.includes(participantId)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== participantId));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, participantId]);
    }
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
                          <p className="text-xs text-muted-foreground mt-1">
                            {bill.participants.length} participants
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
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Select Participants for this Bill</h5>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {trip.participants.map(participant => (
                        <div 
                          key={participant.id}
                          className="flex items-center p-2 hover:bg-muted rounded-md"
                        >
                          <input
                            type="checkbox"
                            id={`bill-participant-${participant.id}`}
                            checked={selectedParticipantIds.includes(participant.id)}
                            onChange={() => toggleBillParticipant(participant.id)}
                            className="mr-2"
                          />
                          <label 
                            htmlFor={`bill-participant-${participant.id}`}
                            className="flex-grow cursor-pointer"
                          >
                            {participant.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (newBillTitle.trim() && selectedParticipantIds.length > 0) {
                          setShowMenuScanner(true);
                        } else {
                          toast.error("Please enter a bill title and select participants");
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
                      disabled={!newBillTitle.trim() || selectedParticipantIds.length === 0}
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
        <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add New Participant", "नयाँ सहभागी थप्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-participant-name">{t("Participant Name", "सहभागी नाम")}</Label>
                <Input 
                  id="new-participant-name" 
                  value={newParticipantName} 
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder={t("Enter name", "नाम प्रविष्ट गर्नुहोस्")}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("Cancel", "रद्द गर्नुहोस्")}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleAddParticipant}
                disabled={!newParticipantName.trim()}
              >
                {t("Add Participant", "सहभागी थप्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default TripDetails;
