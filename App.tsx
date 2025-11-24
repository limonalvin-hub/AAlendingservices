
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
import { MAINTENANCE_MODE } from './constants';

function App() {
  // --- "HASH-AWARE" GUARD (SAFE ZONE) ---
  // CRITICAL: This logic MUST run before any maintenance checks.
  // It whitelists the specific admin hash to prevent lockout.
  const ADMIN_HASH_ROUTE = '#/secure-admin-login';
  
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    return window.location.hash === ADMIN_HASH_ROUTE;
  });

  // Standard App Navigation State
  const [currentView, setCurrentView] = useState('hero'); 

  useEffect(() => {
    const handleHashChange = () => {
      // Real-time check for the Safe Zone URL
      const isSafeZone = window.location.hash === ADMIN_HASH_ROUTE;
      setIsAdminPortal(isSafeZone);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
  
  // LEVEL 1: ADMIN PORTAL (Safe Zone - Exempt from Maintenance)
  if (isAdminPortal) {
    return <AdminPanel onBack={() => {
      window.location.hash = ''; // Clear hash to exit secure mode
      setCurrentView('hero');
    }} />;
  }

  // LEVEL 2: SYSTEM MAINTENANCE MODE (Blocks all non-admin traffic)
  if (MAINTENANCE_MODE) {
    return <MaintenancePage onRefresh={() => window.location.reload()} />;
  }

  // LEVEL 3: REGULAR STUDENT APP (Business as usual)
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
