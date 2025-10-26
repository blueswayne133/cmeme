import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Clock, User, DollarSign, Coins, Upload, Check, X, AlertTriangle } from "lucide-react";
import api from "../../../utils/api";

const ActiveTradesPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useOutletContext();

  useEffect(() => {
    fetchUserTrades();
  }, []);

  const fetchUserTrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/p2p/trades/user', {
        params: { status: 'processing' }
      });
      // Fixed: Access the correct data path
      setTrades(response.data.data.trades || []);
    } catch (error) {
      console.error('Error fetching user trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (tradeId, file) => {
    try {
      const formData = new FormData();
      formData.append('proof_file', file);
      formData.append('description', 'Payment proof');

      await api.post(`/p2p/trades/${tradeId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      fetchUserTrades();
      alert('Payment proof uploaded successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload proof');
    }
  };

  const handleConfirmPayment = async (tradeId) => {
    try {
      await api.post(`/p2p/trades/${tradeId}/confirm-payment`);
      fetchUserTrades();
      alert('Payment confirmed! Trade completed.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleCancelTrade = async (tradeId, reason) => {
    if (!confirm("Are you sure you want to cancel this trade?")) {
      return;
    }

    try {
      await api.post(`/p2p/trades/${tradeId}/cancel`, { reason });
      fetchUserTrades();
      alert('Trade cancelled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel trade');
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
      <h2 className="text-2xl font-bold text-gray-100">Active Trades</h2>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Active Trades</h3>
          <p className="text-gray-400">You don't have any active P2P trades at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <ActiveTradeCard
              key={trade.id}
              trade={trade}
              userData={userData}
              onUploadProof={handleUploadProof}
              onConfirmPayment={handleConfirmPayment}
              onCancelTrade={handleCancelTrade}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveTradeCard = ({ trade, userData, onUploadProof, onConfirmPayment, onCancelTrade }) => {
  const isSeller = trade.seller_id === userData?.id;
  const isBuyer = trade.buyer_id === userData?.id;
  const counterparty = isSeller ? trade.buyer : trade.seller;

  const [showUpload, setShowUpload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadProof(trade.id, file);
      setShowUpload(false);
    }
  };

  const handleCancel = () => {
    if (cancelReason.trim()) {
      onCancelTrade(trade.id, cancelReason);
      setShowCancel(false);
      setCancelReason('');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-400" />
            <span className="text-gray-300 font-semibold">{counterparty?.username || 'Waiting for counterparty...'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-blue-400" />
            <span className="text-gray-400">Expires in: {trade.time_remaining}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            trade.paid_at 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {trade.paid_at ? 'Payment Made' : 'Awaiting Payment'}
          </div>
        </div>

        <div className="flex gap-2">
          {isBuyer && !trade.paid_at && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all"
            >
              <Upload size={16} className="inline mr-2" />
              Upload Proof
            </button>
          )}

          {isSeller && trade.paid_at && (
            <button
              onClick={() => onConfirmPayment(trade.id)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all"
            >
              <Check size={16} className="inline mr-2" />
              Confirm Payment
            </button>
          )}

          <button
            onClick={() => setShowCancel(true)}
            className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold rounded-xl transition-colors"
          >
            <X size={16} className="inline mr-2" />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Amount</p>
          <p className="text-gray-100 font-semibold">{trade.amount} CMEME</p>
        </div>
        <div>
          <p className="text-gray-400">Price</p>
          <p className="text-gray-100 font-semibold">${trade.price}</p>
        </div>
        <div>
          <p className="text-gray-400">Total</p>
          <p className="text-gray-100 font-semibold">${trade.total} USD</p>
        </div>
        <div>
          <p className="text-gray-400">Payment Method</p>
          <p className="text-gray-100 font-semibold">{trade.payment_method_label}</p>
        </div>
      </div>

      {/* Upload Proof Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Upload Payment Proof</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">Please upload proof of payment for this trade.</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Trade Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Cancel Trade</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancel(false);
                    setCancelReason('');
                  }}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTradesPage;