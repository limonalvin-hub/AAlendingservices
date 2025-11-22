import React from 'react';

interface RequirementsProps {
  onShowApplicationForm: () => void;
}

const Requirements: React.FC<RequirementsProps> = ({ onShowApplicationForm }) => {
  const requirements = [
    { title: 'Certificate of Registration (COR)', description: 'A clear, scanned copy or photo of your latest COR to verify your enrollment.' },
    { title: 'Valid School ID', description: 'Front and back photo of your current school-issued identification card.' },
    { title: 'Purpose of Loan', description: 'A brief, clear statement explaining why you need the loan (e.g., tuition, books, project materials).' },
  ];

  return (
    <>
      <section id="apply" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-dark">What You'll Need</h2>
            <p className="text-gray-600 mt-2">Gather these simple requirements to get started.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-6">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start p-6 bg-gray-50 rounded-lg shadow-md hover:bg-green-50 transition-colors duration-300">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-green text-white font-bold text-xl">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold text-brand-blue">{req.title}</h3>
                    <p className="mt-1 text-gray-600">{req.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-center mt-12">
              <button
                onClick={onShowApplicationForm}
                className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 inline-block"
              >
                Start Your Application
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Requirements;