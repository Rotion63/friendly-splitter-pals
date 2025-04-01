
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewSplit from "./pages/NewSplit";
import SplitDetails from "./pages/SplitDetails";
import SplitSummary from "./pages/SplitSummary";
import NotFound from "./pages/NotFound";
import PlacesAndGroups from "./pages/PlacesAndGroups";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-split" element={<NewSplit />} />
          <Route path="/split/:id" element={<SplitDetails />} />
          <Route path="/split-details/:id" element={<SplitDetails />} />
          <Route path="/split-summary/:id" element={<SplitSummary />} />
          <Route path="/places-and-groups" element={<PlacesAndGroups />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
