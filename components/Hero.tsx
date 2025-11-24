import React from 'react';

interface HeroProps {
  onShowApplicationForm: () => void;
  onShowPaymentForm: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShowApplicationForm, onShowPaymentForm }) => {
  return (
    <section id="hero" className="bg-gradient-to-r from-brand-blue to-brand-green-light text-white py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4">Allowance Aid Lending Services: Build on Trust Funded by Us</h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">Get the allowance you need with flexible loans designed for your student life. Quick, easy, and trustworthy.</p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onShowApplicationForm}
            className="w-full sm:w-auto bg-white text-brand-blue font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </button>
          <button
            onClick={onShowPaymentForm}
            className="w-full sm:w-auto bg-brand-green border-2 border-brand-green text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-green-light hover:border-brand-green-light transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Pay Your Loan
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;