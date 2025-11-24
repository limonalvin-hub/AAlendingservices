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
  // --- EMERGENCY RESCUE PARAMETER ---
  // Check this BEFORE any other logic to allow immediate override
  // Usage: /?rescue_admin=true
  const searchParams = new URLSearchParams(window.location.search);
  const isRescueMode = searchParams.get('rescue_admin') === 'true';

  // --- STATE INITIALIZATION (SYNCHRONOUS) ---
  // Critical: Read storage immediately to prevent "flash" of incorrect state/content
  // and ensure Gatekeeper has data before first render.

  // 1. Navigation State
  const [page, setPage] = useState(() => {
    // If rescue mode is active, force navigation to Admin Panel immediately
    if (isRescueMode) return 'admin';
    return searchParams.get('page') === 'admin' ? 'admin' : 'main';
  });

  // 2. Maintenance Status
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    return localStorage.getItem('maintenance_mode') === 'true';
  });

  // 3. Admin Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  // --- MIDDLEWARE: ROUTE WHITELISTING ---
  // Checks if the current URL is explicitly allowed to bypass Maintenance Mode.
  const isWhitelisted = () => {
    const params = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;

    // 1. Allow Admin Query Parameter (Current Architecture)
    if (params.get('page') === 'admin') return true;

    // 2. Allow Explicit Admin Paths (Future-proofing/Server-side routing)
    if (currentPath.startsWith('/admin')) return true;
    if (currentPath.startsWith('/login')) return true;

    return false;
  };

  useEffect(() => {
    // Listener for cross-tab synchronization
    // If Admin toggles maintenance in one tab, others update instantly.
    const handleStorageChange = () => {
      setIsMaintenanceMode(localStorage.getItem('maintenance_mode') === 'true');
      setIsAdminLoggedIn(sessionStorage.getItem('adminAuth') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showTerms = () => setPage('terms');
  const showHowItWorks = () => setPage('how');
  const showApplicationForm = () => setPage('application');
  const showPaymentForm = () => setPage('payment');
  
  const showMain = () => {
    setPage('main');
    // Clear the URL param if going back to main to keep URL clean
    const url = new URL(window.location.href);
    if (url.searchParams.get('page') === 'admin') {
      url.searchParams.delete('page');
      window.history.pushState({}, '', url);
    }
    // Also clear rescue param if it exists so user returns to normal flow
    if (url.searchParams.get('rescue_admin') === 'true') {
      url.searchParams.delete('rescue_admin');
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
    window.location.reload();
  };

  // --- THE GATEKEEPER ---
  // Logic:
  // 1. Is Rescue Mode Active? (First Priority - Bypass EVERYTHING)
  // 2. Is Maintenance Mode Active?
  // 3. Is the Route Whitelisted? (Bypass if true)
  // 4. Is the User an Admin? (Bypass if true)
  
  const isWhitelistedRoute = isWhitelisted(); // Check URL
  const shouldBlockAccess = !isRescueMode && isMaintenanceMode && !isWhitelistedRoute && !isAdminLoggedIn;

  if (shouldBlockAccess) {
    return <MaintenancePage onRefresh={handleRefresh} />;
  }

  // --- ROUTING LOGIC ---

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