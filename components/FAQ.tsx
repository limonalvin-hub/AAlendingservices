import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Who is eligible to apply for a loan?',
      answer: 'Any currently enrolled college student in the Philippines who is 18 years old or above can apply. You will need to provide your Certificate of Registration and a valid School ID.',
    },
    {
      question: 'How much can I borrow?',
      answer: 'You can borrow from ₱200 up to ₱1000, depending on your needs. Our loan options are designed to be flexible for students.',
    },
    {
      question: 'What are the interest rates and repayment terms?',
      answer: 'Interest rates and tenure vary by loan amount. For amounts ₱200 and below, it\'s a 5% interest rate with a 1-week tenure. For ₱300-₱500, it\'s 7% for 2 weeks. For ₱600-₱1000, it\'s 10% for 1 month. All loans are paid weekly.',
    },
    {
      question: 'How long does the approval process take?',
      answer: 'We pride ourselves on a quick review process. You can expect to hear back from us within 24 business hours after submitting your complete application.',
    },
    {
      question: 'How will I receive the funds once my loan is approved?',
      answer: 'Once approved, the funds will be transferred directly to your preferred mobile wallet (e.g., GCash, Maya) or bank account.',
    },
     {
      question: 'Can I repay my loan early?',
      answer: 'Yes, you can repay your loan early without any prepayment penalties. In fact, we encourage responsible borrowing and early repayment.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-dark">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-2">Find answers to common questions about our student loan services.</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-medium text-brand-blue">{faq.question}</span>
                  <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openIndex === index && (
                  <div className="pt-4 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
