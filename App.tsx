
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

  // --- PRIORITY A: ADMIN WHITELIST CHECK ---
  // Listens for hash changes to grant immunity regardless of query params (fbclid)
  useEffect(() => {
    const checkAdminHash = () => {
      // Robust check: .includes allows for potential trailing slashes or params after hash
      const isSecure = window.location.hash.includes('secure-admin-login');
      setIsAdminPortal(isSecure);
      return isSecure;
    };

    // Check on mount
    const initialAdminState = checkAdminHash();

    const handleHashChange = () => {
      checkAdminHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // --- PRIORITY B: REAL-TIME MAINTENANCE LOCKDOWN ---
  // Polls the "database" (localStorage) to lock the app instantly if not admin
  useEffect(() => {
    const checkSystemStatus = () => {
      // If we are already in the Admin Portal, we ignore maintenance checks completely
      // This prevents the maintenance screen from flashing even for a millisecond
      if (window.location.hash.includes('secure-admin-login')) {
        setIsMaintenanceMode(false);
        return;
      }

      const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
      
      // LOGIC: If maintenance is ON and we are NOT in the admin portal, lock the app.
      if (maintenanceActive) {
        setIsMaintenanceMode(true);
      } else {
        // Optional: If we want the App wrapper to handle "unlocking" without a hard reload,
        // we can set this to false. However, MaintenancePage handles the "Hard Reload" 
        // strategy for cache busting, so usually we let MaintenancePage handle the exit.
        // But for development fluidity, we allow state to toggle back if needed.
        setIsMaintenanceMode(false);
      }
    };

    // Check immediately
    checkSystemStatus();

    // Poll every 1 second (Simulates Real-Time Database Subscription)
    const interval = setInterval(checkSystemStatus, 1000);

    return () => clearInterval(interval);
  }, [isAdminPortal]); // Re-run if admin status changes

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
  
  // 1. ADMIN IMMUNITY (Top Priority)
  // Even if maintenance is TRUE, if isAdminPortal is TRUE, we render AdminPanel.
  if (isAdminPortal) {
    return <AdminPanel onBack={() => {
      // When exiting admin, clear hash. 
      // The useEffects will trigger and likely dump user into MaintenancePage if active.
      window.location.hash = ''; 
      setCurrentView('hero');
    }} />;
  }

  // 2. MAINTENANCE LOCKDOWN
  // If not admin, and maintenance is ON, block access.
  if (isMaintenanceMode) {
    return <MaintenancePage onRefresh={() => window.location.reload()} />;
  }

  // 3. MAIN STUDENT APP (Standard Access)
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
