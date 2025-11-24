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
  // --- STRICT SYSTEM GUARD: SYNCHRONOUS INITIALIZATION ---
  // We initialize state lazily to check localStorage BEFORE the first render.
  // This simulates a "Server-Side" block because the unauthorized view is never mounted to the DOM.

  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    // Explicitly check URL params during init to prevent "flash" of main content
    return params.get('page') === 'admin' ? 'admin' : 'main';
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    return localStorage.getItem('maintenance_mode') === 'true';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  // --- UNIVERSAL BROWSER ENFORCEMENT ---
  const checkSystemStatus = useCallback(() => {
    // 1. Check Global Maintenance Status
    const maintenanceStatus = localStorage.getItem('maintenance_mode') === 'true';
    
    // 2. Check Admin Session Validity
    const adminSession = sessionStorage.getItem('adminAuth') === 'true';
    
    // Only update if changed to avoid unnecessary re-renders
    setIsMaintenanceMode(maintenanceStatus);
    setIsAdminLoggedIn(adminSession);
  }, []);

  useEffect(() => {
    // Initial Check
    checkSystemStatus();

    // 1. Polling (Fall-back for standard browsers)
    const intervalId = setInterval(checkSystemStatus, 500);

    // 2. Storage Event (Cross-Tab Sync)
    // If admin toggles maintenance in one tab, all other tabs update instantly.
    window.addEventListener('storage', checkSystemStatus);

    // 3. Visibility Change (App Switching)
    // Critical for Mobile: User switches to Facebook/Messenger then back to Chrome/Safari.
    document.addEventListener('visibilitychange', checkSystemStatus);

    // 4. PageShow Event (BFCache / History Navigation)
    // Critical for Safari/iOS: Ensures logic runs even when hitting "Back" button from cache.
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
    // Clean URL param if exists to keep URL clean
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

  // Hidden trigger for Admin Panel (Only works if not in maintenance)
  const goToAdmin = () => {
    setPage('admin');
  };

  const handleRefresh = () => {
    // Hard reload to bypass cache when checking status
    window.location.reload();
  };

  // --- GUARD CLAUSE: THE THROWOUT ---
  // 1. IF Maintenance is ON
  // 2. AND User is NOT an Authenticated Admin
  // 3. AND User is NOT currently on the admin login page
  // -> THEN: Render Maintenance Page immediately.
  // This return statement prevents the main app tree from ever mounting.
  if (isMaintenanceMode && !isAdminLoggedIn && page !== 'admin') {
    return <MaintenancePage onRefresh={handleRefresh} />;
  }
  // ---------------------------

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