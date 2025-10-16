import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, X, Clock, AlertTriangle } from "lucide-react";
import api from "../../../utils/api";

const P2PHistoryPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTradeHistory();
  }, [filter]);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/p2p/trades/user', {
        params: { status: filter === 'all' ? '' : filter }
      });
      setTrades(response.data.data.trades.data || []);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="text-green-400" size={16} />;
      case 'cancelled': return <X className="text-red-400" size={16} />;
      case 'processing': return <Clock className="text-yellow-400" size={16} />;
      case 'disputed': return <AlertTriangle className="text-orange-400" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'disputed': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
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
        
        <div className="flex gap-2">
          {['all', 'completed', 'cancelled', 'processing', 'disputed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
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
            <div key={trade.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(trade.status)}
                  <div>
                    <p className="text-gray-100 font-semibold">
                      {trade.type === 'sell' ? 'Sold' : 'Bought'} {trade.amount} CMEME
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(trade.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trade.status)}`}>
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Price</p>
                  <p className="text-gray-100 font-semibold">${trade.price}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-gray-100 font-semibold">${trade.total} USD</p>
                </div>
                <div>
                  <p className="text-gray-400">Counterparty</p>
                  <p className="text-gray-100 font-semibold">
                    {trade.seller_id === trade.current_user_id ? trade.buyer?.username : trade.seller?.username}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Payment Method</p>
                  <p className="text-gray-100 font-semibold">{trade.payment_method_label}</p>
                </div>
              </div>

              {trade.cancellation_reason && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">
                    <strong>Cancellation Reason:</strong> {trade.cancellation_reason}
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