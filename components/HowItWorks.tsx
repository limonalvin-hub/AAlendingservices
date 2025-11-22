import React from 'react';

interface HowItWorksProps {
  onBack: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onBack }) => {
  const steps = [
    {
      icon: '📝',
      title: 'Submit Requirements',
      description: 'Upload your Certificate of Registration, School ID, and state your loan purpose. It\'s that simple.',
    },
    {
      icon: '⏱️',
      title: 'Quick Approval',
      description: 'Our team reviews your application swiftly. We value your time and get back to you within 24 hours.',
    },
    {
      icon: '💸',
      title: 'Receive Funds',
      description: 'Once approved, the funds are transferred directly to you. Focus on your studies, not your finances.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="max-w-4xl w-full mx-auto px-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-dark">How It Works</h2>
              <p className="text-gray-600 mt-2">A simple, three-step process to get you funded.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, index) => (
                <div key={index} className="text-center p-8 bg-gray-50 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-brand-blue mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
             <div className="text-center mt-12">
                <button
                onClick={onBack}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                Back to Home
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;