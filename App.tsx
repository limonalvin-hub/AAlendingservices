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

  // Check for admin URL parameter to potentially load admin page directly
  React.useEffect(() => {
    // 1. Check Maintenance Status
    const maintenanceStatus = localStorage.getItem('maintenance_mode') === 'true';
    setIsMaintenanceMode(maintenanceStatus);

    // 2. Check Admin Session
    const adminSession = sessionStorage.getItem('adminAuth') === 'true';
    setIsAdminLoggedIn(adminSession);

    // 3. Handle URL Routing
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'admin') {
      setPage('admin');
    }
  }, [page]); // Re-run checks when page state changes

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

  // Hidden trigger for Admin Panel (can be accessed via URL ?page=admin or hidden gesture)
  const goToAdmin = () => {
    setPage('admin');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // --- ROUTE GUARD ---
  // If Maintenance is ON, User is NOT Admin, and NOT trying to access Admin page -> Block Access
  if (isMaintenanceMode && !isAdminLoggedIn && page !== 'admin') {
    return <MaintenancePage onRefresh={handleRefresh} onAdminLogin={goToAdmin} />;
  }
  // -------------------

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