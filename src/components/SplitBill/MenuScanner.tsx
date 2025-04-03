
import React, { useState } from "react";
import { Camera, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MenuScannerProps {
  onMenuProcessed: (items: { name: string; price: number }[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MenuScanner: React.FC<MenuScannerProps> = ({ 
  onMenuProcessed, 
  isOpen, 
  onClose 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Mock OCR results for menu scanning
  const mockOcrResults = [
    { name: "Margherita Pizza", price: 9.99 },
    { name: "Pepperoni Pizza", price: 11.99 },
    { name: "Caesar Salad", price: 7.50 },
    { name: "Garlic Bread", price: 3.99 },
    { name: "Spaghetti Carbonara", price: 12.99 },
    { name: "Tiramisu", price: 5.99 }
  ];
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Create a preview URL for the selected image
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // Simulate OCR processing
    setTimeout(() => {
      setIsUploading(false);
      onMenuProcessed(mockOcrResults);
      toast.success("Menu successfully processed!");
      onClose();
    }, 2000);
  };
  
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate camera capture
    setTimeout(() => {
      setIsScanning(false);
      setPreviewImage("/placeholder.svg");
      
      // Simulate OCR processing
      setTimeout(() => {
        onMenuProcessed(mockOcrResults);
        toast.success("Menu successfully scanned!");
        onClose();
      }, 1500);
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Menu</DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4">
          {previewImage ? (
            <div className="relative rounded-md overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Menu preview" 
                className="object-contain max-h-full"
              />
              {(isScanning || isUploading) && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm text-primary font-medium">
                    {isScanning ? "Scanning..." : "Processing..."}
                  </p>
                </div>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute bottom-2 right-2"
                onClick={() => setPreviewImage(null)}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed border-muted-foreground/20 p-8 text-center space-y-4">
              <div className="flex justify-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Scan a menu or upload an image
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, PDF
                </p>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleScan}
              disabled={isScanning || isUploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 relative overflow-hidden"
              disabled={isScanning || isUploading}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <p className="text-xs text-muted-foreground w-full text-center mt-2">
            Note: OCR may not be 100% accurate. Please verify all items.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuScanner;
