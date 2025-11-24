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

  // Real-time System Check
  // Polling ensures that if maintenance is toggled in one tab/device, 
  // it immediately affects this session without refresh.
  useEffect(() => {
    const checkSystemStatus = () => {
      // 1. Check Maintenance Status from Persistence
      const maintenanceStatus = localStorage.getItem('maintenance_mode') === 'true';
      setIsMaintenanceMode(maintenanceStatus);

      // 2. Check Admin Session
      const adminSession = sessionStorage.getItem('adminAuth') === 'true';
      setIsAdminLoggedIn(adminSession);
    };

    // Initial Check
    checkSystemStatus();

    // Continuous Polling (Every 500ms) - Implements "Immediate" Throwout
    const intervalId = setInterval(checkSystemStatus, 500);

    return () => clearInterval(intervalId);
  }, []);

  // Handle URL Routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Allow direct URL access to admin login even during maintenance
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
    // Clean URL param if exists
    const url = new URL(window.location.href);
    if (url.searchParams.get('page') === 'admin') {
      url.searchParams.delete('page');
      window.history.pushState({}, '', url);
    }
  };

  const showMainAndScroll = (sectionId: string) => {
    setPage('main');
    // Use a short delay to ensure the main page is rendered before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Hidden trigger for Admin Panel
  const goToAdmin = () => {
    setPage('admin');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // --- STRICT SYSTEM GUARD ---
  // 1. If Maintenance is ON
  // 2. AND User is NOT an Admin
  // 3. AND User is NOT explicitly on the Admin Login URL (?page=admin)
  // -> THEN: Force Redirect to Maintenance Page
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