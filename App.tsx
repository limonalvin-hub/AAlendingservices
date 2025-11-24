
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
  // --- ISOLATED ADMIN ROUTE LOGIC ---
  // HIDDEN DOOR: Only accessible via specific hash, bypasses maintenance mode
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    return window.location.hash === '#/secure-admin-login';
  });

  // Standard App Navigation State
  const [currentView, setCurrentView] = useState('hero'); 
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const isSecure = window.location.hash === '#/secure-admin-login';
      setIsAdminPortal(isSecure);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // --- REAL-TIME MAINTENANCE LISTENER ---
  // Listens for global system status changes
  useEffect(() => {
    const checkSystemStatus = () => {
      // In a real production app, this would be an API call or WebSocket listener
      const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
      
      // LOGIC: If maintenance is ON and we are NOT in the admin portal, lock the app.
      // We do NOT handle the revert to 'false' here. We keep MaintenancePage mounted
      // so it can handle the "Hard Reload" recovery strategy itself.
      if (maintenanceActive && !isAdminPortal) {
        setIsMaintenanceMode(true);
      }
    };

    // Check immediately and then poll
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 1000);

    return () => clearInterval(interval);
  }, [isAdminPortal]); // Re-run check if admin status changes

  const showMainAndScroll = (sectionId: string) => {
    setCurrentView('hero');
    // Small timeout to allow DOM to update if we were on a different view
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // --- PRIORITY RENDERING SYSTEM ---
  
  // LEVEL 1: ADMIN PORTAL (Highest Priority - Bypasses everything)
  if (isAdminPortal) {
    return <AdminPanel onBack={() => {
      window.location.hash = ''; // Clear hash to exit secure mode
      setCurrentView('hero');
      // Re-check maintenance on exit
      if (localStorage.getItem('allowance_aid_maintenance_mode') === 'true') {
        setIsMaintenanceMode(true);
      }
    }} />;
  }

  // LEVEL 2: MAINTENANCE MODE (Blocks regular users)
  if (isMaintenanceMode) {
    return <MaintenancePage onRefresh={() => window.location.reload()} />;
  }

  // LEVEL 3: STUDENT APP (Standard Access)
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
