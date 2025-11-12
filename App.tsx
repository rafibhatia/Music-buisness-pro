import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Contacts } from './components/Contacts';
import { Communications } from './components/Communications';
import { Projects } from './components/Projects';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { InstallPrompt } from './components/InstallPrompt';
import { LandingPage } from './components/LandingPage';
import { InstallationGuide } from './components/InstallationGuide';
import { Toaster } from './components/ui/sonner';

type ViewMode = 'landing' | 'guide' | 'app';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('landing');

  useEffect(() => {
    // Check if user has dismissed landing page before
    const hasSeenLanding = localStorage.getItem('musicBizPro_hasSeenLanding');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check URL params for direct navigation
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const view = params.get('view');
    
    // If already seen landing or is installed, go directly to app
    if (hasSeenLanding === 'true' || isInstalled) {
      setViewMode('app');
    }
    
    // Handle URL parameters
    if (view === 'guide') {
      setViewMode('guide');
    } else if (view === 'app') {
      setViewMode('app');
      localStorage.setItem('musicBizPro_hasSeenLanding', 'true');
    }
    
    if (tab && ['dashboard', 'contacts', 'communications', 'projects', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
      setViewMode('app');
      localStorage.setItem('musicBizPro_hasSeenLanding', 'true');
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('musicBizPro_hasSeenLanding', 'true');
    setViewMode('app');
  };

  const handleViewGuide = () => {
    setViewMode('guide');
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
  };

  // Show landing page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} onViewGuide={handleViewGuide} />
        <Toaster />
      </>
    );
  }

  // Show installation guide
  if (viewMode === 'guide') {
    return (
      <>
        <InstallationGuide onBack={handleBackToLanding} onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    );
  }

  // Show main app
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'contacts' && <Contacts />}
        {activeTab === 'communications' && <Communications />}
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      </main>
      
      <InstallPrompt />
      <Toaster />
    </div>
  );
}
