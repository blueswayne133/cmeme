// src/pages/admin/TransactionManagement.jsx
import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Calendar, DollarSign, Users, TrendingUp, ArrowUpDown } from "lucide-react";
import api from "../../../utils/api";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    currency: 'all',
    dateRange: 'all'
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/transactions/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id?.toString().includes(searchTerm) ||
      transaction.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
    const matchesCurrency = filters.currency === 'all' || 
      (transaction.metadata?.currency === filters.currency) ||
      (filters.currency === 'CMEME' && !transaction.metadata?.currency) ||
      (filters.currency === 'USDC' && transaction.metadata?.currency === 'USDC');

    return matchesSearch && matchesType && matchesStatus && matchesCurrency;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleAction = async (action, transaction) => {
    try {
      switch (action) {
        case 'verify':
          await api.post(`/admin/transactions/${transaction.id}/verify`);
          break;
        case 'view':
          setSelectedTransaction(transaction);
          setDetailModal(true);
          return;
        case 'reject':
          if (confirm('Are you sure you want to reject this transaction?')) {
            await api.post(`/admin/transactions/${transaction.id}/reject`);
          }
          return;
      }
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Description', 'Date'];
    const csvData = filteredTransactions.map(tx => [
      tx.id,
      tx.user?.username || 'N/A',
      tx.type,
      tx.amount,
      tx.metadata?.currency || 'CMEME',
      tx.status || 'completed',
      tx.description,
      new Date(tx.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'mining': return 'bg-purple-500/20 text-purple-400';
      case 'referral': return 'bg-indigo-500/20 text-indigo-400';
      case 'p2p': return 'bg-orange-500/20 text-orange-400';
      case 'transfer': return 'bg-blue-500/20 text-blue-400';
      case 'earning': return 'bg-green-500/20 text-green-400';
      case 'withdrawal': return 'bg-red-500/20 text-red-400';
      case 'deposit': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mining': return '⛏️';
      case 'referral': return '👥';
      case 'p2p': return '🔄';
      case 'transfer': return '↗️';
      case 'earning': return '💰';
      case 'withdrawal': return '📤';
      case 'deposit': return '📥';
      default: return '📊';
    }
  };

  const formatAmount = (amount, currency = 'CMEME') => {
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
    return `${amount > 0 ? '+' : ''}${formattedAmount} ${currency}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Management</h1>
          <p className="text-gray-400">Monitor and manage all platform transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">
                ${stats.totalVolume?.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="text-green-400" size={24} />
          </div>
          <p className="text-green-400 text-sm mt-2">+12% from last month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <TrendingUp className="text-blue-400" size={24} />
          </div>
          <p className="text-blue-400 text-sm mt-2">+8% from last month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {stats.activeUsers?.toLocaleString() || '0'}
              </p>
            </div>
            <Users className="text-purple-400" size={24} />
          </div>
          <p className="text-purple-400 text-sm mt-2">+15 new today</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Actions</p>
              <p className="text-2xl font-bold text-white">
                {stats.pendingActions?.toLocaleString() || '0'}
              </p>
            </div>
            <Calendar className="text-yellow-400" size={24} />
          </div>
          <p className="text-yellow-400 text-sm mt-2">Requires attention</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ID, user, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="mining">Mining</option>
          <option value="referral">Referral</option>
          <option value="p2p">P2P Trade</option>
          <option value="transfer">Transfer</option>
          <option value="earning">Earning</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="deposit">Deposit</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.currency}
          onChange={(e) => setFilters({...filters, currency: e.target.value})}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Currencies</option>
          <option value="CMEME">CMEME</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <ArrowUpDown size={48} className="text-gray-600 mb-2" />
                      <p>No transactions found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-gray-300 text-sm font-mono">#{transaction.id}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {transaction.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{transaction.user?.username || 'N/A'}</p>
                          <p className="text-gray-400 text-xs">{transaction.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatAmount(transaction.amount, transaction.metadata?.currency)}
                        </span>
                        {transaction.metadata?.usd_value && (
                          <span className="text-gray-400 text-xs">
                            ${transaction.metadata.usd_value}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(transaction.created_at).toLocaleDateString()}
                      <br />
                      <span className="text-gray-500">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction('view', transaction)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction('verify', transaction)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleAction('reject', transaction)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="text-gray-400 px-2">...</span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {detailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setDetailModal(false);
            setSelectedTransaction(null);
          }}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

// Transaction Detail Modal Component
const TransactionDetailModal = ({ transaction, onClose, onAction }) => {
  const formatMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return 'No additional data';
    }
    return JSON.stringify(metadata, null, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Transaction Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <XCircle size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="text-white font-mono">#{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} {transaction.metadata?.currency || 'CMEME'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">
                    {new Date(transaction.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white">{transaction.user?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{transaction.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">UID:</span>
                  <span className="text-white font-mono text-sm">{transaction.user?.uid || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">KYC Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.user?.kyc_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                    transaction.user?.kyc_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {transaction.user?.kyc_status || 'Not Submitted'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300 bg-gray-700/50 rounded-lg p-4">
              {transaction.description || 'No description provided'}
            </p>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Additional Data</h3>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {formatMetadata(transaction.metadata)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          {transaction.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  onAction('verify', transaction);
                  onClose();
                }}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Approve Transaction
              </button>
              <button
                onClick={() => {
                  onAction('reject', transaction);
                  onClose();
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Reject Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionManagement;