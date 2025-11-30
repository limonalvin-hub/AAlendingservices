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
import PaymentForm from './components/PaymentForm';
import MaintenancePage from './components/MaintenancePage';

function App() {
  // --- GLOBAL GUARD STATE ---
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  // Standard App Navigation State
  const [currentView, setCurrentView] = useState('hero'); 

  // --- THE GLOBAL GUARD LOGIC ---
  const checkSystemStatus = useCallback(() => {
    // 1. REAL-TIME LISTENER (The Kill Switch)
    // Checks the "Database" (simulated via localStorage) for the global flag.
    const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
    
    // 2. CONDITIONAL FORCE KICK
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

    // 2. Storage Listener (Cross-Tab Synchronization)
    const handleStorageChange = () => checkSystemStatus();
    window.addEventListener('storage', handleStorageChange);

    // 3. Visibility Listener (Mobile/Facebook Browser Fix)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSystemStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. The Heartbeat (Real-Time Simulation)
    const heartbeat = setInterval(checkSystemStatus, 2000);

    // Cleanup
    return () => {
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

  // --- RENDER LOGIC FLOW ---
  
  // 1. MAINTENANCE SCREEN (Lockdown)
  if (isMaintenanceMode) {
    return <MaintenancePage onRefresh={() => window.location.reload()} />;
  }

  // 2. MAIN APP (Standard Access)
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