import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  // --- STRICT SYSTEM GUARD: SYNCHRONOUS INITIALIZATION ---
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'admin' ? 'admin' : 'main';
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    return localStorage.getItem('maintenance_mode') === 'true';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  // Keep track of previous state to detect transitions
  const prevMaintenanceRef = useRef(isMaintenanceMode);

  // --- UNIVERSAL BROWSER ENFORCEMENT & FORCE KICK ---
  const checkSystemStatus = useCallback(() => {
    // 1. Check Global Maintenance Status
    const nextMaintenance = localStorage.getItem('maintenance_mode') === 'true';
    
    // 2. Check Admin Session Validity
    const nextAdmin = sessionStorage.getItem('adminAuth') === 'true';

    // --- FORCE KICK LOGIC ---
    // If maintenance was OFF and is now ON, and user is not Admin...
    if (!prevMaintenanceRef.current && nextMaintenance) {
      if (!nextAdmin) {
        console.warn("Maintenance activated while session active. Force kicking user.");
        // Force a hard reload from the server to bypass cache
        window.location.reload(); 
        return; 
      }
    }

    prevMaintenanceRef.current = nextMaintenance;
    
    // Only update state if changed to avoid re-renders
    setIsMaintenanceMode(prev => prev !== nextMaintenance ? nextMaintenance : prev);
    setIsAdminLoggedIn(prev => prev !== nextAdmin ? nextAdmin : prev);
  }, []);

  useEffect(() => {
    // Initial Check
    checkSystemStatus();

    // 1. Polling (Real-time listener)
    // Runs every 1 second to catch maintenance toggle quickly
    const intervalId = setInterval(checkSystemStatus, 1000);

    // 2. Storage Event (Cross-Tab Sync)
    window.addEventListener('storage', checkSystemStatus);

    // 3. Visibility Change (App Switching - Facebook/Mobile)
    document.addEventListener('visibilitychange', checkSystemStatus);

    // 4. PageShow Event (BFCache / History Navigation)
    window.addEventListener('pageshow', checkSystemStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', checkSystemStatus);
      document.removeEventListener('visibilitychange', checkSystemStatus);
      window.removeEventListener('pageshow', checkSystemStatus);
    };
  }, [checkSystemStatus]);

  const showTerms = () => setPage('terms');
  const showHowItWorks = () => setPage('how');
  const showApplicationForm = () => setPage('application');
  const showPaymentForm = () => setPage('payment');
  
  const showMain = () => {
    setPage('main');
    const url = new URL(window.location.href);
    if (url.searchParams.get('page') === 'admin') {
      url.searchParams.delete('page');
      window.history.pushState({}, '', url);
    }
  };

  const showMainAndScroll = (sectionId: string) => {
    setPage('main');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const goToAdmin = () => {
    setPage('admin');
  };

  const handleRefresh = () => {
    // Hard reload to bypass cache when checking status
    window.location.reload();
  };

  // --- GUARD CLAUSE: THE THROWOUT ---
  if (isMaintenanceMode && !isAdminLoggedIn && page !== 'admin') {
    return <MaintenancePage onRefresh={handleRefresh} />;
  }

  if (page === 'admin') {
    return <AdminPanel onBack={showMain} />;
  }

  if (page === 'terms') {
    return <TermsAndConditions onBack={showMain} />;
  }

  if (page === 'how') {
    return <HowItWorks onBack={showMain} />;
  }

  if (page === 'application') {
    return <LoanApplicationForm onBack={showMain} />;
  }

  if (page === 'payment') {
    return <PaymentForm onBack={showMain} />;
  }

  return (
    <div className="App bg-gray-100 font-sans">
      <Header
        onShowHowItWorks={showHowItWorks}
        onShowApplicationForm={showApplicationForm}
        onShowMainAndScroll={showMainAndScroll}
        onGoToAdmin={goToAdmin}
        isMaintenanceMode={isMaintenanceMode}
      />
      <main>
        <Hero 
          onShowApplicationForm={showApplicationForm} 
          onShowPaymentForm={showPaymentForm}
        />
        <LoanOptions />
        <Requirements onShowApplicationForm={showApplicationForm} />
        <FAQ />
        <Feedback />
      </main>
      <Footer
        onShowTerms={showTerms}
        onShowHowItWorks={showHowItWorks}
        onShowApplicationForm={showApplicationForm}
        onShowMainAndScroll={showMainAndScroll}
      />
    </div>
  );
}

export default App;