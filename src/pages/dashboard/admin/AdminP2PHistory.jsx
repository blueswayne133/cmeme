import { useState, useEffect } from "react";
import { 
  Search, Filter, Download, Calendar, BarChart3, 
  Users, DollarSign, TrendingUp, FileText,
  Check, X, AlertTriangle, Clock, RefreshCw,
  ChevronLeft, ChevronRight
} from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const AdminP2PHistory = () => {
  const [trades, setTrades] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    payment_method: '',
    date_from: '',
    date_to: '',
    user_search: ''
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTradeHistory();
    } else {
      fetchAnalytics();
    }
  }, [filters, activeTab, pagination.current_page]);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.current_page
      };
      
      const response = await api.get('/admin/p2p/history', { params });
      
      let tradesData = [];
      let paginationData = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      };
      
      if (response.data.data?.trades?.data) {
        tradesData = response.data.data.trades.data;
        paginationData = {
          current_page: response.data.data.trades.current_page || 1,
          last_page: response.data.data.trades.last_page || 1,
          per_page: response.data.data.trades.per_page || 10,
          total: response.data.data.trades.total || 0
        };
      } else if (response.data.data?.trades) {
        tradesData = response.data.data.trades;
      } else if (Array.isArray(response.data.data)) {
        tradesData = response.data.data;
      }
      
      // If we have pagination data from response, use it
      if (response.data.data?.trades?.current_page) {
        setPagination({
          current_page: response.data.data.trades.current_page,
          last_page: response.data.data.trades.last_page,
          per_page: response.data.data.trades.per_page,
          total: response.data.data.trades.total
        });
      }
      
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      toast.error('Failed to fetch trade history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/p2p/analytics');
      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/admin/p2p/export-history', {
        params: filters,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `p2p_trade_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting history:', error);
      toast.error('Failed to export trade history');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      case 'disputed': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={14} />;
      case 'cancelled': return <X size={14} />;
      case 'disputed': return <AlertTriangle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      payment_method: '',
      date_from: '',
      date_to: '',
      user_search: ''
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
        className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
    );
    
    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg transition-colors ${
            pagination.current_page === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < pagination.last_page) {
      if (endPage < pagination.last_page - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={pagination.last_page}
          onClick={() => handlePageChange(pagination.last_page)}
          className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          {pagination.last_page}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
        className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">P2P Trade History & Analytics</h1>
            <p className="text-gray-400 text-sm sm:text-base">View historical trade data and analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <Download size={16} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={activeTab === 'history' ? fetchTradeHistory : fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
            activeTab === 'history'
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Trade History
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
            activeTab === 'analytics'
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'history' ? (
        <>
          {/* Filters */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="sell">Sell Orders</option>
                  <option value="buy">Buy Orders</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
                <select
                  value={filters.payment_method}
                  onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">All Methods</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wise">Wise</option>
                  <option value="paypal">PayPal</option>
                  <option value="revolut">Revolut</option>
                  <option value="payoneer">Payoneer</option>
                  <option value="skrill">Skrill</option>
                  <option value="neteller">Neteller</option>
                  <option value="cashapp">Cash App</option>
                  <option value="zelle">Zelle</option>
                  <option value="venmo">Venmo</option>
                  <option value="usdc">USDC</option>
                  <option value="usdt">USDT</option>
                  <option value="btc">Bitcoin</option>
                  <option value="eth">Ethereum</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-2">Search User</label>
                  <input
                    type="text"
                    value={filters.user_search}
                    onChange={(e) => setFilters(prev => ({ ...prev, user_search: e.target.value }))}
                    placeholder="Username or email"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Trades Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : !Array.isArray(trades) || trades.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Historical Trades Found</h3>
                <p className="text-gray-400">No trades match your current filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <table className="w-full hidden lg:table">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trade ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Parties</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price/Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payment Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {trades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-gray-750 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 font-mono text-sm">#{trade.id}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${trade.type === 'sell' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {trade.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="text-gray-300 text-sm">Seller: {trade.seller?.username}</div>
                              <div className="text-gray-300 text-sm">Buyer: {trade.buyer?.username}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-gray-300 font-medium">{trade.amount} CMEME</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="text-gray-300 text-sm">${trade.price}</div>
                              <div className="text-gray-400 text-xs">${trade.total} total</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                              {getStatusIcon(trade.status)}
                              {trade.status}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-gray-300 text-sm">{trade.payment_method}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-gray-400 text-sm">
                              {trade.completed_at 
                                ? new Date(trade.completed_at).toLocaleDateString()
                                : new Date(trade.created_at).toLocaleDateString()
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4 p-4">
                    {trades.map((trade) => (
                      <div key={trade.id} className="bg-gray-750 rounded-lg p-4 border border-gray-700">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 font-mono text-sm">#{trade.id}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${trade.type === 'sell' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {trade.type}
                              </span>
                            </div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                              {getStatusIcon(trade.status)}
                              {trade.status}
                            </div>
                          </div>

                          {/* Parties */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Seller</p>
                              <p className="text-gray-300 text-sm">{trade.seller?.username}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Buyer</p>
                              <p className="text-gray-300 text-sm">{trade.buyer?.username}</p>
                            </div>
                          </div>

                          {/* Amount and Price */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Amount</p>
                              <p className="text-gray-300 text-sm font-medium">{trade.amount} CMEME</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Price</p>
                              <p className="text-gray-300 text-sm">${trade.price}</p>
                            </div>
                          </div>

                          {/* Total and Payment */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Total</p>
                              <p className="text-gray-300 text-sm font-medium">${trade.total}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Payment Method</p>
                              <p className="text-gray-300 text-sm">{trade.payment_method}</p>
                            </div>
                          </div>

                          {/* Date */}
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Completed</p>
                            <p className="text-gray-300 text-sm">
                              {trade.completed_at 
                                ? new Date(trade.completed_at).toLocaleDateString()
                                : new Date(trade.created_at).toLocaleDateString()
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-700">
                    <div className="text-gray-400 text-sm">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {renderPaginationButtons()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <AnalyticsTab analytics={analytics} loading={loading} />
      )}
    </div>
  );
};

const AnalyticsTab = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Volume (30d)"
          value={`$${analytics.daily_volume?.reduce((sum, day) => sum + (day.volume || 0), 0).toLocaleString() || 0}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Trades (30d)"
          value={analytics.daily_volume?.reduce((sum, day) => sum + (day.trades || 0), 0) || 0}
          icon={BarChart3}
          color="bg-blue-500"
        />
        <StatCard
          title="Avg. Trade Size"
          value={`$${Math.round(analytics.daily_volume?.reduce((sum, day) => sum + (day.volume || 0), 0) / (analytics.daily_volume?.reduce((sum, day) => sum + (day.trades || 0), 0) || 1)).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Traders"
          value={analytics.top_traders?.length || 0}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Trade Type Distribution</h3>
          <div className="space-y-3">
            {analytics.type_distribution?.map((type) => (
              <div key={type.type} className="flex justify-between items-center">
                <span className="text-gray-300 capitalize">{type.type} Orders</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{type.count} trades</span>
                  <span className="text-white font-medium">${(type.volume || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method Distribution</h3>
          <div className="space-y-3">
            {analytics.payment_distribution?.map((method) => (
              <div key={method.payment_method} className="flex justify-between items-center">
                <span className="text-gray-300">{method.payment_method}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{method.count} trades</span>
                  <span className="text-white font-medium">${(method.volume || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Traders */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Traders (by volume)</h3>
        <div className="space-y-3">
          {analytics.top_traders?.map((trader, index) => (
            <div key={trader.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-white font-medium">{trader.username}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">${(trader.trade_volume || 0).toLocaleString()}</div>
                <div className="text-gray-400 text-sm">{trader.trade_count} trades</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Volume Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Volume (Last 30 Days)</h3>
        <div className="space-y-3">
          {analytics.daily_volume?.map((day) => (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{new Date(day.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{day.trades} trades</span>
                <span className="text-white font-medium">${(day.volume || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-2">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export default AdminP2PHistory;