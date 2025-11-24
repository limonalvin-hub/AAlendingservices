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
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'admin' ? 'admin' : 'main';
  });

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