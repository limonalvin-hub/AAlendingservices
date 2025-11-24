import React, { useState } from 'react';

interface HeaderProps {
  onShowHowItWorks: () => void;
  onShowApplicationForm: () => void;
  onShowMainAndScroll: (sectionId: string) => void;
  onGoToAdmin: () => void;
  isMaintenanceMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onShowHowItWorks, 
  onShowApplicationForm, 
  onShowMainAndScroll, 
  onGoToAdmin,
  isMaintenanceMode 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = (action: () => void | Promise<void>) => {
    action();
    setIsMobileMenuOpen(false);
  };
  
  const handleMobileScrollClick = (sectionId: string) => {
    onShowMainAndScroll(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Logic: If maintenance is ON, disable the secret gesture.
  // Admins must access via URL parameter (?page=admin).
  const handleLogoAction = () => {
    if (!isMaintenanceMode) {
      onGoToAdmin();
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div 
          className={`flex items-center group ${!isMaintenanceMode ? 'cursor-pointer' : 'cursor-default'}`} 
          onDoubleClick={handleLogoAction} 
          title={!isMaintenanceMode ? "Double click to access Admin" : "Allowance Aid"}
        >
          <span className="text-xl font-bold text-brand-blue-dark select-none">Allowance Aid</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={onShowHowItWorks} className="text-gray-600 hover:text-brand-blue transition">How It Works</button>
          <button onClick={onShowApplicationForm} className="text-gray-600 hover:text-brand-blue transition">Application Form</button>
          <button onClick={() => onShowMainAndScroll('apply')} className="text-gray-600 hover:text-brand-blue transition">Requirements</button>
          <button onClick={() => onShowMainAndScroll('faq')} className="text-gray-600 hover:text-brand-blue transition">FAQ</button>
          <button onClick={onShowApplicationForm} className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-2 px-4 rounded-full transition duration-300">Apply Now</button>
        </nav>
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open navigation menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-4 6h4" />
          </svg>
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full border-t border-gray-100">
          <nav className="flex flex-col items-center space-y-2 py-6 px-4">
            <button onClick={() => handleMobileLinkClick(onShowHowItWorks)} className="text-gray-600 hover:text-brand-blue transition w-full py-3 text-lg font-medium border-b border-gray-50">How It Works</button>
            <button onClick={() => handleMobileLinkClick(onShowApplicationForm)} className="text-gray-600 hover:text-brand-blue transition w-full py-3 text-lg font-medium border-b border-gray-50">Application Form</button>
            <button onClick={() => handleMobileScrollClick('apply')} className="text-gray-600 hover:text-brand-blue transition w-full py-3 text-lg font-medium border-b border-gray-50">Requirements</button>
            <button onClick={() => handleMobileScrollClick('faq')} className="text-gray-600 hover:text-brand-blue transition w-full py-3 text-lg font-medium border-b border-gray-50">FAQ</button>
            <button onClick={() => handleMobileLinkClick(onShowApplicationForm)} className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-8 rounded-full transition duration-300 w-full mt-4 text-lg">Apply Now</button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;