import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, X, Clock, AlertTriangle, Ban, RefreshCw, FileText, MessageCircle, Shield } from "lucide-react";
import api from "../../../utils/api";
import getEchoInstance from "../../../utils/echo";
import toast from "react-hot-toast";

const P2PHistoryPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { userData } = useOutletContext();
  const echoRef = useRef(null);

  useEffect(() => {
    fetchTradeHistory();
    setupWebSockets();
    
    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
      }
    };
  }, [filter]);

  const setupWebSockets = () => {
    if (echoRef.current) {
      echoRef.current.disconnect();
    }

    echoRef.current = getEchoInstance();

    // Listen for trade updates
    echoRef.current.channel('p2p-trades')
      .listen('.P2PTradeUpdated', (e) => {
        console.log('History trade updated:', e.trade);
        setTrades(prevTrades => 
          prevTrades.map(trade => 
            trade.id === e.trade.id ? { ...trade, ...e.trade } : trade
          )
        );
      });
  };

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/p2p/trades/user', {
        params: filter === 'all' ? {} : { status: filter }
      });
      
      console.log('Trade history response:', response.data);
      
      // Filter to show only trades where user participated (as buyer or seller)
      const allTrades = response.data.data?.trades?.data || response.data.data?.trades || [];
      const userTrades = allTrades.filter(trade => 
        trade.buyer_id === userData?.id || // User participated as buyer
        trade.seller_id === userData?.id   // User participated as seller
      );
      
      setTrades(userTrades);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      toast.error('Failed to fetch trade history');
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
      fetchTradeHistory(); // Refresh the list
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
    // User can cancel if they are the creator (seller) and trade is active
    // Or if they are involved in a processing trade
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

  const viewProof = (proof) => {
    if (proof.file_path) {
      window.open(`${import.meta.env.VITE_API_URL}/storage/${proof.file_path}`, '_blank');
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
                        onClick={() => viewProof(proof)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm"
                      >
                        <FileText size={14} />
                        View Proof {proof.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dispute Information */}
              {trade.dispute && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-orange-400" />
                    <span className="text-orange-300 font-semibold">Dispute Raised</span>
                  </div>
                  <p className="text-orange-200 text-sm">
                    <strong>Reason:</strong> {trade.dispute.reason}
                  </p>
                  <p className="text-orange-200 text-sm">
                    <strong>Status:</strong> {trade.dispute.status}
                  </p>
                  {trade.dispute.resolution && (
                    <p className="text-orange-200 text-sm">
                      <strong>Resolution:</strong> {trade.dispute.resolution}
                    </p>
                  )}
                </div>
              )}

              {/* Additional Trade Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Time Limit</p>
                  <p className="text-gray-100 text-sm md:text-base">{trade.time_limit} minutes</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Trade Type</p>
                  <p className="text-gray-100 text-sm md:text-base capitalize">{trade.type}</p>
                </div>
              </div>

              {/* Trade Terms */}
              {trade.terms && (
                <div className="mt-4 p-3 bg-gray-900/50 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Trade Terms</p>
                  <p className="text-gray-200 text-sm">{trade.terms}</p>
                </div>
              )}

              {/* Cancellation Reason */}
              {trade.cancellation_reason && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">
                    <strong>Cancellation Reason:</strong> {trade.cancellation_reason}
                  </p>
                </div>
              )}

              {/* Expiration Time for Processing Trades */}
              {trade.status === 'processing' && trade.expires_at && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 text-sm">
                    <strong>Expires:</strong> {new Date(trade.expires_at).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Completed/Cancelled Time */}
              {(trade.status === 'completed' && trade.completed_at) && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">
                    <strong>Completed:</strong> {new Date(trade.completed_at).toLocaleString()}
                  </p>
                </div>
              )}

              {(trade.status === 'cancelled' && trade.cancelled_at) && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">
                    <strong>Cancelled:</strong> {new Date(trade.cancelled_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default P2PHistoryPage;