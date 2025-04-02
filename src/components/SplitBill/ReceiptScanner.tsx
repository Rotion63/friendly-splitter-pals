
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Receipt, Scan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReceiptScannerProps {
  onItemsDetected: (items: Array<{ name: string; price: number }>) => void;
  onClose: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onItemsDetected, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCameraCapture = async () => {
    setShowCamera(true);
    // This would be implemented with a device camera API in a real app
    // For now, we'll simulate it
    toast.info("Camera access would be requested here");
  };
  
  const processImage = async () => {
    if (!previewImage) return;
    
    setIsProcessing(true);
    setProcessingStatus("Analyzing receipt...");
    
    // Simulate OCR processing with timeouts
    setTimeout(() => {
      setProcessingStatus("Detecting text...");
      
      setTimeout(() => {
        setProcessingStatus("Extracting items and prices...");
        
        setTimeout(() => {
          setIsProcessing(false);
          
          // Example detected items
          const demoItems = [
            { name: "Burger", price: 12.99 },
            { name: "Fries", price: 4.50 },
            { name: "Soda", price: 2.50 },
            { name: "Dessert", price: 6.00 }
          ];
          
          onItemsDetected(demoItems);
          toast.success("Receipt scanned successfully!");
        }, 1000);
      }, 1000);
    }, 1000);
  };
  
  const clearImage = () => {
    setPreviewImage(null);
  };
  
  return (
    <div className="p-2">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium">Scan Receipt</h3>
        <p className="text-sm text-muted-foreground">
          Upload a photo of your receipt to automatically extract items
        </p>
      </div>
      
      {!previewImage ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
            <Receipt className="h-10 w-10 mx-auto mb-4 text-primary/60" />
            <p className="text-muted-foreground mb-4">Upload a receipt image</p>
            
            <div className="flex flex-col space-y-3">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  id="receipt-upload"
                  className="hidden"
                />
                <label htmlFor="receipt-upload">
                  <Button className="w-full" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </span>
                  </Button>
                </label>
              </div>
              
              <Button onClick={handleCameraCapture} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
          
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              For best results, make sure the receipt is well-lit and the text is clearly visible
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Receipt preview" 
              className="max-h-80 mx-auto rounded-md object-contain border border-border"
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isProcessing ? (
            <div className="text-center">
              <div className="animate-pulse mb-2">
                <Scan className="h-6 w-6 mx-auto text-primary" />
              </div>
              <p className="text-sm">{processingStatus}</p>
            </div>
          ) : (
            <Button onClick={processImage} className="w-full">
              <Scan className="h-4 w-4 mr-2" />
              Scan Receipt
            </Button>
          )}
        </div>
      )}
      
      {showCamera && (
        <Dialog open={showCamera} onOpenChange={(open) => setShowCamera(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Take Photo</DialogTitle>
            </DialogHeader>
            <div className="bg-black aspect-[4/3] flex items-center justify-center rounded-md">
              <p className="text-white text-sm">Camera preview would appear here</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowCamera(false);
                const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2ODApLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgBLAEsAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApj9KfTH6UAz5m+Ofi/XdO8VSabp17Nb2EcEbGONyFLEHkkevNefxfEHxQnXXLw/wDAv/r16N8fdDuT4ol1RImeCe3jjDjoCo4OfxNeX/2He/8APnL+VapaIzkrnW+Hvihr9/4h02zn1SV4p7mON1KjBBYA9vevqWvlj4deHL7/AITrR5Da3MccVzG8jshCqAxJJ47Yr6nrOokkXFtsd+lFFZXiDXrLw1pUmo6hIVjU7UQfekbuB/U9qzsUbVFecWvxR1TXL0WXhbRHdnYIbqckbfooBJ+uK7/R9UGq2RnMEttKjFJYJRhkYdqTixm1RRRSGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABTG6U+mN0oA8N+P1gx8SWl+FzE9sI93o4Jx+orx+LwTeyRllt2GR6ivpr4heFj4q8NyWcRVbqJvOt2boXA4H4gkVxnw2bw2fBUcccqf2igKXWW+fnqd3PTnmsHUakax9yR86aboF1BqVrK0ZxFMjnj0YGvti3cSW8Ui9HUMPxGa4m68N+HprySSTTLXeyg5KA846H8K7FBlc+tVUldCpo4P4u68+g+CJUhfbPfuLZCDyF6ufyBH414N4DtHg8V6Ns4U3MWPoWFdl8edYN74ntNKRvks4fMIPTe+M/oB+dZXgaxa48YaOi9ftSv/wB8/N/SnFe6hJ+8fb1cH8S/F58L+GJGt2H225JhtwRnBP3m/Ac/jXT3NzFZ2stxcSCOGJC7segUDJNfL+taveeNvFlxcEF5bqUJCp52IOFHsAPzNZpczuacvKjstB+Fd5r+jW2sa5rcsVzcIJRbRAL5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";
                setPreviewImage(mockImage);
              }}>
                Take Photo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <Button onClick={onClose} variant="ghost" className="w-full mt-4">
        Cancel
      </Button>
    </div>
  );
};

export default ReceiptScanner;
