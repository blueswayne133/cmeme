import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Users,   BarChart3, Shield, Settings, Wallet, FileText, AlertTriangle, CheckCircle, Trophy, Key, Eye, EyeOff } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match', {
        duration: 4000,
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters', {
        duration: 4000,
      });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await api.post('/admin/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });

      if (response.data.status === 'success') {
        toast.success('Password changed successfully!', {
          icon: '🔒',
          duration: 4000,
        });
        setShowPasswordModal(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password', {
        duration: 4000,
      });
    } finally {
      setChangingPassword(false);
    }
  };

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/top-users', label: 'Top Users', icon: Trophy },
  { path: '/admin/referrals', label: 'Referral Management', icon: Users },
  { path: '/admin/kyc', label: 'KYC Verifications', icon: Shield },
  { path: '/admin/tasks', label: 'Task Management', icon: CheckCircle },
  { path: '/admin/deposits', label: 'Deposit Requests', icon: Wallet },
  { path: '/admin/transactions', label: 'Transactions', icon: FileText },
  { path: '/admin/p2p-history', label: 'P2P History', icon: FileText },
  { path: '/admin/p2p', label: 'Manage p2p', icon: BarChart3  },
  { path: '/admin/settings', label: 'Wallet Settings', icon: Settings },
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
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{adminData?.name || 'Admin'}</h3>
                <p className="text-sm text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-medium"
            >
              <Key size={16} />
              <span>Change Password</span>
            </button>
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
              
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {adminData?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{adminData?.name || 'Admin'}</h3>
                    <p className="text-sm text-gray-400">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-medium"
                >
                  <Key size={16} />
                  <span>Change Password</span>
                </button>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Key size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Change Password</h3>
                  <p className="text-gray-400 text-sm">Update your admin account password</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                  });
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                    className="w-full px-4 py-3 pr-10 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-10 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-1">Must be at least 8 characters long</p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-10 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordData.new_password && passwordData.new_password_confirmation && 
                 passwordData.new_password !== passwordData.new_password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      new_password_confirmation: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword || passwordData.new_password !== passwordData.new_password_confirmation || passwordData.new_password.length < 8}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;