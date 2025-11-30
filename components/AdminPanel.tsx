import React, { useState, useEffect, useRef } from 'react';
import { db, collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from '../firebaseConfig';
import emailjs from '@emailjs/browser';

interface AdminPanelProps {
  onBack: () => void;
}

interface LoanApplication {
  id: string; // Firestore Document ID
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  name: string;
  schoolId: string;
  course: string;
  address: string;
  phone: string;
  email: string;
  loanPurpose: string;
  loanAmount: string;
  disbursementMethod: string;
  walletNumber: string;
  corFileName: string;
  schoolIdFileName: string;
  signature?: string; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [newArrival, setNewArrival] = useState(false);
  
  // Ref to track previous count for notification logic
  const prevCountRef = useRef(0);

  // AUTH CONSTANT
  const REQUIRED_EMAIL = "aalendingservices@gmail.com";

  // EMAILJS CONFIG
  const EMAILJS_SERVICE_ID = 'service_s8z8tr4';
  const EMAILJS_TEMPLATE_ID = 'template_ho8kor7';
  const EMAILJS_PUBLIC_KEY = 'Qs4emMBTdTNhLwKzR';

  useEffect(() => {
    // Session persistence for refreshing
    const sessionAuth = sessionStorage.getItem('adminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // --- FIRESTORE LISTENER (Real-Time Fetch) ---
  useEffect(() => {
    if (isAuthenticated) {
      // Create a query against the collection.
      const q = query(collection(db, "applications"), orderBy("date", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const apps: LoanApplication[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as LoanApplication));
        
        setApplications(prevApps => {
           // Check for new arrivals (Logic: count increased)
           if (apps.length > prevApps.length && prevApps.length > 0) {
               setNewArrival(true);
               setTimeout(() => setNewArrival(false), 3000);
           }
           return apps;
        });

        prevCountRef.current = apps.length;
      }, (error) => {
        console.error("Error fetching applications: ", error);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Gatekeeper: Requires specific email
    if (email.trim().toLowerCase() === REQUIRED_EMAIL.toLowerCase() && password.length > 0) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError(`Access Denied. You must use the master email: ${REQUIRED_EMAIL}`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    onBack();
  };

  const updateStatus = async (id: string, newStatus: any, applicantEmail?: string, applicantName?: string, loanAmount?: string) => {
    try {
       const appRef = doc(db, "applications", id);
       await updateDoc(appRef, {
         status: newStatus
       });
       
       console.log(`Updated ${id} to ${newStatus}`);

       // --- SEND AUTOMATED EMAIL NOTIFICATION ---
       if (applicantEmail && applicantName && (newStatus === 'Approved' || newStatus === 'Rejected')) {
          let messageBody = "";
          
          if (newStatus === 'Approved') {
            messageBody = `Congratulations! Your loan application for ₱${loanAmount} has been APPROVED. The funds will be disbursed to your chosen account shortly. Please ensure your lines are open for verification.`;
          } else {
            messageBody = `We regret to inform you that your loan application has been declined at this time after our review process. You may try applying again in the future.`;
          }

          const emailParams = {
            user_name: applicantName,
            user_email: applicantEmail,
            message: messageBody,
            loan_amount: loanAmount,
            status_message: messageBody 
          };

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            emailParams,
            EMAILJS_PUBLIC_KEY
          );
          alert(`Status updated to ${newStatus} and email notification sent to ${applicantEmail}.`);
       } else {
          // alert(`Status updated to ${newStatus}.`); 
          // Removed alert for smoother UX on simple updates
       }

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const deleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, "applications", id));
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete application.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1.5";
    switch (status) {
      case 'Approved': 
        return <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Approved</span>;
      case 'Rejected': 
        return <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>;
      case 'Paid': 
        return <span className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`}><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Paid</span>;
      default: 
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>Pending</span>;
    }
  };

  const filteredApps = filterStatus === 'All' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-blue-dark flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-blue-dark">Admin Portal</h2>
            <p className="text-gray-600">Secure Access Restricted</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******************"
                required
              />
              {error && <p className="text-red-500 text-xs italic bg-red-50 p-2 rounded border border-red-200 mt-2">{error}</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 shadow-md"
                type="submit"
              >
                Access Dashboard
              </button>
            </div>
            <div className="mt-4 text-center">
                <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 underline">
                    Back to Website
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-brand-blue rounded-md flex items-center justify-center text-white font-bold text-lg">A</div>
            <div>
                 <h1 className="text-2xl font-bold text-brand-blue-dark leading-none">Admin Dashboard</h1>
                 <div className="flex items-center mt-1">
                     <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                     <span className="text-xs font-medium text-gray-500">Firestore Live Sync</span>
                 </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <span className="text-gray-500 block text-xs">Logged in as</span>
               <span className="text-sm text-gray-900 font-semibold">{REQUIRED_EMAIL}</span>
             </div>
             <button onClick={handleLogout} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition text-sm">
                Sign Out
             </button>
          </div>
        </div>
      </header>

      {/* New Application Notification */}
      {newArrival && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white py-2 px-6 rounded-full shadow-xl z-50 animate-fade-in flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span className="font-medium">New application received!</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Apps</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{applications.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{applications.filter(a => a.status === 'Pending').length}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Approved</h3>
                    <p className="text-3xl font-bold text-green-600 mt-1">{applications.filter(a => a.status === 'Approved').length}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
             <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Disbursed</h3>
                    <p className="text-3xl font-bold text-brand-blue mt-1">
                        ₱{applications
                            .filter(a => a.status === 'Approved' || a.status === 'Paid')
                            .reduce((sum, app) => sum + Number(app.loanAmount), 0)
                            .toLocaleString()}
                    </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full text-brand-blue">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        </div>

        {/* Application List Container */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            
            {/* Header & Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Application Management
                </h3>
                <div className="flex bg-white rounded-md shadow-sm p-1 border border-gray-200 overflow-x-auto">
                    {['All', 'Pending', 'Approved', 'Rejected', 'Paid'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                filterStatus === status 
                                ? 'bg-brand-blue text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loan Details</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-900">No applications found</p>
                                        <p className="text-sm text-gray-500">Try adjusting your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                                    {/* Applicant Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-brand-blue to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {app.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{app.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span>ID: {app.schoolId}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{new Date(app.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{app.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Loan Details Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">₱{app.loanAmount}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[180px]" title={app.loanPurpose}>
                                                {app.loanPurpose}
                                            </span>
                                            <span className="text-xs text-brand-blue font-medium mt-1 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                                                {app.disbursementMethod === 'gcash' ? 'GCash' : app.disbursementMethod === 'maya' ? 'Maya' : 'In Person'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Documents Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                <span className="truncate max-w-[120px]" title={app.corFileName}>COR: {app.corFileName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .667.333 1 1 1v1m0-1h2" /></svg>
                                                <span className="truncate max-w-[120px]" title={app.schoolIdFileName}>ID: {app.schoolIdFileName}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(app.status)}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {app.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => updateStatus(app.id, 'Approved', app.email, app.name, app.loanAmount)} 
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 border border-green-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(app.id, 'Rejected', app.email, app.name, app.loanAmount)} 
                                                        className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => deleteApplication(app.id)} 
                                                className="p-1.5 bg-gray-50 text-gray-400 rounded-md hover:bg-gray-100 hover:text-red-500 border border-transparent hover:border-gray-200 transition-colors"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
