import React from 'react';

interface HeroProps {
  onShowApplicationForm: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShowApplicationForm }) => {
  return (
    <section id="hero" className="bg-gradient-to-r from-brand-blue to-brand-green-light text-white py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4">Allowance Aid Lending Services: Build on Trust Funded by Us</h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">Get the allowance you need with flexible loans designed for your student life. Quick, easy, and trustworthy.</p>
        <button
          onClick={onShowApplicationForm}
          className="bg-white text-brand-blue font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;