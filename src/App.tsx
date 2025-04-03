
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NewSplit from './pages/NewSplit';
import SplitDetails from './pages/SplitDetails';
import SplitSummary from './pages/SplitSummary';
import PlacesAndGroups from './pages/PlacesAndGroups';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TripDetails from './pages/TripDetails'; // Add the new page

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new-split" element={<NewSplit />} />
        <Route path="/places-and-groups" element={<PlacesAndGroups />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/split-details/:id" element={<SplitDetails />} />
        <Route path="/split-summary/:id" element={<SplitSummary />} />
        <Route path="/trip/:id" element={<TripDetails />} /> {/* Add new route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
