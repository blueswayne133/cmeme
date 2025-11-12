import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Download, ChevronLeft, ChevronRight, Calendar, DollarSign, User, Wallet, Clock, CheckCircle, XCircle } from "lucide-react";
import api from "../../../utils/api";

const UserTransactions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState({
    total: 0,
    total_amount: 0,
    income: 0,
    expense: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, [id, currentPage, filter]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      const userData = response.data.data?.user || response.data.data;
setUser(userData);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
        type: filter !== 'all' ? filter : undefined
      };
      
      const response = await api.get(`/admin/users/${id}/transactions`, { params });
      setTransactions(response.data.data.transactions?.data || []);
      
      // Update pagination if available
      if (response.data.data.transactions?.current_page) {
        setCurrentPage(response.data.data.transactions.current_page);
      }

      // Calculate stats
      if (response.data.data.transactions?.data) {
        const trans = response.data.data.transactions.data;
        const totalAmount = trans.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
        const income = trans.filter(t => parseFloat(t.amount) > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expense = trans.filter(t => parseFloat(t.amount) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
        
        setStats({
          total: trans.length,
          total_amount: totalAmount,
          income: income,
          expense: expense
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data if API fails
      setTransactions([
        {
          id: 1,
          type: 'mining',
          amount: 1.5,
          description: 'Daily mining reward',
          metadata: { currency: 'CMEME', streak: 5 },
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'transfer',
          amount: -0.5,
          description: 'Transfer to UID789012',
          metadata: { currency: 'CMEME', direction: 'sent', network_fee: 0.1 },
          created_at: '2024-01-14T15:45:00Z'
        },
        {
          id: 3,
          type: 'referral',
          amount: 2.0,
          description: 'Referral reward for user123',
          metadata: { currency: 'CMEME', reward_type: 'referral' },
          created_at: '2024-01-13T09:20:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'mining': return '⛏️';
      case 'transfer': return '↔️';
      case 'referral': return '👥';
      case 'earning': return '💰';
      case 'p2p': return '🔄';
      case 'staking': return '🔒';
      case 'withdrawal': return '📤';
      case 'deposit': return '📥';
      default: return '📊';
    }
  };

  const getTransactionColor = (type, amount) => {
    const isPositive = parseFloat(amount) > 0;
    
    if (isPositive) {
      return 'text-green-400';
    } else {
      return 'text-red-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'mining': return 'bg-yellow-500/20 text-yellow-400';
      case 'transfer': return 'bg-blue-500/20 text-blue-400';
      case 'referral': return 'bg-purple-500/20 text-purple-400';
      case 'earning': return 'bg-green-500/20 text-green-400';
      case 'p2p': return 'bg-orange-500/20 text-orange-400';
      case 'staking': return 'bg-indigo-500/20 text-indigo-400';
      case 'withdrawal': return 'bg-red-500/20 text-red-400';
      case 'deposit': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, metadata = {}) => {
    const currency = metadata.currency || 'CMEME';
    const absAmount = Math.abs(parseFloat(amount));
    const sign = parseFloat(amount) > 0 ? '+' : '-';
    
    return `${sign} ${absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })} ${currency}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || transaction.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(`/admin/users/${id}`)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Transaction History
            </h1>
            <p className="text-gray-400">
              {user ? `Transactions for ${user.username}` : 'Loading user...'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet className="text-blue-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Volume</p>
                <p className="text-white text-2xl font-bold">
                  {stats.total_amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="text-green-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Income</p>
                <p className="text-green-400 text-2xl font-bold">
                  +{stats.income.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Expense</p>
                <p className="text-red-400 text-2xl font-bold">
                  -{stats.expense.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="text-red-400" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="mining">Mining</option>
            <option value="transfer">Transfer</option>
            <option value="referral">Referral</option>
            <option value="earning">Earning</option>
            <option value="p2p">P2P Trade</option>
            <option value="staking">Staking</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/80">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <Wallet size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-lg">No transactions found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            ID: {transaction.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold text-sm ${getTransactionColor(transaction.type, transaction.amount)}`}>
                        {formatAmount(transaction.amount, transaction.metadata)}
                      </p>
                      {transaction.metadata?.network_fee && (
                        <p className="text-gray-400 text-xs">
                          Fee: {transaction.metadata.network_fee} {transaction.metadata.currency}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {formatDate(transaction.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <CheckCircle size={12} className="mr-1" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-300 px-3">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTransactions;