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
  // Check URL parameters for direct Admin access (e.g., ?page=admin)
  // This is the Critical Exception allowing the Admin to bypass the maintenance lock.
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'admin' ? 'admin' : 'main';
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // 1. Check Maintenance Status from "Database" (LocalStorage)
    const maintenanceStatus = localStorage.getItem('maintenance_mode') === 'true';
    setIsMaintenanceMode(maintenanceStatus);

    // 2. Check Admin Session Validity
    const adminAuth = sessionStorage.getItem('adminAuth') === 'true';
    setIsAdminLoggedIn(adminAuth);
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
  // If Maintenance Mode is TRUE, AND user is NOT on the Admin page, AND not already logged in...
  // Redirect to Maintenance View.
  if (isMaintenanceMode && page !== 'admin' && !isAdminLoggedIn) {
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