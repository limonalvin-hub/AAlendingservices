
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

  // --- THE GLOBAL GUARD LOGIC ---
  const checkSystemStatus = useCallback(() => {
    // 1. GET CURRENT URL DATA
    // We check the hash specifically to allow access regardless of ?fbclid query params
    const currentHash = window.location.hash;
    
    // 2. PRIORITY A: ADMIN IMMUNITY (The Whitelist)
    // If the hash matches the secure admin route, we GRANT ACCESS immediately.
    // We ignore the maintenance flag completely in this state.
    if (currentHash.includes('secure-admin-login')) {
      setIsAdminPortal(true);
      setIsMaintenanceMode(false); // Force False so the UI doesn't lock
      return; 
    }

    // If we are not in admin, ensure admin state is off
    setIsAdminPortal(false);

    // 3. PRIORITY B: REAL-TIME LOCKDOWN (The Kill Switch)
    // In a production environment, this would be a Firebase/Supabase real-time listener.
    // Here, we poll localStorage which acts as our synced "Database" across tabs.
    const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
    
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
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSystemStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. The Heartbeat (Real-Time Simulation)
    // Polls every 1 second to catch changes if other events miss them.
    const heartbeat = setInterval(checkSystemStatus, 1000);

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
  
  // 1. ADMIN PANEL (Top Priority)
  // Renders if the hash is correct, ignoring maintenance state.
  if (isAdminPortal) {
    return <AdminPanel onBack={() => {
      // When exiting admin, clear hash. 
      // The listeners will trigger and dump user into MaintenancePage if active.
      window.location.hash = ''; 
      setCurrentView('hero');
    }} />;
  }

  // 2. MAINTENANCE SCREEN (Lockdown)
  // Renders if maintenance is true AND user is not admin.
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
