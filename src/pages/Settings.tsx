
import React, { useState } from "react";
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
import { useLanguage } from "@/components/LanguageProvider";

const Settings: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { isNepaliLanguage, toggleLanguage, t } = useLanguage();
  
  const toggleDarkMode = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <AppLayout showBackButton title={t("Settings", "सेटिङहरू")}>
      <div className="py-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">{t("General", "सामान्य")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("Appearance", "उपस्थिति")}</TabsTrigger>
            <TabsTrigger value="help">{t("Help", "मद्दत")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Currency Settings", "मुद्रा सेटिङहरू")}</CardTitle>
                <CardDescription>
                  {t("Choose your preferred currency for bill calculations", "बिल गणनाको लागि तपाईंको रुचाइएको मुद्रा छनौट गर्नुहोस्")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("Select Currency", "मुद्रा छान्नुहोस्")}</Label>
                  <CurrencySelector />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("Language", "भाषा")}</CardTitle>
                <CardDescription>
                  {t("Choose your preferred language", "तपाईंको मनपर्ने भाषा छनौट गर्नुहोस्")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">{t("Nepali Language", "नेपाली भाषा")}</Label>
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
                <CardTitle>{t("Display Settings", "प्रदर्शन सेटिङहरू")}</CardTitle>
                <CardDescription>
                  {t("Customize how the app looks", "एपको उपस्थिति अनुकूलन गर्नुहोस्")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{t("Dark Mode", "डार्क मोड")}</span>
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
                <CardTitle>{t("How to Use", "प्रयोग गर्ने विधि")}</CardTitle>
                <CardDescription>
                  {t("Learn how to use this application", "यो एप्लिकेसन कसरी प्रयोग गर्ने भनेर सिक्नुहोस्")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowGuide(true)}
                  className="w-full"
                >
                  {t("Show User Guide", "प्रयोगकर्ता गाइड देखाउनुहोस्")}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("About", "बारे मा")}</CardTitle>
                <CardDescription>
                  {t("About this application", "यो एप्लिकेसनको बारेमा")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">कति भो बिल ?</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "A simple app to split bills with friends and keep track of expenses.", 
                      "साथीहरूसँग बिलहरू विभाजन गर्न र खर्चको ट्र्याक राख्न एउटा सरल एप।"
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("Version", "संस्करण")}: 1.0.0
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
