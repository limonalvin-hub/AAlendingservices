import React, { useState, useEffect } from 'react';

interface MaintenancePageProps {
  onRefresh: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimeStr = localStorage.getItem('maintenance_end_time');
      if (!endTimeStr) return null;

      const endTime = parseInt(endTimeStr, 10);
      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        return "Finishing up...";
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Pad with leading zeros
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      return `${h}:${m}:${s}`;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in border-t-4 border-yellow-500">
        
        {/* Icon */}
        <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">System Under Maintenance</h1>
        
        {timeLeft ? (
          <div className="mb-6">
            <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">Estimated Time Remaining</p>
            <div className="text-4xl font-mono font-bold text-brand-blue-dark">
              {timeLeft}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-6 italic">We expect to be back shortly.</p>
        )}

        <p className="text-gray-600 mb-8 leading-relaxed">
          Allowance Aid is currently being updated to serve you better. 
          Access is temporarily unavailable to prevent data conflicts.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
            <button 
            onClick={onRefresh}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
            </button>
            
            <a 
              href="mailto:aalendingservices@gmail.com?subject=Support%20Request%20During%20Maintenance&body=I%20am%20experiencing%20issues%20accessing%20the%20Allowance%20Aid%20application."
              className="bg-white border-2 border-gray-200 hover:border-brand-blue text-gray-700 hover:text-brand-blue font-semibold py-3 px-6 rounded-lg transition duration-300 w-full flex items-center justify-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
               Contact Support
            </a>
        </div>

        {/* Footer - Strict No Navigation Policy */}
        <div className="mt-8 text-sm text-gray-400">
          <p>&copy; Allowance Aid Lending Services</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;