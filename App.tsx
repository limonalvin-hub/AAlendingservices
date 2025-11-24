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
  const [page, setPage] = useState('main');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // --- STRICT SYSTEM GUARD ---
  // Real-time System Check using Polling
  // This simulates a websocket or server-push notification.
  // It ensures that even without a page refresh, a user is "thrown out" 
  // if maintenance is toggled on the backend.
  useEffect(() => {
    const checkSystemStatus = () => {
      // 1. Check Global Maintenance Status
      // In a real app, this would be an API call like await fetch('/api/status')
      const maintenanceStatus = localStorage.getItem('maintenance_mode') === 'true';
      
      // 2. Check Admin Session Validity
      const adminSession = sessionStorage.getItem('adminAuth') === 'true';
      
      setIsMaintenanceMode(maintenanceStatus);
      setIsAdminLoggedIn(adminSession);

      // Force Logout / Session Invalidation Logic
      // If maintenance is ON, and user is NOT admin, and currently viewing a protected page,
      // we don't just redirect, we can also choose to clear temporary session data here if needed.
    };

    // Initial Check
    checkSystemStatus();

    // Continuous Polling (Every 500ms) 
    // This high-frequency check ensures "Immediate" restriction across tabs/windows.
    const intervalId = setInterval(checkSystemStatus, 500);

    return () => clearInterval(intervalId);
  }, []);

  // Handle URL Routing & Admin Direct Access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // CRITICAL: Admin Exception
    // We allow the router to set the page to 'admin' if the URL parameter exists.
    // The actual authentication check happens inside the AdminPanel component
    // or the guard clause below.
    if (params.get('page') === 'admin') {
      setPage('admin');
    }
  }, []);

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
  // 3. AND User is NOT attempting to reach the admin portal explicitly
  // -> THEN: Render Maintenance Page (Blocking all other components)
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