import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { RadixProvider } from './services/radixService';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CreateTC } from './pages/CreateTC';
import { ProposalDetail } from './pages/ProposalDetail';
import { About } from './pages/About';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <RadixProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/create" element={<CreateTC />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/proposal/:id" element={<ProposalDetail />} />
            {/* Fallback for TC/RFP specific paths if needed, effectively handled by dynamic ID routing for this demo */}
            <Route path="/tc/:id" element={<ProposalDetail />} />
            <Route path="/rfp/:id" element={<ProposalDetail />} />
          </Routes>
        </Layout>
      </Router>
    </RadixProvider>
  );
};

export default App;