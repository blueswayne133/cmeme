import { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle, XCircle, Eye, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../../utils/api";

const DepositManagement = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    currency: 'all',
    search: ''
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 20
  });

  useEffect(() => {
    fetchDeposits();
  }, [filters]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.currency !== 'all') params.append('currency', filters.currency);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/deposits?${params}`);
      
      // Handle different response formats
      const responseData = response.data.data || response.data;
      
      if (Array.isArray(responseData)) {
        setDeposits(responseData);
        setPagination({
          current_page: 1,
          total: responseData.length,
          per_page: responseData.length
        });
      } else if (responseData && Array.isArray(responseData.data)) {
        // Laravel paginated response
        setDeposits(responseData.data);
        setPagination({
          current_page: responseData.current_page || 1,
          total: responseData.total || responseData.data.length,
          per_page: responseData.per_page || responseData.data.length
        });
      } else {
        console.error('Unexpected API response format:', responseData);
        setDeposits([]);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId) => {
    try {
      setActionLoading(depositId);
      const response = await api.post(`/admin/deposits/${depositId}/approve`);
      
      if (response.data.status === 'success') {
        // Update local state
        setDeposits(prev => prev.map(deposit => 
          deposit.id === depositId 
            ? { ...deposit, status: 'approved', approved_at: new Date().toISOString() }
            : deposit
        ));
        
        if (detailModalOpen) {
          setSelectedDeposit(prev => ({ ...prev, status: 'approved', approved_at: new Date().toISOString() }));
        }
        
        alert('Deposit approved successfully!');
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
      alert(error.response?.data?.message || 'Failed to approve deposit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (depositId, reason) => {
    const rejectReason = reason || prompt('Please provide a reason for rejection:');
    
    if (!rejectReason) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(depositId);
      const response = await api.post(`/admin/deposits/${depositId}/reject`, { reason: rejectReason });
      
      if (response.data.status === 'success') {
        // Update local state
        setDeposits(prev => prev.map(deposit => 
          deposit.id === depositId 
            ? { ...deposit, status: 'rejected', rejected_at: new Date().toISOString(), admin_notes: rejectReason }
            : deposit
        ));
        
        if (detailModalOpen) {
          setSelectedDeposit(prev => ({ ...prev, status: 'rejected', rejected_at: new Date().toISOString(), admin_notes: rejectReason }));
        }
        
        alert('Deposit rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      alert(error.response?.data?.message || 'Failed to reject deposit');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailModal = (deposit) => {
    setSelectedDeposit(deposit);
    setDetailModalOpen(true);
  };

  const toggleRowExpansion = (depositId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(depositId)) {
      newExpanded.delete(depositId);
    } else {
      newExpanded.add(depositId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'pending': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Amount', 'Currency', 'Status', 'Transaction Hash', 'Date', 'Approved/Rejected At'];
    const csvData = deposits.map(deposit => [
      deposit.id,
      deposit.user?.username || 'N/A',
      deposit.amount,
      deposit.currency,
      deposit.status,
      deposit.transaction_hash,
      new Date(deposit.created_at).toLocaleDateString(),
      deposit.approved_at ? new Date(deposit.approved_at).toLocaleDateString() : 
        deposit.rejected_at ? new Date(deposit.rejected_at).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deposits-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Safe array methods
  const pendingCount = Array.isArray(deposits) ? deposits.filter(d => d.status === 'pending').length : 0;
  const approvedCount = Array.isArray(deposits) ? deposits.filter(d => d.status === 'approved').length : 0;
  const rejectedCount = Array.isArray(deposits) ? deposits.filter(d => d.status === 'rejected').length : 0;

  // Desktop Table Headers
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Transaction Hash</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {Array.isArray(deposits) && deposits.map((deposit) => (
            <tr key={deposit.id} className="hover:bg-gray-750 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="text-white font-medium">{deposit.user?.username || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{deposit.user?.uid || 'N/A'}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-white font-semibold">
                  {formatAmount(deposit.amount, deposit.currency)}
                </p>
              </td>
              <td className="px-6 py-4">
                <code className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-sm font-mono">
                  {deposit.transaction_hash?.slice(0, 10)}...{deposit.transaction_hash?.slice(-8)}
                </code>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                  {getStatusIcon(deposit.status)}
                  {deposit.status?.charAt(0).toUpperCase() + deposit.status?.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-300">
                {formatDate(deposit.created_at)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetailModal(deposit)}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {deposit.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(deposit.id)}
                        disabled={actionLoading === deposit.id}
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve Deposit"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(deposit.id)}
                        disabled={actionLoading === deposit.id}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject Deposit"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileTable = () => (
    <div className="lg:hidden space-y-4">
      {Array.isArray(deposits) && deposits.map((deposit) => (
        <div key={deposit.id} className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
          {/* Main Card Content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">{deposit.user?.username || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{deposit.user?.uid || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                  {getStatusIcon(deposit.status)}
                  {deposit.status?.charAt(0).toUpperCase() + deposit.status?.slice(1)}
                </span>
                <button
                  onClick={() => toggleRowExpansion(deposit.id)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {expandedRows.has(deposit.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-white font-semibold">
                  {formatAmount(deposit.amount, deposit.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Date</p>
                <p className="text-gray-300">{formatDate(deposit.created_at)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDetailModal(deposit)}
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                
                {deposit.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(deposit.id)}
                      disabled={actionLoading === deposit.id}
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Approve Deposit"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(deposit.id)}
                      disabled={actionLoading === deposit.id}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Reject Deposit"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => toggleRowExpansion(deposit.id)}
                className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-1"
              >
                {expandedRows.has(deposit.id) ? 'Less' : 'More'}
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedRows.has(deposit.id) && (
            <div className="border-t border-gray-700 bg-gray-800/50 p-4 space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Transaction Hash</p>
                <code className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-mono break-all">
                  {deposit.transaction_hash}
                </code>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">From Wallet</p>
                  <code className="text-gray-300 text-xs break-all">
                    {deposit.from_wallet_address?.slice(0, 12)}...{deposit.from_wallet_address?.slice(-8)}
                  </code>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">To Wallet</p>
                  <code className="text-gray-300 text-xs break-all">
                    {deposit.to_wallet_address?.slice(0, 12)}...{deposit.to_wallet_address?.slice(-8)}
                  </code>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Network</p>
                <p className="text-gray-300">{deposit.network || 'Base'}</p>
              </div>

              {deposit.approved_at && (
                <div>
                  <p className="text-gray-400 text-sm">Approved At</p>
                  <p className="text-gray-300 text-sm">{formatDateTime(deposit.approved_at)}</p>
                </div>
              )}

              {deposit.rejected_at && (
                <div>
                  <p className="text-gray-400 text-sm">Rejected At</p>
                  <p className="text-gray-300 text-sm">{formatDateTime(deposit.rejected_at)}</p>
                </div>
              )}

              {deposit.admin_notes && (
                <div>
                  <p className="text-gray-400 text-sm">Admin Notes</p>
                  <p className="text-gray-300 text-sm bg-gray-700/30 p-2 rounded">
                    {deposit.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 lg:h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Deposit Management</h1>
        <p className="text-gray-400 text-sm lg:text-base">Review and manage user deposit requests</p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
          <p className="text-gray-400 text-xs lg:text-sm mb-1 lg:mb-2">Total Deposits</p>
          <p className="text-xl lg:text-2xl font-bold text-white">{Array.isArray(deposits) ? deposits.length : 0}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
          <p className="text-gray-400 text-xs lg:text-sm mb-1 lg:mb-2">Pending</p>
          <p className="text-xl lg:text-2xl font-bold text-yellow-400">
            {pendingCount}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
          <p className="text-gray-400 text-xs lg:text-sm mb-1 lg:mb-2">Approved</p>
          <p className="text-xl lg:text-2xl font-bold text-green-400">
            {approvedCount}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
          <p className="text-gray-400 text-xs lg:text-sm mb-1 lg:mb-2">Rejected</p>
          <p className="text-xl lg:text-2xl font-bold text-red-400">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700 mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, transaction hash..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 lg:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 lg:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Currency Filter */}
            <select
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
              className="px-3 lg:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            >
              <option value="all">All Currencies</option>
              <option value="USDC">USDC</option>
              <option value="CMEME">CMEME</option>
            </select>
          </div>

          <button
            onClick={exportToCSV}
            disabled={!Array.isArray(deposits) || deposits.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm lg:text-base mt-4 lg:mt-0"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Deposits Table/Cards */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <DesktopTable />
        
        {/* Mobile Cards */}
        <MobileTable />

        {(!Array.isArray(deposits) || deposits.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400">No deposits found</p>
          </div>
        )}
      </div>

      {/* Deposit Detail Modal */}
      {detailModalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
              <h2 className="text-lg lg:text-xl font-bold text-white">Deposit Details</h2>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white">{selectedDeposit.user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">User ID</p>
                    <p className="text-white">{selectedDeposit.user?.uid || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white break-all">{selectedDeposit.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">KYC Status</p>
                    <p className={`${selectedDeposit.user?.is_verified ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedDeposit.user?.is_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit Details */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Deposit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-white text-lg lg:text-xl font-bold">
                      {formatAmount(selectedDeposit.amount, selectedDeposit.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${getStatusColor(selectedDeposit.status)}`}>
                      {getStatusIcon(selectedDeposit.status)}
                      {selectedDeposit.status?.charAt(0).toUpperCase() + selectedDeposit.status?.slice(1)}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm">Transaction Hash</p>
                    <code className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs lg:text-sm font-mono break-all">
                      {selectedDeposit.transaction_hash}
                    </code>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Network</p>
                    <p className="text-white">{selectedDeposit.network || 'Base'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Currency</p>
                    <p className="text-white">{selectedDeposit.currency}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm">From Wallet</p>
                    <code className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs lg:text-sm font-mono break-all">
                      {selectedDeposit.from_wallet_address}
                    </code>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm">To Wallet</p>
                    <code className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs lg:text-sm font-mono break-all">
                      {selectedDeposit.to_wallet_address}
                    </code>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Submitted</p>
                    <p className="text-white text-sm">{formatDateTime(selectedDeposit.created_at)}</p>
                  </div>
                  {selectedDeposit.approved_at && (
                    <div>
                      <p className="text-gray-400 text-sm">Approved</p>
                      <p className="text-white text-sm">{formatDateTime(selectedDeposit.approved_at)}</p>
                    </div>
                  )}
                  {selectedDeposit.rejected_at && (
                    <div>
                      <p className="text-gray-400 text-sm">Rejected</p>
                      <p className="text-white text-sm">{formatDateTime(selectedDeposit.rejected_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedDeposit.admin_notes && (
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-2">Admin Notes</h3>
                  <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg text-sm">
                    {selectedDeposit.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons for Pending Deposits */}
              {selectedDeposit.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleApprove(selectedDeposit.id)}
                    disabled={actionLoading === selectedDeposit.id}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {actionLoading === selectedDeposit.id ? 'Approving...' : 'Approve Deposit'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedDeposit.id)}
                    disabled={actionLoading === selectedDeposit.id}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {actionLoading === selectedDeposit.id ? 'Rejecting...' : 'Reject Deposit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositManagement;