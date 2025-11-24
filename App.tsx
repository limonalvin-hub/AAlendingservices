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

function App() {
  // --- ISOLATED ADMIN ROUTE LOGIC ---
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    return window.location.hash === '#/portal/admin-access';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminPortal(window.location.hash === '#/portal/admin-access');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- STUDENT INTERFACE STATE ---
  const [page, setPage] = useState('main');

  const showTerms = () => setPage('terms');
  const showHowItWorks = () => setPage('how');
  const showApplicationForm = () => setPage('application');
  const showPaymentForm = () => setPage('payment');
  
  const showMain = () => {
    setPage('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // --- BRANCH 1: HIDDEN ADMIN PORTAL ---
  // This is completely isolated from the Student UI and Maintenance Middleware
  if (isAdminPortal) {
    return (
      <AdminPanel 
        onBack={() => {
          // "Back" for admin means exiting the portal
          window.location.hash = '';
          setPage('main');
        }} 
      />
    );
  }

  // --- BRANCH 2: STUDENT INTERFACE ---
  // Future Maintenance Mode middleware should wrap this return block ONLY.
  
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