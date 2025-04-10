
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Users, MapPin } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getTripById } from "@/lib/tripStorage";

interface BillHeaderProps {
  title: string;
  onBackToTrip: () => void;
  onDelete: () => void;
  tripId?: string;
  showParticipantManager: boolean;
  onToggleParticipantManager: () => void;
}

const BillHeader: React.FC<BillHeaderProps> = ({ 
  title, 
  onBackToTrip, 
  onDelete,
  tripId,
  showParticipantManager,
  onToggleParticipantManager
}) => {
  const trip = tripId ? getTripById(tripId) : null;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleParticipantManager}
          >
            <Users className="h-4 w-4 mr-1" />
            {showParticipantManager ? "Done" : "Participants"}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bill</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this bill? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {trip && (
        <div 
          className="flex items-center text-primary cursor-pointer mt-1"
          onClick={onBackToTrip}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>Back to {trip.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillHeader;
