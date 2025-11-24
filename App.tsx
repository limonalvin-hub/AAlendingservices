
import React, { useState, useEffect } from 'react';
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

  // --- HELPER: SYSTEM STATUS CHECK ---
  // Defined outside useEffect to be accessible by both listeners
  const checkSystemStatus = () => {
    // PRIORITY A: ADMIN IMMUNITY
    // We check the hash dynamically. This handles "dirty" URLs like /?fbclid=...#/secure-admin-login
    const currentHash = window.location.hash;
    const isSecureHash = currentHash.includes('secure-admin-login');

    if (isSecureHash) {
      // If we are in the Admin Portal, we FORCE maintenance mode off for this session
      setIsAdminPortal(true);
      setIsMaintenanceMode(false);
      return;
    }

    setIsAdminPortal(false);

    // PRIORITY B: REAL-TIME MAINTENANCE LOCKDOWN
    // In a real app, this would be a Firestore onSnapshot or Supabase subscribe.
    // For this implementation, we poll localStorage to simulate the "Database".
    const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
    
    // LOGIC: If maintenance is ON and we are NOT in the admin portal, lock the app.
    if (maintenanceActive) {
      setIsMaintenanceMode(true);
    } else {
      setIsMaintenanceMode(false);
    }
  };

  // --- LISTENER 1: HASH CHANGES (Navigation) ---
  useEffect(() => {
    // Run immediately on mount to determine initial state
    checkSystemStatus();

    const handleHashChange = () => {
      checkSystemStatus();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // --- LISTENER 2: REAL-TIME DB POLLING (The "Brain") ---
  useEffect(() => {
    // Poll every 1 second to catch "Switch ON" events immediately
    const interval = setInterval(checkSystemStatus, 1000);
    return () => clearInterval(interval);
  }, []);

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
