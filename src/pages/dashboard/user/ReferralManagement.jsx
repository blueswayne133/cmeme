import { useState, useEffect } from "react";
import { Users, DollarSign, ToggleLeft, ToggleRight, Search, Filter, Download, Eye, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../../utils/api";

const ReferralManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchReferralUsers();
  }, [search, statusFilter]);

  const fetchReferralUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        per_page: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await api.get(`/admin/referrals?${params}`);
      setUsers(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total
      });
    } catch (error) {
      console.error('Error fetching referral users:', error);
      alert('Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUsdcClaiming = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} USDC claiming for this user?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/referrals/user/${userId}/toggle-usdc-claiming`);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, can_claim_referral_usdc: !currentStatus }
          : user
      ));
      
      alert(response.data.message);
    } catch (error) {
      console.error('Error toggling USDC claiming:', error);
      alert(error.response?.data?.message || 'Failed to update USDC claiming status');
    }
  };

  const handleBulkUpdate = async (status) => {
    const selectedUsers = users.filter(user => user.pending_usdc_balance > 0);
    
    if (selectedUsers.length === 0) {
      alert('No users with pending USDC balance found');
      return;
    }

    if (!confirm(`Are you sure you want to ${status ? 'enable' : 'disable'} USDC claiming for ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      const response = await api.post('/admin/referrals/bulk-update-usdc-claiming', {
        user_ids: selectedUsers.map(user => user.id),
        status: status
      });

      await fetchReferralUsers();
      alert(response.data.message);
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert(error.response?.data?.message || 'Failed to bulk update');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Mobile Card View Component
  const MobileUserCard = ({ user }) => {
    const isExpanded = expandedUser === user.id;
    
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-4">
        {/* Card Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
          onClick={() => toggleUserExpansion(user.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{user.username}</h3>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-gray-400 text-xs">Referrals</p>
                  <p className="text-white font-semibold">
                    {user.total_referrals} <span className="text-green-400 text-xs">({user.verified_referrals} verified)</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Pending USDC</p>
                  <p className={`font-bold ${user.pending_usdc_balance > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {formatCurrency(user.pending_usdc_balance)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleUsdcClaiming(user.id, user.can_claim_referral_usdc);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  user.can_claim_referral_usdc
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {user.can_claim_referral_usdc ? 'Enabled' : 'Disabled'}
              </button>
              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-700/50 bg-gray-900/50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Referral Code</p>
                <code className="text-yellow-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                  {user.referral_code}
                </code>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Earned</p>
                <p className="text-white font-semibold">
                  {formatCurrency(user.total_earned_usdc || 0)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {/* View details action */}}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleUsdcClaiming(user.id, user.can_claim_referral_usdc);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  user.can_claim_referral_usdc
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {user.can_claim_referral_usdc ? (
                  <>
                    <ToggleLeft size={14} />
                    Disable
                  </>
                ) : (
                  <>
                    <ToggleRight size={14} />
                    Enable
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop Table Row Component
  const DesktopTableRow = ({ user }) => {
    return (
      <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-white">{user.username}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <code className="bg-gray-900 px-3 py-1 rounded-lg text-yellow-400 text-sm font-mono">
            {user.referral_code}
          </code>
        </td>
        <td className="p-4">
          <div className="flex gap-6">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-white font-semibold">{user.total_referrals}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verified</p>
              <p className="text-green-400 font-semibold">{user.verified_referrals}</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <p className={`text-lg font-bold ${
            user.pending_usdc_balance > 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {formatCurrency(user.pending_usdc_balance)}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Total: {formatCurrency(user.total_earned_usdc || 0)}
          </p>
        </td>
        <td className="p-4">
          <button
            onClick={() => handleToggleUsdcClaiming(user.id, user.can_claim_referral_usdc)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              user.can_claim_referral_usdc
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            {user.can_claim_referral_usdc ? (
              <>
                <ToggleRight size={16} />
                Enabled
              </>
            ) : (
              <>
                <ToggleLeft size={16} />
                Disabled
              </>
            )}
          </button>
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => {/* View details action */}}
              className="p-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 rounded-lg"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Management</h1>
          <p className="text-gray-400">Manage user referrals and USDC claiming</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleBulkUpdate(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ToggleRight size={16} />
            <span className="hidden sm:inline">Enable All</span>
            <span className="sm:hidden">Enable All USDC Claim</span>
          </button>
          <button
            onClick={() => handleBulkUpdate(false)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ToggleLeft size={16} />
            <span className="hidden sm:inline">Disable All</span>
            <span className="sm:hidden">Disable All USDC Claim</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value="">All Status</option>
          <option value="with_pending_usdc">With Pending USDC</option>
          <option value="can_claim">Can Claim USDC</option>
          <option value="cannot_claim">Cannot Claim USDC</option>
        </select>
        
        <button
          onClick={() => fetchReferralUsers()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="text-blue-400" size={20} />
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign className="text-green-400" size={20} />
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Pending USDC</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {formatCurrency(users.reduce((sum, user) => sum + parseFloat(user.pending_usdc_balance || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-green-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <ToggleRight className="text-green-400" size={20} />
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Can Claim</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {users.filter(user => user.can_claim_referral_usdc).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-red-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <ToggleLeft className="text-red-400" size={20} />
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Cannot Claim</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {users.filter(user => !user.can_claim_referral_usdc).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        {users.map((user) => (
          <MobileUserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-medium">User</th>
                <th className="text-left p-4 text-gray-400 font-medium">Referral Code</th>
                <th className="text-left p-4 text-gray-400 font-medium">Referrals</th>
                <th className="text-left p-4 text-gray-400 font-medium">USDC Balance</th>
                <th className="text-left p-4 text-gray-400 font-medium">USDC Claim</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <DesktopTableRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                Showing {users.length} of {pagination.total} users
              </p>
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchReferralUsers(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium min-w-[40px] ${
                      page === pagination.current_page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No users found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;