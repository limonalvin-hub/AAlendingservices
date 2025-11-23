import React from 'react';

interface FooterProps {
  onShowTerms: () => void;
  onShowHowItWorks: () => void;
  onShowApplicationForm: () => void;
  onShowMainAndScroll: (sectionId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onShowTerms, onShowHowItWorks, onShowApplicationForm, onShowMainAndScroll }) => {
  return (
    <footer className="bg-brand-blue-dark text-white py-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Allowance Aid</h3>
            <p className="text-gray-400">Your trusted partner for student financial assistance. Quick, easy, and reliable.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={onShowHowItWorks} className="text-gray-400 hover:text-white transition text-left w-full">How It Works</button></li>
              <li><button onClick={onShowApplicationForm} className="text-gray-400 hover:text-white transition text-left w-full">Application Form</button></li>
              <li><button onClick={() => onShowMainAndScroll('apply')} className="text-gray-400 hover:text-white transition text-left w-full">Requirements</button></li>
              <li><button onClick={() => onShowMainAndScroll('faq')} className="text-gray-400 hover:text-white transition text-left w-full">FAQ</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: aalendingservices@gmail.com</li>
              <li>Phone: +63 995 867 7160</li>
              <li>Address: Magsaysay St, Sorsogon City, Sorsogon</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Allowance Aid. All Rights Reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={onShowTerms} className="text-gray-400 hover:text-white underline transition text-sm">
              Terms and Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;