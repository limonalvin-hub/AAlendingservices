import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- SERVICE WORKER KILL SWITCH ---
// We aggressively unregister any service workers to prevent stale content caching.
const unregisterWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Small delay to ensure document execution context is fully stable
      await new Promise(resolve => setTimeout(resolve, 100));

      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker unregistered to ensure fresh content.');
      }
    } catch (error) {
      // "Invalid state" errors happen during aggressive reloads/redirects and are harmless
      console.warn('Service Worker cleanup skipped:', error);
    }
  }
};

// Robust execution: Wait for load event specifically to avoid 'invalid state' errors
// We replace the immediate check with a strict event listener to be safer
window.addEventListener('load', () => {
  unregisterWorkers();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);