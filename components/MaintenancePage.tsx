
import React, { useEffect, useState } from 'react';

interface MaintenancePageProps {
  onRefresh: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRefresh }) => {
  const [dots, setDots] = useState('');

  // --- AUTO-RECOVERY LOGIC ---
  // The architecture requires this component to self-monitor the system status
  // and trigger a hard reload when the Admin turns maintenance OFF.
  useEffect(() => {
    const checkRecoveryStatus = () => {
        const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
        
        // If Maintenance is OFF, trigger Hard Reload
        if (!maintenanceActive) {
            // Cache busting param 't' ensures browser gets fresh assets
            window.location.href = '/?status=active&t=' + Date.now();
        }
    };

    // Poll frequently for quick recovery
    const interval = setInterval(checkRecoveryStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Visual Animation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in border-t-4 border-yellow-500">
        
        {/* Icon */}
        <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">System Under Maintenance</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Allowance Aid is currently being updated to serve you better. 
          Access is temporarily unavailable. We will automatically reconnect you shortly{dots}
        </p>

        {/* Actions */}
        <button 
          onClick={onRefresh}
          className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Manual Refresh
        </button>

        {/* Footer - Strict No Navigation Policy */}
        <div className="mt-8 text-sm text-gray-400">
          <p>&copy; Allowance Aid Lending Services</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
