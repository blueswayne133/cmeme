import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, X, Clock, AlertTriangle, Ban, RefreshCw, FileText } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const P2PHistoryPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { userData } = useOutletContext();

  useEffect(() => {
    if (userData?.id) {
      fetchTradeHistory();
      
      // Set up polling for updates
      const interval = setInterval(() => {
        fetchTradeHistory();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [filter, userData]);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      
      if (!userData?.id) {
        return;
      }

      const response = await api.get('/p2p/trades/user', {
        params: filter === 'all' ? {} : { status: filter }
      });
      
      // Handle different response structures
      let userTrades = [];
      
      if (response.data.data?.trades?.data) {
        // Paginated response structure
        userTrades = response.data.data.trades.data;
      } else if (response.data.data?.trades) {
        // Direct trades array in data
        userTrades = response.data.data.trades;
      } else if (Array.isArray(response.data.data)) {
        // Data is direct array
        userTrades = response.data.data;
      } else if (Array.isArray(response.data.trades)) {
        // Alternative structure
        userTrades = response.data.trades;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        userTrades = response.data;
      }
      
      setTrades(userTrades || []);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch trade history';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId, reason = "User cancelled") => {
    if (!confirm("Are you sure you want to cancel this trade? This action cannot be undone.")) {
      return;
    }

    try {
      await api.post(`/p2p/trades/${tradeId}/cancel`, { reason });
      toast.success('Trade cancelled successfully');
      fetchTradeHistory();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel trade';
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="text-green-400" size={16} />;
      case 'cancelled': return <X className="text-red-400" size={16} />;
      case 'processing': return <Clock className="text-yellow-400" size={16} />;
      case 'disputed': return <AlertTriangle className="text-orange-400" size={16} />;
      case 'active': return <Clock className="text-blue-400" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'disputed': return 'text-orange-400 bg-orange-500/20';
      case 'active': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRole = (trade) => {
     if (String(trade.seller_id) === String(userData?.id)) {
      return trade.type === 'sell' ? 'Seller' : 'Buy Order Creator';
    } else {
      return trade.type === 'sell' ? 'Buyer' : 'Seller';
    }
  };

  const getCounterparty = (trade) => {
    if (String(trade.seller_id) === String(userData?.id)) {
      return trade.buyer?.username || 'Waiting for buyer...';
    } else {
      return trade.seller?.username || 'Unknown';
    }
  };

  const canCancelTrade = (trade) => {
    const isSeller = String(trade.seller_id) === String(userData?.id);
    
    if (trade.status === 'active' && isSeller) {
      return true;
    }
    
    if (trade.status === 'processing' && (isSeller || String(trade.buyer_id) === String(userData?.id))) {
      return true;
    }
    
    return false;
  };

  const getTradeAction = (trade) => {
     if (String(trade.seller_id) === String(userData?.id)) {
      return trade.type === 'sell' ? 'Sold' : 'Bought';
    } else {
      return trade.type === 'sell' ? 'Bought' : 'Sold';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-100">P2P Trade History</h2>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'processing', 'completed', 'cancelled', 'disputed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-xl font-medium transition-all text-sm md:text-base ${
                  filter === status
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTradeHistory}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Trade History</h3>
          <p className="text-gray-400">Your P2P trade history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <div key={trade.id} className="bg-gray-800/50 rounded-2xl p-4 md:p-6 border border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 md:gap-4">
                  {getStatusIcon(trade.status)}
                  <div>
                    <p className="text-gray-100 font-semibold text-sm md:text-base">
                      {getTradeAction(trade)} {trade.amount} CMEME
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {new Date(trade.created_at).toLocaleDateString()} at {new Date(trade.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      Trade ID: #{trade.id} • Role: {getRole(trade)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                  </div>
                  
                  {canCancelTrade(trade) && (
                    <button
                      onClick={() => handleCancelTrade(trade.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-xs md:text-sm"
                    >
                      <Ban size={14} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Price</p>
                  <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.price}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Total Value</p>
                  <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.total} USD</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Counterparty</p>
                  <p className="text-gray-100 font-semibold text-sm md:text-base">{getCounterparty(trade)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Payment Method</p>
                  <p className="text-gray-100 font-semibold text-sm md:text-base">
                    {trade.payment_method_label || trade.payment_method}
                  </p>
                </div>
              </div>

              {/* Proofs Section */}
              {trade.proofs && trade.proofs.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Payment Proofs:</p>
                  <div className="flex flex-wrap gap-2">
                    {trade.proofs.map((proof) => (
                      <button
                        key={proof.id}
                        onClick={() => window.open(proof.file_path, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm"
                      >
                        <FileText size={14} />
                        View Proof
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-400">
                <div>
                  <span className="text-gray-500">Trade Type:</span> {trade.type}
                </div>
                {trade.expires_at && (
                  <div>
                    <span className="text-gray-500">Expired:</span> {new Date(trade.expires_at).toLocaleString()}
                  </div>
                )}
                {trade.paid_at && (
                  <div>
                    <span className="text-gray-500">Paid At:</span> {new Date(trade.paid_at).toLocaleString()}
                  </div>
                )}
                {trade.cancelled_at && (
                  <div>
                    <span className="text-gray-500">Cancelled At:</span> {new Date(trade.cancelled_at).toLocaleString()}
                  </div>
                )}
                {trade.cancellation_reason && (
                  <div className="w-full">
                    <span className="text-gray-500">Cancellation Reason:</span> {trade.cancellation_reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default P2PHistoryPage;