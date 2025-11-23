import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  onBack: () => void;
}

interface LoanApplication {
  id: string;
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
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    // Check if already logged in this session
    const sessionAuth = sessionStorage.getItem('adminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadApplications();
    }
  }, []);

  const loadApplications = () => {
    const storedApps = localStorage.getItem('loanApplications');
    if (storedApps) {
      setApplications(JSON.parse(storedApps));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded credentials for demo purposes
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      loadApplications();
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    onBack();
  };

  const updateStatus = (id: string, newStatus: 'Pending' | 'Approved' | 'Rejected' | 'Paid') => {
    const updatedApps = applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApps);
    localStorage.setItem('loanApplications', JSON.stringify(updatedApps));
  };

  const deleteApplication = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      const updatedApps = applications.filter(app => app.id !== id);
      setApplications(updatedApps);
      localStorage.setItem('loanApplications', JSON.stringify(updatedApps));
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

  // -- LOGIN SCREEN --
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-blue-dark flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brand-blue-dark">Admin Login</h2>
            <p className="text-gray-600">Allowance Aid Control Panel</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
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
              />
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300"
                type="submit"
              >
                Sign In
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

  // -- DASHBOARD SCREEN --
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-brand-blue-dark">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
             <span className="text-gray-600">Welcome, Admin</span>
             <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition">
                Logout
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Applications</h3>
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
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Disbursed</h3>
                <p className="text-3xl font-bold text-brand-blue">
                    ₱{applications
                        .filter(a => a.status === 'Approved' || a.status === 'Paid')
                        .reduce((sum, app) => sum + Number(app.loanAmount), 0)
                        .toLocaleString()}
                </p>
            </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Loan Applications</h3>
                <div className="flex space-x-2">
                    {['All', 'Pending', 'Approved', 'Rejected', 'Paid'].map(status => (
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No applications found.
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                        <div className="text-sm text-gray-500">{app.schoolId}</div>
                                        <div className="text-xs text-gray-400">{app.course}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">₱{app.loanAmount}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs" title={app.loanPurpose}>{app.loanPurpose}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            via {app.disbursementMethod} 
                                            {app.walletNumber && ` (${app.walletNumber})`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{app.phone}</div>
                                        <div className="text-sm text-gray-500">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1">{new Date(app.date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col space-y-2">
                                            {app.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => updateStatus(app.id, 'Approved')} className="text-green-600 hover:text-green-900 text-left">Approve</button>
                                                    <button onClick={() => updateStatus(app.id, 'Rejected')} className="text-red-600 hover:text-red-900 text-left">Reject</button>
                                                </>
                                            )}
                                            {app.status === 'Approved' && (
                                                <button onClick={() => updateStatus(app.id, 'Paid')} className="text-blue-600 hover:text-blue-900 text-left">Mark Paid</button>
                                            )}
                                            <button onClick={() => deleteApplication(app.id)} className="text-gray-400 hover:text-gray-600 text-left">Delete</button>
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