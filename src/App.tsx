
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NewSplit from './pages/NewSplit';
import SplitDetails from './pages/SplitDetails';
import SplitSummary from './pages/SplitSummary';
import FriendsAndGroups from './pages/FriendsAndGroups';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TripDetails from './pages/TripDetails';
import PlaceDetails from './pages/PlaceDetails';
import SplitTypeSelection from './pages/SplitTypeSelection';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from './components/LanguageProvider';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-split" element={<SplitTypeSelection />} />
            <Route path="/quick-split" element={<NewSplit />} />
            <Route path="/friends-and-groups" element={<FriendsAndGroups />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/split-details/:id" element={<SplitDetails />} />
            <Route path="/split-summary/:id" element={<SplitSummary />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/trip/new" element={<PlaceDetails />} />
            <Route path="/place/:id" element={<PlaceDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
