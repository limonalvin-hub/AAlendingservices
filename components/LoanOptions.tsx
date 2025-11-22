import React from 'react';

const LoanOptions: React.FC = () => {
  const options = [
    {
      amount: '₱200 and below',
      tenure: '1 week tenure',
      interest: '5% interest',
      payment: 'paid weekly.',
    },
    {
      amount: '₱300 – ₱500',
      tenure: '2 weeks tenure',
      interest: '7% interest',
      payment: 'paid weekly.',
    },
    {
      amount: '₱600 – ₱1000',
      tenure: '1 month tenure',
      interest: '10% interest',
      payment: 'paid weekly.',
    },
  ];

  return (
    <section id="loan-options" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-dark">Our Loan Options</h2>
          <p className="text-gray-600 mt-2">Our loan options are flexible and affordable.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {options.map((option, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-brand-blue mb-4">{option.amount}</h3>
              <ul className="text-gray-600 space-y-2">
                <li>{option.tenure}</li>
                <li className="font-semibold text-brand-green">{option.interest}</li>
                <li>{option.payment}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoanOptions;
