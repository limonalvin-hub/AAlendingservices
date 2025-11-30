
import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface AdminPanelProps {
  onBack: () => void;
}

// Updated interface to match the new Google Sheet structure (Columns as Keys)
interface LoanApplication {
  id: string; 
  timestamp: string;      // "Timestamp"
  status: string;         // "Status"
  fullName: string;       // "Full Name"
  schoolIdNumber: string; // "School ID Number"
  collegeCourse: string;  // "College Course"
  address: string;        // "Address"
  phoneNumber: string;    // "Phone Number"
  emailAddress: string;   // "Email Address"
  loanAmount: string;     // "Loan Amount"
  purposeOfLoan: string;  // "Purpose"
  schoolIdLink: string;   // "School ID Link"
  corLink: string;        // "COR Link"
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  
  // AUTH CONSTANT
  const REQUIRED_EMAIL = "aalendingservices@gmail.com";
  
  // Google Apps Script URL - REPLACE WITH NEW DEPLOYMENT URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9e9Ri1qIrLB4O_AGnkPidok7iXQUc1WqeewNMurr1xAkwu1rzfLbhoRuXU24nVov04w/exec";
  useEffect(() => {
    // Session persistence for refreshing
    const sessionAuth = sessionStorage.getItem('adminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // --- FETCH DATA FROM GOOGLE APPS SCRIPT ---
  const fetchApplications = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        
        if (result.status === "success") {
            // Map the Key-Value Pair data from the new script to our React Interface
            const mappedData: LoanApplication[] = result.data.map((item: any, index: number) => ({
                id: String(index),
                timestamp: item["Timestamp"] || "",
                status: item["Status"] || "Pending",
                fullName: item["Full Name"] || "",
                schoolIdNumber: item["School ID Number"] || "",
                collegeCourse: item["College Course"] || "",
                address: item["Address"] || "",
                phoneNumber: item["Phone Number"] || "",
                emailAddress: item["Email Address"] || "",
                loanAmount: item["Loan Amount"] || "",
                purposeOfLoan: item["Purpose"] || "",
                schoolIdLink: item["School ID Link"] || "",
                corLink: item["COR Link"] || ""
            }));

            setApplications(mappedData.reverse()); // Reverse to show newest first
        } else {
            console.error("API returned error:", result);
        }
    } catch (err) {
        console.error("Failed to fetch applications", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchApplications();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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

  // NOTE: Status updates are handled directly in Google Sheets via the onEdit trigger in the script.
  const handleStatusUpdateAttempt = () => {
      alert("Please update the status directly in the Google Sheet linked to your Script. The changes will reflect here after you refresh.");
      window.open("https://docs.google.com/spreadsheets/u/0/", "_blank");
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1.5";
    // Normalize status string just in case
    const s = (status || 'Pending').trim();
    
    if (s === 'Approved') return <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Approved</span>;
    if (s === 'Rejected') return <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>;
    if (s === 'Paid') return <span className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`}><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Paid</span>;
    
    return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>Pending</span>;
  };

  const filteredApps = filterStatus === 'All' 
    ? applications 
    : applications.filter(app => (app.status || 'Pending') === filterStatus);

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
                     <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                     <span className="text-xs font-medium text-gray-500">Google Sheets Connected</span>
                 </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={fetchApplications} className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
             </button>
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
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{applications.filter(a => (a.status || 'Pending') === 'Pending').length}</p>
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
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Volume</h3>
                    <p className="text-3xl font-bold text-brand-blue mt-1">
                        ₱{applications
                            .reduce((sum, app) => sum + (Number(app.loanAmount) || 0), 0)
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
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                             <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                    Loading data from Google Sheets...
                                </td>
                            </tr>
                        ) : filteredApps.length === 0 ? (
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
                                                {app.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{app.fullName}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span>ID: {app.schoolIdNumber}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{app.timestamp ? new Date(app.timestamp).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                    </svg>
                                                    {app.phoneNumber}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{app.emailAddress}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Loan Details Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">₱{app.loanAmount}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[180px]" title={app.purposeOfLoan}>
                                                {app.purposeOfLoan}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Documents Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-gray-500">COR:</span>
                                                </div>
                                                {app.corLink ? (
                                                  <a 
                                                    href={app.corLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded hover:bg-brand-blue-dark transition"
                                                  >
                                                    View Drive
                                                  </a>
                                                ) : <span className="text-gray-400 italic">No Link</span>}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-gray-500">ID:</span>
                                                </div>
                                                {app.schoolIdLink ? (
                                                  <a 
                                                    href={app.schoolIdLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded hover:bg-brand-blue-dark transition"
                                                  >
                                                    View Drive
                                                  </a>
                                                ) : <span className="text-gray-400 italic">No Link</span>}
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
                                            <button 
                                                onClick={handleStatusUpdateAttempt}
                                                className="text-gray-500 hover:text-brand-blue text-xs font-semibold underline"
                                            >
                                                Manage in Sheets
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
