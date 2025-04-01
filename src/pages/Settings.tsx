
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Label } from "@/components/ui/label";

const Settings: React.FC = () => {
  return (
    <Layout showBackButton title="Settings">
      <div className="py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>
              Choose your preferred currency for bill calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Select Currency</Label>
              <CurrencySelector />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              About this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">कति भो बिल ?</h3>
              <p className="text-sm text-muted-foreground">
                A simple app to split bills with friends and keep track of expenses.
              </p>
              <p className="text-sm text-muted-foreground">
                Version: 1.0.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
