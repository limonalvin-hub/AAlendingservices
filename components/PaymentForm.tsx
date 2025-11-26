
import React, { useState } from 'react';

interface PaymentFormProps {
  onBack: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    method: 'gcash', // gcash, maya, in_person
    walletNumber: '',
    meetupLocation: '',
    meetupTime: '',
  });

  const RECEIVER_NUMBER = "09158203127";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({ ...prev, method }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- AUTOMATIC ADMIN REFLECTION LOGIC ---
    // 1. Get existing applications
    try {
      const storedApps = localStorage.getItem('loanApplications');
      if (storedApps) {
        let apps = JSON.parse(storedApps);
        let matchFound = false;

        // 2. Find matching application (Name & Phone) that is Approved or Pending
        // We update it to 'Paid' automatically so the Admin sees it instantly.
        apps = apps.map((app: any) => {
          if (
            app.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
            app.phone.trim() === formData.phone.trim() &&
            (app.status === 'Approved' || app.status === 'Pending')
          ) {
            matchFound = true;
            return { ...app, status: 'Paid' };
          }
          return app;
        });

        // 3. Save back to storage if a match was updated
        if (matchFound) {
          localStorage.setItem('loanApplications', JSON.stringify(apps));
          
          // --- REAL-TIME BROADCAST ---
          // Notify Admin Panel instantly using BroadcastChannel API
          const syncChannel = new BroadcastChannel('app_sync_channel');
          syncChannel.postMessage({ type: 'PAYMENT_RECEIVED' });
          syncChannel.close();

          console.log("Payment automatically matched, record updated, and admin notified.");
        }
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
    }

    // Simulate redirection for E-wallets
    if (formData.method === 'gcash') {
        window.open('https://m.gcash.com', '_blank');
    } else if (formData.method === 'maya') {
        window.open('https://www.maya.ph', '_blank');
    }

    // Move to success step to show the simulated SMS
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-up">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-blue-dark mb-2">Payment Recorded</h2>
            <p className="text-gray-600 mb-6">We have received your payment details.</p>

            {/* Simulated SMS Notification */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-left mb-8 relative">
              <div className="absolute -top-3 left-4 bg-gray-100 px-2 text-xs font-bold text-gray-500">
                MESSAGE SENT TO {formData.phone}
              </div>
              <p className="text-sm text-gray-800 font-mono">
                "You payed your loan you can now apply for another loan and thank you for choosing ALLOWANCE AID LENDING SERVICES"
              </p>
            </div>

            <button 
              onClick={onBack}
              className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-blue-dark">Pay Your Loan</h2>
            <p className="text-gray-600 mt-2">Settle your balance easily and unlock your next loan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (for SMS)</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  placeholder="09XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay (₱)</label>
              <input 
                type="number" 
                name="amount" 
                required 
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue text-lg font-semibold"
                placeholder="0.00"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleMethodChange('gcash')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition ${formData.method === 'gcash' ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="font-bold text-blue-700">GCash</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMethodChange('maya')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition ${formData.method === 'maya' ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="font-bold text-green-700">Maya</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMethodChange('in_person')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition ${formData.method === 'in_person' ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="font-bold text-gray-700">In Person</span>
                </button>
              </div>
            </div>

            {/* Conditional Fields based on Method */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
              
              {/* E-WALLET LOGIC */}
              {(formData.method === 'gcash' || formData.method === 'maya') && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white rounded border border-gray-200 mb-4">
                    <p className="text-sm text-gray-500 mb-1">Please send payment to:</p>
                    <p className="text-2xl font-bold text-brand-blue-dark tracking-wider">{RECEIVER_NUMBER}</p>
                    <p className="text-xs text-gray-400 mt-1">Receiver: Allowance Aid Admin</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your {formData.method === 'gcash' ? 'GCash' : 'Maya'} Number</label>
                    <input 
                      type="tel" 
                      name="walletNumber" 
                      required 
                      placeholder="09XXXXXXXXX"
                      value={formData.walletNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Note: Clicking Pay will redirect you to the {formData.method === 'gcash' ? 'GCash' : 'Maya'} website/app to complete the transaction.
                  </p>
                </div>
              )}

              {/* IN PERSON LOGIC */}
              {formData.method === 'in_person' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                    <input 
                      type="text" 
                      name="meetupLocation" 
                      required 
                      placeholder="e.g., SSU Main Campus Gate"
                      value={formData.meetupLocation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time & Day</label>
                    <input 
                      type="datetime-local" 
                      name="meetupTime" 
                      required 
                      value={formData.meetupTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onBack}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
              >
                {formData.method === 'in_person' ? 'Schedule Payment' : 'Pay Now'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
