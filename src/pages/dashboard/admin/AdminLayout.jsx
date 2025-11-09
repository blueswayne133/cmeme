import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Users,   BarChart3, Shield, Settings, Wallet, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import api from "../../../utils/api";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const admin = JSON.parse(localStorage.getItem('adminData'));
    
    if (!token || !admin) {
      navigate('/admin/login');
      return;
    }
    
    setAdminData(admin);
    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    }
  };

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/referrals', label: 'Referral Management', icon: Users },
  { path: '/admin/kyc', label: 'KYC Verifications', icon: Shield },
  { path: '/admin/tasks', label: 'Task Management', icon: CheckCircle },
  { path: '/admin/deposits', label: 'Deposit Requests', icon: Wallet },
  { path: '/admin/transactions', label: 'Transactions', icon: FileText },
  { path: '/admin/p2p-history', label: 'P2P History', icon: FileText },
  { path: '/admin/p2p', label: 'Manage p2p', icon: BarChart3  },
  { path: '/admin/settings', label: 'Wallet Settings', icon: Settings }, // Updated this line
];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          active
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-800/50"
        }`}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-gray-700/50">
        <div className="flex flex-col h-full bg-gray-800 text-gray-200 overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm">CMEME Platform</p>
          </div>

          {/* Profile */}
          <div className="px-6 py-4 space-y-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {adminData?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{adminData?.name || 'Admin'}</h3>
                <p className="text-sm text-gray-400">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {adminNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          {/* Logout */}
          <div className="p-4 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 w-80 h-full z-50 lg:hidden shadow-2xl">
            <div className="flex flex-col h-full bg-gray-800 text-gray-200 overflow-y-auto">
              <div className="flex justify-end p-4 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Same content as desktop sidebar */}
              <div className="px-6 py-4 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {adminData?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{adminData?.name || 'Admin'}</h3>
                    <p className="text-sm text-gray-400">Administrator</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {adminNavItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>

              <div className="p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                <Menu size={24} className="text-gray-200" />
              </button>
              <h1 className="text-xl font-bold text-white">
                {adminNavItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;