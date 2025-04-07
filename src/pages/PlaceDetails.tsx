
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getPlaceById, savePlace, createDayInPlace } from "@/lib/placesStorage";
import { getBills, createEmptyBill, saveBill, removeBill } from "@/lib/billStorage";
import { Place, Bill, Participant, PlaceDay } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Receipt, 
  Plus, 
  Edit2, 
  ArrowRight,
  MapPin,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteBillButton from "@/components/SplitBill/DeleteBillButton";
import InitialContributionManager from "@/components/SplitBill/InitialContributionManager";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PlaceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newDayDate, setNewDayDate] = useState("");
  const [newDayNotes, setNewDayNotes] = useState("");
  const { t } = useLanguage();
  
  useEffect(() => {
    if (!id) {
      navigate("/places-and-groups");
      return;
    }
    
    const placeData = getPlaceById(id);
    if (placeData) {
      setPlace(placeData);
      
      // Load all bills
      const allBills = getBills();
      const placeBills = allBills.filter(bill => bill.placeId === id);
      setBills(placeBills);
    } else {
      toast.error(t("Place not found", "स्थान फेला परेन"));
      navigate("/places-and-groups");
    }
  }, [id, navigate, t]);
  
  const handleCreateBill = (dayId?: string) => {
    if (!place || !newBillTitle.trim()) return;
    
    const participants = place.participants || [];
    const newBill = createEmptyBill(newBillTitle, participants);
    
    // Link bill to place
    newBill.placeId = place.id;
    
    // If day is selected, add day info
    if (dayId) {
      const dayNumber = parseInt(dayId.split('-').pop() || '0');
      newBill.day = dayNumber;
    }
    
    saveBill(newBill);
    
    // Add bill to place
    const updatedPlace = { ...place };
    updatedPlace.bills = updatedPlace.bills || [];
    updatedPlace.bills.push(newBill.id);
    
    // If day is selected, add to day
    if (dayId && updatedPlace.days) {
      const dayIndex = updatedPlace.days.findIndex(d => d.id === dayId);
      if (dayIndex >= 0) {
        updatedPlace.days[dayIndex].bills.push(newBill.id);
      }
    }
    
    savePlace(updatedPlace);
    setPlace(updatedPlace);
    
    // Update local state
    setBills([...bills, newBill]);
    setNewBillTitle("");
    setIsAddingBill(false);
    
    // Navigate to the bill details page
    navigate(`/split-details/${newBill.id}`);
  };
  
  const handleCreateDay = () => {
    if (!place || !newDayDate) return;
    
    const newDay = createDayInPlace(place.id, newDayDate, newDayNotes);
    if (newDay) {
      const updatedPlace = getPlaceById(place.id);
      if (updatedPlace) {
        setPlace(updatedPlace);
        setActiveTab(newDay.id);
      }
    }
    
    setIsAddingDay(false);
    setNewDayDate("");
    setNewDayNotes("");
    
    toast.success(t("New day added", "नयाँ दिन थपियो"));
  };
  
  const handleEditPlace = () => {
    // For simplicity, navigate to PlacesAndGroups page
    // In a real app, would implement proper editing
    navigate("/places-and-groups");
  };
  
  const handleViewBill = (billId: string) => {
    navigate(`/split-summary/${billId}`);
  };
  
  const handleEditBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
  };
  
  const handleDeleteBill = (billId: string) => {
    removeBill(billId);
    
    // Update local state
    setBills(bills.filter(bill => bill.id !== billId));
    
    // Update place object
    if (place) {
      const updatedPlace = { ...place };
      updatedPlace.bills = (updatedPlace.bills || []).filter(id => id !== billId);
      
      // Also remove from days
      if (updatedPlace.days) {
        updatedPlace.days.forEach(day => {
          day.bills = day.bills.filter(id => id !== billId);
        });
      }
      
      savePlace(updatedPlace);
      setPlace(updatedPlace);
    }
    
    toast.success(t("Bill deleted successfully", "बिल सफलतापूर्वक मेटाइयो"));
  };
  
  const calculateTotalSpent = (): number => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0);
  };
  
  const calculateTotalContributions = (): number => {
    if (!place || !place.participants) return 0;
    return place.participants.reduce((total, p) => total + (p.initialContribution || 0), 0);
  };
  
  const getBillsForDay = (dayId: string): Bill[] => {
    if (!place || !place.days) return [];
    
    const day = place.days.find(d => d.id === dayId);
    if (!day) return [];
    
    return bills.filter(bill => day.bills.includes(bill.id));
  };
  
  const handleUpdateParticipants = (updatedParticipants: Participant[]) => {
    if (!place) return;
    
    const updatedPlace = { ...place, participants: updatedParticipants };
    savePlace(updatedPlace);
    setPlace(updatedPlace);
    
    toast.success(t("Participant contributions updated", "सहभागी योगदानहरू अपडेट गरियो"));
  };
  
  const handleMenuProcessed = (items: { name: string; price: number }[]) => {
    if (!place || !newBillTitle.trim() || items.length === 0) {
      toast.error(t("Please enter a bill title first", "कृपया पहिले बिल शीर्षक प्रविष्ट गर्नुहोस्"));
      return;
    }
    
    // Create new bill with scanned items
    const newBill = createEmptyBill(newBillTitle, place.participants || []);
    newBill.placeId = place.id;
    
    if (selectedDay) {
      const dayNumber = parseInt(selectedDay.split('-').pop() || '0');
      newBill.day = dayNumber;
    }
    
    let totalAmount = 0;
    
    // Add scanned items to bill
    newBill.items = items.map(item => {
      totalAmount += item.price;
      
      return {
        id: generateId("item-"),
        name: item.name,
        amount: item.price,
        participants: (place.participants || []).map(p => p.id) // Default to all participants
      };
    });
    
    newBill.totalAmount = totalAmount;
    
    saveBill(newBill);
    setBills([...bills, newBill]);
    
    // Update place
    if (place) {
      const updatedPlace = { ...place };
      updatedPlace.bills = updatedPlace.bills || [];
      updatedPlace.bills.push(newBill.id);
      
      if (selectedDay && updatedPlace.days) {
        const dayIndex = updatedPlace.days.findIndex(d => d.id === selectedDay);
        if (dayIndex >= 0) {
          updatedPlace.days[dayIndex].bills.push(newBill.id);
        }
      }
      
      savePlace(updatedPlace);
      setPlace(updatedPlace);
    }
    
    setNewBillTitle("");
    setIsAddingBill(false);
    
    toast.success(t("Bill created with scanned items", "स्क्यान गरिएका आइटमहरूसँगै बिल सिर्जना गरियो"));
    navigate(`/split-details/${newBill.id}`);
  };
  
  if (!place) {
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
  
  return (
    <AppLayout showBackButton title={place.name}>
      <div className="py-6 space-y-6">
        {/* Place Details */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{place.name}</h2>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{t("Place/Trip", "स्थान/यात्रा")}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditPlace}
            >
              <Edit2 className="h-4 w-4 mr-1" /> {t("Edit", "सम्पादन")}
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            {(place.startDate || place.endDate) && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {place.startDate ? new Date(place.startDate).toLocaleDateString() : ""}
                  {place.startDate && place.endDate ? " - " : ""}
                  {place.endDate ? new Date(place.endDate).toLocaleDateString() : ""}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {place.participants?.length || 0} {t("participants", "सहभागीहरू")}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Receipt className="h-4 w-4 mr-2" />
              <span>
                {bills.length} {bills.length === 1 ? t("bill", "बिल") : t("bills", "बिलहरू")} - 
                {t("Total", "कुल")}: {formatCurrency(calculateTotalSpent())}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>
                {place.days?.length || 0} {(place.days?.length || 0) === 1 ? t("day", "दिन") : t("days", "दिनहरू")}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span>{t("Total Contributions", "कुल योगदानहरू")}:</span>
              <span className="font-medium">{formatCurrency(calculateTotalContributions())}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>{t("Total Expenses", "कुल खर्चहरू")}:</span>
              <span className="font-medium">{formatCurrency(calculateTotalSpent())}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>{t("Remaining", "बाँकी")}:</span>
              <span className={calculateTotalContributions() - calculateTotalSpent() >= 0 ? "text-green-600" : "text-destructive"}>
                {formatCurrency(calculateTotalContributions() - calculateTotalSpent())}
              </span>
            </div>
          </div>
        </div>
        
        {/* Participant Contributions */}
        {place.participants && place.participants.length > 0 && (
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-medium mb-4">{t("Participants & Contributions", "सहभागीहरू र योगदानहरू")}</h3>
            <InitialContributionManager 
              participants={place.participants}
              onParticipantUpdate={handleUpdateParticipants}
            />
          </div>
        )}
        
        {/* Tabs for Overview, Days, etc. */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="glass-panel rounded-xl p-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview">{t("Overview", "ओभरभ्यू")}</TabsTrigger>
            <TabsTrigger value="days">{t("Days", "दिनहरू")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <h3 className="text-lg font-medium mb-4">{t("All Bills", "सबै बिलहरू")}</h3>
            
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
                        {bill.day && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t("Day", "दिन")} {bill.day}
                          </span>
                        )}
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
                <p>{t("No bills added to this place yet", "यस स्थानमा अहिलेसम्म कुनै बिल थपिएको छैन")}</p>
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
                    {t("Scan Menu", "मेनु स्क्यान गर्नुहोस्")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingBill(false)}
                  >
                    {t("Cancel", "रद्द गर्नुहोस्")}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleCreateBill()}
                    disabled={!newBillTitle.trim()}
                  >
                    {t("Create Empty", "खाली सिर्जना गर्नुहोस्")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedDay(null);
                  setIsAddingBill(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Add New Bill", "नयाँ बिल थप्नुहोस्")}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="days">
            {/* If a specific day is selected */}
            {activeTab !== "days" && activeTab !== "overview" ? (
              <>
                {place.days?.find(day => day.id === activeTab) && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {t("Day", "दिन")} {activeTab.split('-').pop()} - 
                        {new Date(place.days.find(day => day.id === activeTab)?.date || "").toLocaleDateString()}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("days")}
                      >
                        {t("Back to Days", "दिनहरूमा फर्कनुहोस्")}
                      </Button>
                    </div>
                    
                    {/* Notes */}
                    {place.days.find(day => day.id === activeTab)?.notes && (
                      <div className="bg-muted/20 p-3 rounded-md mb-4">
                        <h4 className="text-sm font-medium mb-1">{t("Notes", "नोटहरू")}</h4>
                        <p className="text-sm">
                          {place.days.find(day => day.id === activeTab)?.notes}
                        </p>
                      </div>
                    )}
                    
                    <h4 className="font-medium mb-3">{t("Bills for this day", "यस दिनका बिलहरू")}</h4>
                    
                    {/* Bills for the current day */}
                    {getBillsForDay(activeTab).length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {getBillsForDay(activeTab).map(bill => (
                          <div 
                            key={bill.id} 
                            className="bg-white rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{bill.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(bill.totalAmount)}
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
                        <p>{t("No bills for this day yet", "यस दिनका लागि अहिलेसम्म कुनै बिल छैन")}</p>
                      </div>
                    )}
                    
                    {/* Add Bill to This Day */}
                    {isAddingBill ? (
                      <div className="bg-muted/20 rounded-lg p-4">
                        <h4 className="font-medium mb-2">{t("New Bill for this day", "यस दिनको लागि नयाँ बिल")}</h4>
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
                                setSelectedDay(activeTab);
                                setShowMenuScanner(true);
                              } else {
                                toast.error(t("Please enter a bill title first", "कृपया पहिले बिल शीर्षक प्रविष्ट गर्नुहोस्"));
                              }
                            }}
                          >
                            {t("Scan Menu", "मेनु स्क्यान गर्नुहोस्")}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsAddingBill(false)}
                          >
                            {t("Cancel", "रद्द गर्नुहोस्")}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleCreateBill(activeTab)}
                            disabled={!newBillTitle.trim()}
                          >
                            {t("Create Empty", "खाली सिर्जना गर्नुहोस्")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedDay(activeTab);
                          setIsAddingBill(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("Add New Bill for this day", "यस दिनको लागि नयाँ बिल थप्नुहोस्")}
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Day list */
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{t("Days", "दिनहरू")}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddingDay(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("Add Day", "दिन थप्नुहोस्")}
                  </Button>
                </div>
                
                {place.days && place.days.length > 0 ? (
                  <div className="space-y-3">
                    {place.days.map((day, index) => {
                      const dayBills = getBillsForDay(day.id);
                      const dayTotal = dayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
                      
                      return (
                        <div 
                          key={day.id}
                          className="bg-white rounded-lg p-4 shadow-sm cursor-pointer"
                          onClick={() => setActiveTab(day.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {t("Day", "दिन")} {index + 1} - {new Date(day.date).toLocaleDateString()}
                              </h4>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Receipt className="h-3 w-3 mr-1" />
                                <span>
                                  {dayBills.length} {dayBills.length === 1 ? t("bill", "बिल") : t("bills", "बिलहरू")} - 
                                  {formatCurrency(dayTotal)}
                                </span>
                              </div>
                              {day.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                                  {day.notes}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t("No days added yet", "अहिलेसम्म कुनै दिन थपिएको छैन")}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Additional tabs for days */}
          {place.days?.map(day => (
            <TabsContent key={day.id} value={day.id}>
              {/* Content for individual day tabs */}
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Day Dialog */}
        <Dialog open={isAddingDay} onOpenChange={setIsAddingDay}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add New Day", "नयाँ दिन थप्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day-date">{t("Date", "मिति")}</Label>
                <Input 
                  id="day-date" 
                  type="date"
                  value={newDayDate} 
                  onChange={(e) => setNewDayDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="day-notes">{t("Notes", "नोटहरू")} ({t("Optional", "वैकल्पिक")})</Label>
                <textarea 
                  id="day-notes"
                  value={newDayNotes}
                  onChange={(e) => setNewDayNotes(e.target.value)}
                  placeholder={t("Any notes about this day", "यस दिनको बारेमा कुनै नोटहरू")}
                  className="w-full p-2 rounded-md border"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button 
                variant="secondary"
                onClick={() => setIsAddingDay(false)}
              >
                {t("Cancel", "रद्द गर्नुहोस्")}
              </Button>
              <Button 
                onClick={handleCreateDay}
                disabled={!newDayDate}
              >
                {t("Add Day", "दिन थप्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <MenuScanner
          isOpen={showMenuScanner}
          onClose={() => setShowMenuScanner(false)}
          onMenuProcessed={handleMenuProcessed}
        />
      </div>
    </AppLayout>
  );
};

export default PlaceDetails;
