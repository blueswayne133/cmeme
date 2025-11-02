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
  Clock,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  DollarSign
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
  const [exportLoading, setExportLoading] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page, searchTerm, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        search: searchTerm,
        status: filter !== 'all' ? filter : undefined
      };
      
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data.users || []);
      setStats(response.data.data.stats || {});
      setPagination(response.data.data.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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
            await api.post(`/admin/users/${user.id}/suspend`);
            fetchUsers();
            alert('User suspended successfully');
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
      // Transform data to match backend expectations
      const requestData = {
        currency: formData.currency, // 'token' or 'usdc'
        amount: parseFloat(formData.amount),
        type: formData.type, // 'add' or 'subtract'
        note: formData.note || 'Admin balance adjustment'
      };

      console.log('Sending balance update request:', {
        userId: selectedUser.id,
        data: requestData
      });

      const response = await api.post(`/admin/users/${selectedUser.id}/balance`, requestData);
      
      console.log('Balance update response:', response.data);
      
      setAddBalanceModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert('Balance updated successfully!');
    } catch (error) {
      console.error('Error adding balance:', error);
      console.error('Error response:', error.response);
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update balance';
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExportUsers = async () => {
    try {
      setExportLoading(true);
      const response = await api.get('/admin/users/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    } finally {
      setExportLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.last_page;
    const currentPage = pagination.current_page;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage platform users and permissions</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportUsers}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex-1 sm:flex-none text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setAddBalanceModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 flex-1 sm:flex-none text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Balance</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-xs sm:text-sm font-medium">Total Users</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.total || 0}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="text-blue-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-xs sm:text-sm font-medium">Verified</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.verified || 0}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="text-green-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-xs sm:text-sm font-medium">KYC Verified</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.kyc_verified || 0}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircle className="text-purple-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-xs sm:text-sm font-medium">New Today</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.new_today || 0}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Plus className="text-orange-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by username, email, phone, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm sm:text-base"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm sm:text-base"
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
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    User
                    {getSortIcon('username')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Balances
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('is_verified')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('is_verified')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('kyc_status')}
                >
                  <div className="flex items-center gap-2">
                    KYC
                    {getSortIcon('kyc_status')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate text-sm sm:text-base">{user.username}</p>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{user.email}</p>
                          {user.phone && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Phone size={10} />
                              {user.phone}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs font-mono truncate">{user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign size={12} className="text-yellow-400" />
                          <p className="text-white font-semibold text-sm">{formatBalance(user.token_balance)} CMEME</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={12} className="text-blue-400" />
                          <p className="text-gray-300 text-xs">${formatBalance(user.usdc_balance)} USDC</p>
                        </div>
                        {user.mining_streak > 0 && (
                          <div className="flex items-center gap-2">
                            <Award size={12} className="text-green-400" />
                            <p className="text-gray-400 text-xs">Streak: {user.mining_streak} days</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1 sm:space-y-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_verified 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                        <div className="flex items-center gap-1">
                          {user.two_factor_enabled && (
                            <Shield size={10} className="text-blue-400" />
                          )}
                          {user.phone_verified && (
                            <Phone size={10} className="text-green-400" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
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
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-gray-300">
                        <p className="font-medium text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleTimeString()}</p>
                        {user.last_login_at && (
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Clock size={8} />
                            Last login: {new Date(user.last_login_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleAction('view', user)}
                          className="p-1 sm:p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleAction('impersonate', user)}
                          className="p-1 sm:p-2 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Login as User"
                        >
                          <LogIn size={14} />
                        </button>
                        <button
                          onClick={() => handleAction('add_balance', user)}
                          className="p-1 sm:p-2 text-green-400 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Add Balance"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleAction('send_email', user)}
                          className="p-1 sm:p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Send Email"
                        >
                          <Mail size={14} />
                        </button>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleAction('verify', user)}
                            className="p-1 sm:p-2 text-green-400 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Verify User"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="p-1 sm:p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
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
        <div className="lg:hidden space-y-3 p-3 sm:p-4">
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
              <div key={user.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 sm:p-4 space-y-3">
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{user.username}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                      {user.phone && (
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Phone size={10} />
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
                      <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 min-w-[140px]">
                        <button
                          onClick={() => handleAction('view', user)}
                          className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-blue-500/20 flex items-center gap-2"
                        >
                          <Eye size={12} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleAction('impersonate', user)}
                          className="w-full px-3 py-2 text-left text-xs text-purple-400 hover:bg-purple-500/20 flex items-center gap-2"
                        >
                          <LogIn size={12} />
                          Login as User
                        </button>
                        <button
                          onClick={() => handleAction('add_balance', user)}
                          className="w-full px-3 py-2 text-left text-xs text-green-400 hover:bg-green-500/20 flex items-center gap-2"
                        >
                          <Plus size={12} />
                          Add Balance
                        </button>
                        <button
                          onClick={() => handleAction('send_email', user)}
                          className="w-full px-3 py-2 text-left text-xs text-yellow-400 hover:bg-yellow-500/20 flex items-center gap-2"
                        >
                          <Mail size={12} />
                          Send Email
                        </button>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleAction('verify', user)}
                            className="w-full px-3 py-2 text-left text-xs text-green-400 hover:bg-green-500/20 flex items-center gap-2"
                          >
                            <CheckCircle size={12} />
                            Verify User
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                        >
                          <Trash2 size={12} />
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Balance</p>
                    <p className="text-white font-semibold">{formatBalance(user.token_balance)} CMEME</p>
                    <p className="text-gray-300">${formatBalance(user.usdc_balance)} USDC</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.is_verified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">KYC</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.kyc_status === 'verified' 
                        ? 'bg-green-500/20 text-green-400'
                        : user.kyc_status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.kyc_status || 'Not Submitted'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {user.mining_streak > 0 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                    <Award size={10} />
                    Mining streak: {user.mining_streak} days
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} users
            </div>
            
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  className={`min-w-[40px] px-3 py-2 rounded-lg border transition-all duration-200 ${
                    page === pagination.current_page
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : page === '...'
                      ? 'border-gray-600 text-gray-400 cursor-default'
                      : 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Verify User</h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              Are you sure you want to verify {selectedUser?.username}? This will grant them full access to platform features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setVerifyModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyUser}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm sm:text-base"
              >
                Verify User
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

// Add Balance Modal Component
const AddBalanceModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'token',
    type: 'add',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {formData.type === 'add' ? 'Add' : 'Subtract'} Balance
        </h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          Adjust {formData.currency === 'token' ? 'CMEME Token' : 'USDC'} balance for {user?.username}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="token">CMEME Token</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Operation</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Amount</label>
            <input
              type="number"
              step="0.000001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              placeholder={`Enter ${formData.currency === 'token' ? 'CMEME' : 'USDC'} amount`}
              min="0.000001"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Note (Optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm resize-none"
              placeholder="Reason for this adjustment..."
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm"
            >
              {formData.type === 'add' ? 'Add' : 'Subtract'} Balance
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
    if (!formData.subject || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      // This would integrate with your email service
      alert('Email functionality would be implemented here');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Send Email</h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          Send email to {user?.username} ({user?.email})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Email subject"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="6"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm resize-none"
              placeholder="Your message..."
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm"
            >
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;