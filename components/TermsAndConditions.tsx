import React from 'react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-brand-blue-dark text-center mb-6">Terms and Conditions</h2>
          <div className="space-y-4 text-gray-600">
            <p><strong>1. Eligibility:</strong> Applicants must be currently enrolled college students in the Philippines and must be of legal age (18 years old and above). Submission of a valid Certificate of Registration and School ID is mandatory.</p>
            <p><strong>2. Loan Agreement:</strong> By submitting an application, you agree to the terms of the loan agreement which will be provided upon approval. This includes the principal amount, interest rate, repayment schedule, and any applicable fees.</p>
            <p><strong>3. Data Privacy:</strong> We are committed to protecting your privacy. The personal information you provide will be used solely for the purpose of processing your loan application and will be handled in accordance with the Data Privacy Act of 2012.</p>
            <p><strong>4. Repayment:</strong> Repayment terms will be clearly outlined in your loan agreement. Failure to make payments on time may result in penalties and could affect your credit standing.</p>
            <p><strong>5. Approval:</strong> Loan approval is subject to our credit assessment and verification process. We reserve the right to approve or reject any application at our sole discretion.</p>
            <p><strong>6. Disclaimer:</strong> The information provided on this website is for general informational purposes only. Allowance Aid is not responsible for any decisions made based on the information provided herein. Please review your loan contract carefully before proceeding.</p>
          </div>
          <div className="text-center mt-8">
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

export default TermsAndConditions;