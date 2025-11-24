
import React, { useEffect, useState, useCallback } from 'react';

interface MaintenancePageProps {
  onRefresh: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRefresh }) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden relative animate-fade-in">
        
        {/* Brand Accent Line */}
        <div className="h-2 bg-gradient-to-r from-brand-blue to-brand-green w-full"></div>
        
        <div className="p-8 md:p-10 text-center">
          
          {/* Custom Vector Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-sm opacity-70 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100 rounded-full mix-blend-multiply filter blur-sm opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Main Icon (Server/Gears) */}
                <svg className="relative w-full h-full text-brand-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-blue-dark mb-3">
            We are upgrading Allowance Aid.
          </h1>

          {/* Sub-headline */}
          <h2 className="text-lg font-semibold text-brand-green mb-4">
            Hang tight! Our system is currently undergoing scheduled maintenance to improve your lending experience.
          </h2>

          {/* Body Paragraph */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            To ensure your data and loan records remain safe, we have temporarily paused access to the Student Dashboard. We will be back online shortly.
          </p>

          {/* Status Indicator */}
          <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-8 border border-gray-200 shadow-sm">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-blue"></span>
            </span>
            <span className="text-sm font-medium text-gray-700 tracking-wide uppercase">System Status: Updating...</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 w-full max-w-xs mx-auto">
             <button 
                onClick={onRefresh}
                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
             >
                Check Status
             </button>
             
             <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-white border-2 border-brand-blue text-brand-blue hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition duration-300 text-center"
             >
                Visit Facebook Page
             </a>
          </div>

        </div>

        {/* Footer/Contact Section */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
            <p className="text-gray-600 text-sm font-medium">Need urgent assistance regarding a loan?</p>
            <p className="text-gray-500 text-sm mt-1">
                Email us at: <a href="mailto:aalendingservices@gmail.com" className="text-brand-blue hover:underline">aalendingservices@gmail.com</a>
            </p>
            <p className="text-gray-500 text-sm mt-1">
                Or visit our <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">Facebook Page</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
