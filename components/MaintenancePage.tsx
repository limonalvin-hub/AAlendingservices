
import React, { useEffect, useState, useCallback } from 'react';

interface MaintenancePageProps {
  onRefresh: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRefresh }) => {
  const [dots, setDots] = useState('');

  // --- LOGIC: AUTO-RECOVERY PROTOCOL ---
  const checkRecoveryStatus = useCallback(() => {
    // 1. Check Source of Truth
    const maintenanceActive = localStorage.getItem('allowance_aid_maintenance_mode') === 'true';
    
    // 2. If Maintenance is OFF, Initiate Recovery
    if (!maintenanceActive) {
        console.log("System Status: ONLINE. Executing Recovery...");

        // 3. Service Worker Cleanup (Force Update)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    registration.update();
                }
            });
        }
        
        // 4. CACHE BUSTING REDIRECT
        // We add a timestamp query param to force the browser to treat this as a fresh request.
        // This defeats the aggressive caching of Facebook/Instagram in-app browsers.
        const recoveryUrl = '/?status=restored&t=' + Date.now();
        
        // 5. Execute
        window.location.href = recoveryUrl;
    }
  }, []);

  // --- LISTENERS ---
  useEffect(() => {
    // 1. Heartbeat (Poll every 1s)
    const interval = setInterval(checkRecoveryStatus, 1000);

    // 2. Storage Sync (If tab is backgrounded but another tab updates)
    window.addEventListener('storage', checkRecoveryStatus);

    // 3. Visibility Wake-Up (Critical for Mobile)
    // If user locks phone while on this screen, then unlocks it later,
    // this fires immediately to check if we can let them back in.
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            checkRecoveryStatus();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', checkRecoveryStatus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkRecoveryStatus]);

  // Visual Animation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in border-t-4 border-brand-blue-dark">
        
        {/* Animated Icon */}
        <div className="mb-6 flex justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
                <div className="relative h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-brand-blue-dark mb-2">System Maintenance</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          The Allowance Aid system is currently undergoing scheduled maintenance. Access is temporarily restricted.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-brand-blue font-semibold flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Live Status: Monitoring{dots}
            </p>
            <p className="text-xs text-blue-600 mt-1">
                You will be automatically redirected as soon as we are back online.
            </p>
        </div>

        {/* Actions (Manual Fallback) */}
        <button 
          onClick={onRefresh}
          className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition duration-300 w-full flex items-center justify-center gap-2 text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Manual Refresh
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage;
