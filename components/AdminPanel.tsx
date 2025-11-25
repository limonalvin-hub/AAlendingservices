
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface AdminPanelProps {
  onBack: () => void;
}

interface LoanApplication {
  id: string; // Firestore Doc ID
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
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // AUTH CONSTANT
  const REQUIRED_EMAIL = "aalendingservices@gmail.com";

  useEffect(() => {
    // Session persistence for refreshing
    const sessionAuth = sessionStorage.getItem('adminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // --- REAL-TIME FIRESTORE LISTENER (Action: Fetch from DB) ---
  useEffect(() => {
    if (isAuthenticated) {
      // Subscribe to the 'applications' collection, ordered by newest first
      const q = query(collection(db, "applications"), orderBy("date", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const apps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LoanApplication[];
        
        setApplications(apps);
      }, (error) => {
        console.error("Error fetching real-time data: ", error);
        alert("Error connecting to database. Please check your config.");
      });

      // Cleanup listener on unmount
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

  const toggleMaintenanceMode = () => {
    const newStatus = !maintenanceMode;
    setMaintenanceMode(newStatus);
    // Note: Maintenance mode is currently local state/storage. 
    // To make this global across users, we would need to save it to Firestore too.
    localStorage.setItem('allowance_aid_maintenance_mode', String(newStatus));
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const appRef = doc(db, "applications", id);
      await updateDoc(appRef, { status: newStatus });
      console.log(`Updated ${id} to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const deleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, "applications", id));
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete application.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300"
                type="submit"
              >
                Access Dashboard
              </button>
            </div>
            <div className="mt-4 text-center">
                <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
                    Back to Website
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-brand-blue-dark">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <span className="text-gray-600 block text-sm font-medium">Logged in as</span>
               <span className="text-xs text-brand-blue font-bold">{REQUIRED_EMAIL}</span>
             </div>
             <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition">
                Logout
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Apps</h3>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{applications.filter(a => a.status === 'Pending').length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Approved</h3>
                <p className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'Approved').length}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Disbursed</h3>
                <p className="text-3xl font-bold text-brand-blue">
                    ₱{applications
                        .filter(a => a.status === 'Approved' || a.status === 'Paid')
                        .reduce((sum, app) => sum + Number(app.loanAmount), 0)
                        .toLocaleString()}
                </p>
            </div>
        </div>

        {/* List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Real-time Applications</h3>
                <div className="flex space-x-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                filterStatus === status 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No applications found in database.
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(app.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                        <div className="text-xs text-gray-500">ID: {app.schoolId}</div>
                                        <div className="text-xs text-gray-400">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">₱{app.loanAmount}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs" title={app.loanPurpose}>{app.loanPurpose}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {app.status === 'Pending' && (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Approved')} 
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Rejected')} 
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {app.status !== 'Pending' && (
                                             <button 
                                                onClick={() => deleteApplication(app.id)} 
                                                className="text-gray-400 hover:text-red-500 text-xs"
                                            >
                                                Delete
                                            </button>
                                        )}
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
