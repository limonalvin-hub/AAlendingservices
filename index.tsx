import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- SERVICE WORKER KILL SWITCH ---
// We aggressively unregister any service workers to prevent stale content caching.
// Wrapped in a safe execution block to prevent "invalid state" errors if the document isn't ready.
const unregisterWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker unregistered to ensure fresh content.');
      }
    } catch (error) {
      console.warn('Service Worker cleanup skipped:', error);
    }
  }
};

// Ensure document is fully loaded before attempting to access SW registrations
if (document.readyState === 'complete') {
  unregisterWorkers();
} else {
  window.addEventListener('load', unregisterWorkers);
}

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