
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import UserGuide from "@/components/SplitBill/UserGuide";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";

const Settings: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isNepaliLanguage, setIsNepaliLanguage] = useState(false);
  
  useEffect(() => {
    const savedLanguagePref = localStorage.getItem('nepaliLanguage');
    setIsNepaliLanguage(savedLanguagePref === 'true');
  }, []);

  const toggleLanguage = () => {
    const newValue = !isNepaliLanguage;
    setIsNepaliLanguage(newValue);
    localStorage.setItem('nepaliLanguage', newValue.toString());
  };

  const toggleDarkMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <AppLayout showBackButton title={isNepaliLanguage ? "सेटिङहरू" : "Settings"}>
      <div className="py-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">{isNepaliLanguage ? "सामान्य" : "General"}</TabsTrigger>
            <TabsTrigger value="appearance">{isNepaliLanguage ? "उपस्थिति" : "Appearance"}</TabsTrigger>
            <TabsTrigger value="help">{isNepaliLanguage ? "मद्दत" : "Help"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isNepaliLanguage ? "मुद्रा सेटिङहरू" : "Currency Settings"}</CardTitle>
                <CardDescription>
                  {isNepaliLanguage ? "बिल गणनाको लागि तपाईंको रुचाइएको मुद्रा छनौट गर्नुहोस्" : "Choose your preferred currency for bill calculations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">{isNepaliLanguage ? "मुद्रा छान्नुहोस्" : "Select Currency"}</Label>
                  <CurrencySelector />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{isNepaliLanguage ? "भाषा" : "Language"}</CardTitle>
                <CardDescription>
                  {isNepaliLanguage ? "तपाईंको मनपर्ने भाषा छनौट गर्नुहोस्" : "Choose your preferred language"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">{isNepaliLanguage ? "नेपाली भाषा" : "Nepali Language"}</Label>
                  <Switch 
                    id="language" 
                    checked={isNepaliLanguage}
                    onCheckedChange={toggleLanguage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isNepaliLanguage ? "प्रदर्शन सेटिङहरू" : "Display Settings"}</CardTitle>
                <CardDescription>
                  {isNepaliLanguage ? "एपको उपस्थिति अनुकूलन गर्नुहोस्" : "Customize how the app looks"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{isNepaliLanguage ? "डार्क मोड" : "Dark Mode"}</span>
                    <Moon className="h-4 w-4" />
                  </Label>
                  <Switch 
                    id="darkMode"
                    checked={theme === "dark"}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isNepaliLanguage ? "प्रयोग गर्ने विधि" : "How to Use"}</CardTitle>
                <CardDescription>
                  {isNepaliLanguage ? "यो एप्लिकेसन कसरी प्रयोग गर्ने भनेर सिक्नुहोस्" : "Learn how to use this application"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowGuide(true)}
                  className="w-full"
                >
                  {isNepaliLanguage ? "प्रयोगकर्ता गाइड देखाउनुहोस्" : "Show User Guide"}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{isNepaliLanguage ? "बारे मा" : "About"}</CardTitle>
                <CardDescription>
                  {isNepaliLanguage ? "यो एप्लिकेसनको बारेमा" : "About this application"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">कति भो बिल ?</h3>
                  <p className="text-sm text-muted-foreground">
                    {isNepaliLanguage 
                      ? "साथीहरूसँग बिलहरू विभाजन गर्न र खर्चको ट्र्याक राख्न एउटा सरल एप।"
                      : "A simple app to split bills with friends and keep track of expenses."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isNepaliLanguage ? "संस्करण" : "Version"}: 1.0.0
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {showGuide && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
              <div className="p-4">
                <UserGuide onDismiss={() => setShowGuide(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Settings;
