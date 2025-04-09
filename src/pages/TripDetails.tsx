
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getTripById, saveTrip, createEmptyTrip } from "@/lib/tripStorage";
import { getBillsByTripId, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Trip, Bill, Participant } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/components/LanguageProvider";
import { getFriends } from "@/lib/friendsStorage";

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [newTripDescription, setNewTripDescription] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [availableFriends, setAvailableFriends] = useState<Participant[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Load available friends for selection
    const friends = getFriends();
    setAvailableFriends(friends);
    
    console.log("TripDetails mounted, id:", id);
    
    // Check if this is a new trip or an existing one
    if (id === "new") {
      console.log("Creating new trip, showing dialog");
      // Show dialog to create new trip
      setShowTripDialog(true);
    } else if (id) {
      console.log("Loading existing trip:", id);
      // Load existing trip
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
    } else {
      // If there's no ID at all, go back to home
      console.log("No trip ID, navigating to home");
      navigate("/");
    }
  }, [id, navigate, t]);
  
  const handleCreateTrip = () => {
    if (!newTripName.trim()) {
      toast.error(t("Please enter a trip name", "कृपया यात्रा नाम प्रविष्ट गर्नुहोस्"));
      return;
    }
    
    // Get selected participants from available friends
    const participants = availableFriends.filter(friend => 
      selectedParticipants.includes(friend.id)
    );

    // Create new trip
    const newTrip = createEmptyTrip(newTripName, participants);
    if (newTripDescription) {
      newTrip.description = newTripDescription;
    }
    if (newTripStartDate) {
      newTrip.startDate = newTripStartDate;
    }
    if (newTripEndDate) {
      newTrip.endDate = newTripEndDate;
    }
    
    console.log("Creating new trip:", newTrip);
    
    // Save the trip
    saveTrip(newTrip);
    
    // Set as current trip
    setTrip(newTrip);
    setShowTripDialog(false);
    
    // Update URL to new trip ID
    navigate(`/trip/${newTrip.id}`, { replace: true });
    
    toast.success(t("Trip created successfully", "यात्रा सफलतापूर्वक सिर्जना गरियो"));
  };
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
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
  
  // Show trip creation dialog if we're creating a new trip
  if (showTripDialog) {
    return (
      <AppLayout showBackButton title={t("New Trip", "नयाँ यात्रा")}>
        <div className="py-6 space-y-5">
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-lg font-bold mb-4">
              {t("Create New Trip", "नयाँ यात्रा सिर्जना गर्नुहोस्")}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  {t("Trip Name", "यात्रा नाम")} *
                </label>
                <Input
                  placeholder={t("Enter trip name", "यात्रा नाम प्रविष्ट गर्नुहोस्")}
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">
                  {t("Description (Optional)", "विवरण (ऐच्छिक)")}
                </label>
                <Input
                  placeholder={t("Enter description", "विवरण प्रविष्ट गर्नुहोस्")}
                  value={newTripDescription}
                  onChange={(e) => setNewTripDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    {t("Start Date", "सुरु मिति")}
                  </label>
                  <Input
                    type="date"
                    value={newTripStartDate}
                    onChange={(e) => setNewTripStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">
                    {t("End Date", "अन्त्य मिति")}
                  </label>
                  <Input
                    type="date"
                    value={newTripEndDate}
                    onChange={(e) => setNewTripEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">
                  {t("Participants", "सहभागीहरू")}
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {availableFriends.length > 0 ? (
                    availableFriends.map(friend => (
                      <div 
                        key={friend.id}
                        className="flex items-center p-2 hover:bg-muted rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`participant-${friend.id}`}
                          checked={selectedParticipants.includes(friend.id)}
                          onChange={() => toggleParticipant(friend.id)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`participant-${friend.id}`}
                          className="flex-grow cursor-pointer"
                        >
                          {friend.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-2">
                      {t("No friends available. Add friends first.", "कुनै साथी उपलब्ध छैन। पहिले साथीहरू थप्नुहोस्।")}
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCreateTrip}
                disabled={!newTripName.trim()}
              >
                {t("Create Trip", "यात्रा सिर्जना गर्नुहोस्")}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
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
          
          {bills.length > 0 ? (
            <div className="space-y-3 mb-4">
              {bills.map(bill => (
                <div 
                  key={bill.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
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
              <p>{t("No bills added to this trip yet", "यस यात्रामा अहिलेसम्म कुनै बिल थपिएको छैन")}</p>
            </div>
          )}
          
          {isAddingBill ? (
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">{t("New Bill", "नयाँ बिल")}</h4>
              <input
                type="text"
                placeholder={t("Bill title", "बिल शीर्षक")}
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
