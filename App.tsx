import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import LoanOptions from './components/LoanOptions';
import Requirements from './components/Requirements';
import LoanApplicationForm from './components/LoanApplicationForm';
import FAQ from './components/FAQ';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import TermsAndConditions from './components/TermsAndConditions';
import AdminPanel from './components/AdminPanel';
import PaymentForm from './components/PaymentForm';
import MaintenancePage from './components/MaintenancePage';

function App() {
  // --- GLOBAL GUARD STATE ---
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  // Standard App Navigation State
  const [currentView, setCurrentView] = useState('hero'); 

  // --- THE GLOBAL GUARD LOGIC (The Brain) ---
  const checkSystemStatus = useCallback(() => {
    // 1. GET CURRENT URL DATA
    // We check the hash specifically. This is the "Safe Zone" check.
    const currentHash = window.location.hash;
    
    // 2. PRIORITY A: ADMIN IMMUNITY (Safe Zone)
    // CRITICAL: If the user is on the Admin URL, we STOP right here.
    // We explicitly set maintenance to FALSE to ensure the Admin Panel never locks up.
    if (currentHash.includes('secure-admin-login')) {
      setIsAdminPortal(true);
      setIsMaintenanceMode(false); 
      return; 
    }

    // If we reach here, the user is NOT in the safe zone.
    setIsAdminPortal(false);

    // 3. PRIORITY B: REAL-TIME LISTENER (The Kill Switch)
    // In a production app, this would be a Firebase/Supabase subscription.
    // We simulate this "Database" using localStorage which syncs across tabs instantly.
    const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
    
    // Trigger the Lockdown if active
    if (maintenanceActive) {
      setIsMaintenanceMode(true);
    } else {
      setIsMaintenanceMode(false);
    }
  }, []);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    // 1. Initial Check on Mount
    checkSystemStatus();

    // 2. Hash Change Listener (Navigation Guard)
    // Catches user trying to manually change URL to bypass logic
    const handleHashChange = () => checkSystemStatus();
    window.addEventListener('hashchange', handleHashChange);

    // 3. Storage Listener (Cross-Tab Synchronization)
    // If Admin toggles the switch in Tab A, Tab B updates instantly.
    const handleStorageChange = () => checkSystemStatus();
    window.addEventListener('storage', handleStorageChange);

    // 4. Visibility Listener (Mobile/Facebook Browser Fix)
    // When user switches tabs or unlocks phone, re-verify status immediately.
    // This fixes the "Frozen Background Tab" issue.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSystemStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. The Heartbeat (Real-Time Simulation)
    // Polls every 500ms (0.5s) to ensure "Instant" reaction time.
    const heartbeat = setInterval(checkSystemStatus, 500);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
    };
  }, [checkSystemStatus]);

  const showMainAndScroll = (sectionId: string) => {
    setCurrentView('hero');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // --- RENDER LOGIC FLOW (Strict Priority) ---
  
  // 1. ADMIN PANEL (Top Priority - Safe Zone)
  // Renders if the hash is correct, ignoring maintenance state.
  if (isAdminPortal) {
    return <AdminPanel onBack={() => {
      // When exiting admin, clear hash. 
      // The listeners will trigger immediately and dump user into MaintenancePage if active.
      window.location.hash = ''; 
      setCurrentView('hero');
    }} />;
  }

  // 2. MAINTENANCE SCREEN (Lockdown - Target Zone)
  // Renders if maintenance is true AND user is not admin.
  // This happens instantly when `isMaintenanceMode` flips to true.
  if (isMaintenanceMode) {
    return <MaintenancePage onRefresh={() => window.location.reload()} />;
  }

  // 3. MAIN APP (Standard Access)
  return (
    <div className="font-sans text-gray-800">
      {currentView === 'terms' ? (
        <TermsAndConditions onBack={() => setCurrentView('hero')} />
      ) : currentView === 'howItWorks' ? (
        <HowItWorks onBack={() => setCurrentView('hero')} />
      ) : currentView === 'application' ? (
        <LoanApplicationForm onBack={() => setCurrentView('hero')} />
      ) : currentView === 'payment' ? (
        <PaymentForm onBack={() => setCurrentView('hero')} />
      ) : (
        <>
          <Header 
            onShowHowItWorks={() => setCurrentView('howItWorks')}
            onShowApplicationForm={() => setCurrentView('application')}
            onShowMainAndScroll={showMainAndScroll}
          />
          <main>
            <Hero 
              onShowApplicationForm={() => setCurrentView('application')} 
              onShowPaymentForm={() => setCurrentView('payment')}
            />
            <LoanOptions />
            <Requirements onShowApplicationForm={() => setCurrentView('application')} />
            <Feedback />
            <FAQ />
          </main>
          <Footer 
            onShowTerms={() => setCurrentView('terms')}
            onShowHowItWorks={() => setCurrentView('howItWorks')}
            onShowApplicationForm={() => setCurrentView('application')}
            onShowMainAndScroll={showMainAndScroll}
          />
        </>
      )}
    </div>
  );
}

export default App;