// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Mail, 
  Shield, 
  Trash2, 
  Plus, 
  Eye, 
  LogIn, 
  MoreVertical,
  User,
  ChevronDown,
  ChevronUp,
  Wallet,
  Award,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import api from "../../../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [addBalanceModal, setAddBalanceModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    kyc_verified: 0,
    new_today: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data.users || []);
      setStats(response.data.data.stats || {});
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort users
  const sortedUsers = [...(users || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredUsers = Array.isArray(sortedUsers) ? sortedUsers.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && user.is_verified) ||
                         (filter === 'unverified' && !user.is_verified) ||
                         (filter === 'kyc_pending' && user.kyc_status === 'pending') ||
                         (filter === 'kyc_verified' && user.kyc_status === 'verified') ||
                         (filter === '2fa_enabled' && user.two_factor_enabled) ||
                         (filter === 'phone_verified' && user.phone_verified);
    return matchesSearch && matchesFilter;
  }) : [];

  const handleAction = async (action, user) => {
    try {
      switch (action) {
        case 'verify':
          setSelectedUser(user);
          setVerifyModal(true);
          return;
        case 'delete':
          if (confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
            await api.delete(`/admin/users/${user.id}`);
            fetchUsers();
          }
          break;
        case 'view':
          navigate(`/admin/users/${user.id}`);
          return;
        case 'add_balance':
          setSelectedUser(user);
          setAddBalanceModal(true);
          return;
        case 'send_email':
          setSelectedUser(user);
          setEmailModal(true);
          return;
        case 'impersonate':
          if (confirm(`Login as ${user.username}? You will be redirected to their dashboard.`)) {
            // Note: This would require backend implementation
            alert('Impersonation feature would be implemented here');
          }
          return;
        case 'suspend':
          if (confirm(`Are you sure you want to suspend ${user.username}?`)) {
            // Note: This would require backend implementation
            alert('Suspension feature would be implemented here');
          }
          return;
      }
      setMobileMenuOpen(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleVerifyUser = async () => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/verify`);
      setVerifyModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert('User verified successfully!');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleAddBalance = async (formData) => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/balance`, formData);
      setAddBalanceModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert('Balance added successfully!');
    } catch (error) {
      console.error('Error adding balance:', error);
      alert(error.response?.data?.message || 'Failed to add balance');
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage platform users and permissions</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setAddBalanceModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 flex-1 sm:flex-none"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Balance</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Users</p>
              <p className="text-white text-2xl font-bold">{stats.total || 0}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="text-blue-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Verified</p>
              <p className="text-white text-2xl font-bold">{stats.verified || 0}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="text-green-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">KYC Verified</p>
              <p className="text-white text-2xl font-bold">{stats.kyc_verified || 0}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircle className="text-purple-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">New Today</p>
              <p className="text-white text-2xl font-bold">{stats.new_today || 0}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Plus className="text-orange-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by username, email, phone, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="kyc_pending">KYC Pending</option>
          <option value="kyc_verified">KYC Verified</option>
          <option value="2fa_enabled">2FA Enabled</option>
          <option value="phone_verified">Phone Verified</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/80">
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    User
                    {getSortIcon('username')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Balances
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('is_verified')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('is_verified')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('kyc_status')}
                >
                  <div className="flex items-center gap-2">
                    KYC
                    {getSortIcon('kyc_status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-400 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <User size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-lg">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">{user.username}</p>
                          <p className="text-gray-400 text-sm truncate">{user.email}</p>
                          {user.phone && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Phone size={12} />
                              {user.phone}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs font-mono truncate">{user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Wallet size={14} className="text-yellow-400" />
                          <p className="text-white font-semibold">{formatBalance(user.token_balance)} CMEME</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet size={14} className="text-blue-400" />
                          <p className="text-gray-300 text-sm">${formatBalance(user.usdc_balance)} USDC</p>
                        </div>
                        {user.mining_streak > 0 && (
                          <div className="flex items-center gap-2">
                            <Award size={14} className="text-green-400" />
                            <p className="text-gray-400 text-xs">Streak: {user.mining_streak} days</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_verified 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                        <div className="flex items-center gap-1">
                          {user.two_factor_enabled && (
                            <Shield size={12} className="text-blue-400" />
                          )}
                          {user.phone_verified && (
                            <Phone size={12} className="text-green-400" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        user.kyc_status === 'verified' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : user.kyc_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {user.kyc_status || 'Not Submitted'}
                      </span>
                      {user.kyc_verified_at && (
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(user.kyc_verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">
                        <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleTimeString()}</p>
                        {user.last_login_at && (
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Clock size={10} />
                            Last login: {new Date(user.last_login_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleAction('view', user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('impersonate', user)}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Login as User"
                        >
                          <LogIn size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('add_balance', user)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Add Balance"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('send_email', user)}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleAction('verify', user)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Verify User"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 space-y-4">
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.username}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      {user.phone && (
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Phone size={12} />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMobileMenuOpen(mobileMenuOpen === user.id ? null : user.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {mobileMenuOpen === user.id && (
                      <div className="absolute right-0 top-10 z-10 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2">
                        <button
                          onClick={() => handleAction('view', user)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleAction('impersonate', user)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogIn size={16} />
                          Login as User
                        </button>
                        <button
                          onClick={() => handleAction('add_balance', user)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Balance
                        </button>
                        <button
                          onClick={() => handleAction('send_email', user)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Mail size={16} />
                          Send Email
                        </button>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleAction('verify', user)}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Verify User
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">CMEME Balance</p>
                    <p className="text-white font-semibold">{formatBalance(user.token_balance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">USDC Balance</p>
                    <p className="text-white">${formatBalance(user.usdc_balance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_verified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">KYC</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.kyc_status === 'verified' 
                        ? 'bg-green-500/20 text-green-400'
                        : user.kyc_status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.kyc_status || 'Not Submitted'}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400">Mining Streak</p>
                    <p className="text-white">{user.mining_streak || 0} days</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  {user.two_factor_enabled && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      <Shield size={10} className="mr-1" />
                      2FA
                    </span>
                  )}
                  {user.phone_verified && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <Phone size={10} className="mr-1" />
                      Phone
                    </span>
                  )}
                </div>

                {/* UID */}
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-gray-500 text-xs font-mono truncate">UID: {user.uid}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {addBalanceModal && (
        <AddBalanceModal
          user={selectedUser}
          onClose={() => {
            setAddBalanceModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleAddBalance}
        />
      )}

      {emailModal && (
        <SendEmailModal
          user={selectedUser}
          onClose={() => {
            setEmailModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {verifyModal && (
        <VerifyUserModal
          user={selectedUser}
          onClose={() => {
            setVerifyModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleVerifyUser}
        />
      )}
    </div>
  );
};

// Add Balance Modal Component
const AddBalanceModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'token',
    amount: '',
    operation: 'add',
    reason: '',
    send_email: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const balanceTypes = [
    { value: 'token', label: 'CMEME Tokens', icon: '🪙' },
    { value: 'usdc', label: 'USDC Balance', icon: '💵' },
    { value: 'referral_usdc', label: 'Referral USDC', icon: '👥' },
    { value: 'referral_token', label: 'Referral CMEME', icon: '👥' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add Balance</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <XCircle size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
            <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Balance Type</label>
            <div className="grid grid-cols-2 gap-2">
              {balanceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.value})}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    formData.type === type.value
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-lg mb-1 block">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Operation</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'add', label: 'Add', color: 'green' },
                { value: 'subtract', label: 'Subtract', color: 'red' },
                { value: 'set', label: 'Set', color: 'blue' }
              ].map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setFormData({...formData, operation: op.value})}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    formData.operation === op.value
                      ? `bg-${op.color}-500/20 border-${op.color}-500 text-${op.color}-400`
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500"
              placeholder="Reason for balance adjustment"
              required
            />
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              id="send_email"
              checked={formData.send_email}
              onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="send_email" className="text-sm text-gray-300">
              Send email notification to user
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send Email Modal Component
const SendEmailModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'notification'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implementation for sending email would go here
      alert('Email functionality would be implemented here');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Send Email</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <XCircle size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Recipient</label>
            <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="notification">Notification</option>
              <option value="marketing">Marketing</option>
              <option value="security">Security Alert</option>
              <option value="update">Platform Update</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Email subject"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows="6"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500"
              placeholder="Your message..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Verify User Modal Component
const VerifyUserModal = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Verify User</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <XCircle size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verify User Account</h3>
            <p className="text-gray-400">
              Are you sure you want to verify <span className="text-white font-medium">{user?.username}</span>?
              This will grant them full access to platform features.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-400">UID</p>
                <p className="text-white font-mono text-xs">{user?.uid}</p>
              </div>
              <div>
                <p className="text-gray-400">Joined</p>
                <p className="text-white">{new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">KYC Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user?.kyc_status === 'verified' 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {user?.kyc_status || 'Not Submitted'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Verify User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;