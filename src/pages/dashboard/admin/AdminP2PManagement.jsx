import { useState, useEffect } from "react";
import { 
  Search, Filter, Eye, MessageCircle, FileText, 
  Check, X, AlertTriangle, Clock, User, DollarSign,
  Download, MoreVertical, Ban, Shield, RefreshCw,
  ArrowUpDown, Coins
} from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const AdminP2PManagement = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    payment_method: ''
  });
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    processing: 0,
    completed: 0,
    disputed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchTrades();
    fetchStats();
  }, [filters]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/p2p/trades', { params: filters });
      
      // Handle different response structures
      let tradesData = [];
      
      if (response.data.data?.trades?.data) {
        // Paginated response structure
        tradesData = response.data.data.trades.data;
      } else if (response.data.data?.trades) {
        // Direct trades array in data
        tradesData = response.data.data.trades;
      } else if (Array.isArray(response.data.data)) {
        // Data is direct array
        tradesData = response.data.data;
      } else if (Array.isArray(response.data.trades)) {
        // Alternative structure
        tradesData = response.data.trades;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        tradesData = response.data;
      }
      
      console.log('Fetched trades:', tradesData); // Debug log
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/p2p/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats');
    }
  };

  const handleViewTrade = async (trade) => {
    try {
      const response = await api.get(`/admin/p2p/trades/${trade.id}`);
      setSelectedTrade(response.data.data.trade);
      setShowTradeModal(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
      toast.error('Failed to fetch trade details');
    }
  };

  const handleResolveDispute = async (tradeId, resolution) => {
    try {
      await api.post(`/admin/p2p/disputes/${tradeId}/resolve`, { resolution });
      toast.success('Dispute resolved successfully');
      setShowDisputeModal(false);
      fetchTrades();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const handleCancelTrade = async (tradeId, reason) => {
    if (!confirm('Are you sure you want to cancel this trade?')) return;
    
    try {
      await api.post(`/admin/p2p/trades/${tradeId}/cancel`, { reason });
      toast.success('Trade cancelled successfully');
      fetchTrades();
    } catch (error) {
      console.error('Error cancelling trade:', error);
      toast.error('Failed to cancel trade');
    }
  };

  const handleForceCancelTrade = async (tradeId, reason = "Support cancellation - tokens refunded") => {
    if (!confirm("Are you sure you want to force cancel this trade and refund tokens? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.post(`/admin/p2p/trades/${tradeId}/force-cancel-refund`, { reason });
      toast.success(response.data.message || 'Trade cancelled and tokens refunded successfully');
      fetchTrades();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel trade';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'disputed': return 'text-orange-400 bg-orange-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock size={14} />;
      case 'processing': return <RefreshCw size={14} />;
      case 'completed': return <Check size={14} />;
      case 'disputed': return <AlertTriangle size={14} />;
      case 'cancelled': return <X size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getTradeTypeColor = (type) => {
    return type === 'sell' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">P2P Trade Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Monitor and manage all P2P trades</p>
          </div>
          <button
            onClick={fetchTrades}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Trades" value={stats.total} color="bg-blue-500" />
        <StatCard title="Active" value={stats.active} color="bg-green-500" />
        <StatCard title="Processing" value={stats.processing} color="bg-yellow-500" />
        <StatCard title="Completed" value={stats.completed} color="bg-emerald-500" />
        <StatCard title="Disputed" value={stats.disputed} color="bg-orange-500" />
        <StatCard title="Cancelled" value={stats.cancelled} color="bg-red-500" />
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wise">Wise</option>
              <option value="paypal">PayPal</option>
              <option value="revolut">Revolut</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTrades}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all"
            >
              <Search size={16} />
              Search
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
            <Coins size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Trades Found</h3>
            <p className="text-gray-400">No trades match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trade ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Parties</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price/Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {trades.map((trade) => (
                  <TradeRow 
                    key={trade.id} 
                    trade={trade} 
                    onView={handleViewTrade}
                    onCancel={handleCancelTrade}
                    onForceCancel={handleForceCancelTrade}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getTradeTypeColor={getTradeTypeColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Detail Modal */}
      {showTradeModal && selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedTrade(null);
          }}
          onCancel={handleCancelTrade}
          onForceCancel={handleForceCancelTrade}
          onResolveDispute={handleResolveDispute}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <p className="text-2xl font-bold text-white">{value || 0}</p>
    <div className={`w-8 h-1 ${color} rounded-full mt-2`}></div>
  </div>
);

const TradeRow = ({ trade, onView, onCancel, onForceCancel, getStatusColor, getStatusIcon, getTradeTypeColor }) => {
  const [showActions, setShowActions] = useState(false);

  const canForceCancel = ['active', 'processing'].includes(trade.status);

  return (
    <tr className="hover:bg-gray-750 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-300 font-mono text-sm">#{trade.id}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTradeTypeColor(trade.type)}`}>
            {trade.type}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User size={12} className="text-gray-400" />
            <span className="text-gray-300 text-sm">Seller: {trade.seller?.username || 'Unknown'}</span>
          </div>
          {trade.buyer && (
            <div className="flex items-center gap-2">
              <User size={12} className="text-gray-400" />
              <span className="text-gray-300 text-sm">Buyer: {trade.buyer?.username || 'Unknown'}</span>
            </div>
          )}
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
        <div className="text-gray-400 text-sm">
          {new Date(trade.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(trade)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          
          {/* Force Cancel & Refund Button */}
          {canForceCancel && (
            <button
              onClick={() => onForceCancel(trade.id)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Force Cancel & Refund Tokens"
            >
              <Ban size={14} />
            </button>
          )}
          
          {/* Regular Cancel Button */}
          {trade.status === 'active' && (
            <button
              onClick={() => onCancel(trade.id, 'Admin cancelled')}
              className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              title="Cancel Trade"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const TradeDetailModal = ({ trade, onClose, onCancel, onForceCancel, onResolveDispute }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [resolution, setResolution] = useState('');

  const canForceCancel = ['active', 'processing'].includes(trade.status);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-6xl w-full border border-gray-700 shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Trade Details #{trade.id}</h2>
            <p className="text-gray-400">
              {trade.type.toUpperCase()} • {trade.amount} CMEME • ${trade.total}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-700 bg-gray-800">
            <nav className="p-4 space-y-1">
              {['overview', 'messages', 'proofs', 'dispute', 'actions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && <OverviewTab trade={trade} />}
            {activeTab === 'messages' && <MessagesTab trade={trade} />}
            {activeTab === 'proofs' && <ProofsTab trade={trade} />}
            {activeTab === 'dispute' && <DisputeTab trade={trade} onResolve={onResolveDispute} />}
            {activeTab === 'actions' && (
              <ActionsTab 
                trade={trade} 
                onCancel={onCancel}
                onForceCancel={onForceCancel}
                canForceCancel={canForceCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ trade }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Trade Information</h3>
        <div className="space-y-3">
          <InfoRow label="Trade ID" value={`#${trade.id}`} />
          <InfoRow label="Type" value={trade.type} />
          <InfoRow label="Status" value={trade.status} />
          <InfoRow label="Amount" value={`${trade.amount} CMEME`} />
          <InfoRow label="Price" value={`$${trade.price}`} />
          <InfoRow label="Total" value={`$${trade.total}`} />
          <InfoRow label="Payment Method" value={trade.payment_method} />
          <InfoRow label="Time Limit" value={`${trade.time_limit} minutes`} />
          {trade.expires_at && (
            <InfoRow 
              label="Expires At" 
              value={new Date(trade.expires_at).toLocaleString()} 
            />
          )}
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Parties</h3>
        <div className="space-y-4">
          <UserInfo user={trade.seller} role="Seller" />
          {trade.buyer && <UserInfo user={trade.buyer} role="Buyer" />}
        </div>
      </div>
    </div>

    <div className="bg-gray-700/50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
      <div className="space-y-2">
        <TimelineItem label="Created" date={trade.created_at} />
        {trade.expires_at && <TimelineItem label="Expires" date={trade.expires_at} />}
        {trade.paid_at && <TimelineItem label="Paid" date={trade.paid_at} />}
        {trade.completed_at && <TimelineItem label="Completed" date={trade.completed_at} />}
        {trade.cancelled_at && <TimelineItem label="Cancelled" date={trade.cancelled_at} />}
      </div>
    </div>

    {trade.payment_details && (
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
        <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono bg-gray-800 p-3 rounded-lg">
          {trade.payment_details}
        </pre>
      </div>
    )}

    {trade.cancellation_reason && (
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Cancellation Reason</h3>
        <p className="text-gray-300">{trade.cancellation_reason}</p>
      </div>
    )}
  </div>
);

const MessagesTab = ({ trade }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white mb-4">Trade Messages</h3>
    {trade.messages && trade.messages.length > 0 ? (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {trade.messages.map((message) => (
          <div key={message.id} className={`p-3 rounded-lg ${
            message.is_system 
              ? 'bg-gray-700/50 text-gray-300' 
              : 'bg-blue-600/20 text-blue-200'
          }`}>
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm">
                {message.is_system ? 'System' : message.user?.username}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{message.message}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-center py-8">No messages found</p>
    )}
  </div>
);

const ProofsTab = ({ trade }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white mb-4">Payment Proofs</h3>
    {trade.proofs && trade.proofs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trade.proofs.map((proof) => (
          <div key={proof.id} className="bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={20} className="text-blue-400" />
              <div>
                <p className="text-white font-medium">Payment Proof</p>
                <p className="text-gray-400 text-sm">
                  Uploaded by {proof.uploaded_by === trade.seller_id ? trade.seller?.username : trade.buyer?.username}
                </p>
              </div>
            </div>
            {proof.file_path && (
              <div className="mt-3">
                <img 
                  src={proof.file_path} 
                  alt="Payment proof" 
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(proof.file_path, '_blank')}
                />
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Click to view full size
                </p>
              </div>
            )}
            {proof.description && (
              <p className="text-gray-300 text-sm mt-3">{proof.description}</p>
            )}
            <p className="text-gray-400 text-xs mt-2">
              {new Date(proof.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-center py-8">No payment proofs found</p>
    )}
  </div>
);

const DisputeTab = ({ trade, onResolve }) => {
  const [resolution, setResolution] = useState('');

  if (!trade.dispute) {
    return (
      <div className="text-center py-8">
        <Shield size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">No Dispute</h3>
        <p className="text-gray-400">This trade has no active disputes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-orange-300 mb-3">Active Dispute</h3>
        <div className="space-y-3">
          <InfoRow label="Raised By" value={trade.dispute.raised_by_user?.username} />
          <InfoRow label="Reason" value={trade.dispute.reason} />
          <InfoRow label="Status" value={trade.dispute.status} />
          <InfoRow label="Created" value={new Date(trade.dispute.created_at).toLocaleString()} />
        </div>
      </div>

      {trade.dispute.status === 'open' && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Resolve Dispute</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Resolution</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter your resolution and decision..."
                className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onResolve(trade.id, resolution)}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {trade.dispute.resolution && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Resolution</h3>
          <p className="text-gray-300">{trade.dispute.resolution}</p>
          <p className="text-gray-400 text-sm mt-2">
            Resolved by {trade.dispute.resolved_by_user?.username} on {new Date(trade.dispute.resolved_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

const ActionsTab = ({ trade, onCancel, onForceCancel, canForceCancel }) => {
  const [cancelReason, setCancelReason] = useState('');
  const [forceCancelReason, setForceCancelReason] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
      
      {/* Force Cancel & Refund Section */}
      {canForceCancel && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h4 className="text-md font-semibold text-red-300 mb-3">Force Cancel & Refund Tokens</h4>
          <p className="text-red-200 text-sm mb-4">
            This will cancel the trade and automatically refund CMEME tokens to the rightful owner. 
            Use this when tokens are stuck due to expired trades or non-payment.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Reason for Force Cancellation</label>
              <textarea
                value={forceCancelReason}
                onChange={(e) => setForceCancelReason(e.target.value)}
                placeholder="Enter reason for force cancellation..."
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            <button
              onClick={() => onForceCancel(trade.id, forceCancelReason || "Admin force cancellation - tokens refunded")}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Ban size={16} />
              Force Cancel & Refund Tokens
            </button>
          </div>
        </div>
      )}

      {/* Regular Trade Management */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h4 className="text-md font-semibold text-white mb-3">Trade Management</h4>
        <div className="space-y-3">
          {trade.status === 'active' && (
            <>
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-2">Cancellation Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
              <button
                onClick={() => onCancel(trade.id, cancelReason || "Admin cancelled trade")}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} />
                Cancel Trade
              </button>
            </>
          )}
          
          <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download size={16} />
            Export Trade Data
          </button>

          <button className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
            <FileText size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h4 className="text-md font-semibold text-white mb-3">User Management</h4>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            Contact Seller
          </button>
          {trade.buyer && (
            <button className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
              Contact Buyer
            </button>
          )}
        </div>
      </div>

      {/* Trade Information */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h4 className="text-md font-semibold text-white mb-3">Trade Information</h4>
        <div className="space-y-2 text-sm">
          <InfoRow label="Trade Type" value={trade.type} />
          <InfoRow label="CMEME Amount" value={`${trade.amount} CMEME`} />
          <InfoRow label="Total Value" value={`$${trade.total} USD`} />
          <InfoRow label="Current Status" value={trade.status} />
          {trade.expires_at && (
            <InfoRow 
              label="Time Remaining" 
              value={new Date(trade.expires_at) > new Date() 
                ? `${Math.ceil((new Date(trade.expires_at) - new Date()) / (1000 * 60))} minutes`
                : 'Expired'
              } 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}:</span>
    <span className="text-white text-sm font-medium">{value}</span>
  </div>
);

const UserInfo = ({ user, role }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
      {user?.username?.charAt(0).toUpperCase() || '?'}
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{user?.username || 'Unknown'}</p>
      <p className="text-gray-400 text-sm">{role}</p>
      <p className="text-gray-400 text-xs">
        Success: {user?.p2p_success_rate || 100}% • Trades: {user?.p2p_completed_trades || 0}
      </p>
    </div>
  </div>
);

const TimelineItem = ({ label, date }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    <span className="text-gray-300 text-sm">{label}</span>
    <span className="text-gray-400 text-sm ml-auto">
      {new Date(date).toLocaleString()}
    </span>
  </div>
);

export default AdminP2PManagement;