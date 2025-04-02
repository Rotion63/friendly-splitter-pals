
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface UserGuideProps {
  onDismiss?: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onDismiss }) => {
  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-3">How to use Bill Splitter</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-start">
            <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="font-medium">1</span>
            </div>
            <p className="text-sm">Add friends you frequently split bills with</p>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="font-medium">2</span>
            </div>
            <p className="text-sm">Create a new split and add participants</p>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="font-medium">3</span>
            </div>
            <p className="text-sm">Add items and assign them to participants</p>
          </div>
          
          <div className="flex items-start">
            <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="font-medium">4</span>
            </div>
            <p className="text-sm">Calculate the split and see who owes what</p>
          </div>
        </div>
        
        {onDismiss && (
          <Button 
            variant="default" 
            className="w-full"
            onClick={onDismiss}
          >
            Got it
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserGuide;
