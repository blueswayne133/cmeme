import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Clock, User, DollarSign, Coins, Upload, Check, X, AlertTriangle, Eye, Shield, Send, MessageCircle, FileText } from "lucide-react";
import api from "../../../utils/api";
import getEchoInstance from "../../../utils/echo";
import toast from "react-hot-toast";

const ActiveTradesPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useOutletContext();
  const echoRef = useRef(null);

  useEffect(() => {
    fetchUserTrades();
    setupWebSockets();
    
    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
      }
    };
  }, []);

  const setupWebSockets = () => {
    if (echoRef.current) {
      echoRef.current.disconnect();
    }

    echoRef.current = getEchoInstance();

    // Listen for connection events
    echoRef.current.connector.pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully for active trades');
    });

    // Listen for trade updates
    echoRef.current.channel('p2p-trades')
      .listen('.P2PTradeUpdated', (e) => {
        console.log('Active trade updated:', e.trade);
        setTrades(prevTrades => 
          prevTrades.map(trade => 
            trade.id === e.trade.id ? { ...trade, ...e.trade } : trade
          ).filter(trade => trade.status === 'processing')
        );
      });
  };

  const fetchUserTrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/p2p/trades/user', {
        params: { status: 'processing' }
      });
      setTrades(response.data.data.trades?.data || response.data.data.trades || []);
    } catch (error) {
      console.error('Error fetching user trades:', error);
      toast.error('Failed to fetch active trades');
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
      toast.success('Payment proof uploaded successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload proof';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleMarkAsPaid = async (tradeId) => {
    try {
      await api.post(`/p2p/trades/${tradeId}/mark-payment-sent`);
      fetchUserTrades();
      toast.success('Payment marked as sent! Seller has been notified.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark payment as sent';
      toast.error(errorMessage);
    }
  };

  const handleConfirmPayment = async (tradeId) => {
    try {
      await api.post(`/p2p/trades/${tradeId}/confirm-payment`);
      fetchUserTrades();
      toast.success('Payment confirmed! Tokens released to buyer.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to confirm payment';
      toast.error(errorMessage);
    }
  };

  const handleCancelTrade = async (tradeId, reason) => {
    if (!confirm("Are you sure you want to cancel this trade?")) {
      return;
    }

    try {
      await api.post(`/p2p/trades/${tradeId}/cancel`, { reason });
      fetchUserTrades();
      toast.success('Trade cancelled successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel trade';
      toast.error(errorMessage);
    }
  };

  // Auto-refresh trades every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (trades.length > 0) {
        fetchUserTrades();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [trades.length]);

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
        <h2 className="text-2xl font-bold text-gray-100">Active Trades</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>Auto-refreshing every 30 seconds</span>
        </div>
      </div>

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
              onMarkAsPaid={handleMarkAsPaid}
              onConfirmPayment={handleConfirmPayment}
              onCancelTrade={handleCancelTrade}
              onRefresh={fetchUserTrades}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveTradeCard = ({ trade, userData, onUploadProof, onMarkAsPaid, onConfirmPayment, onCancelTrade, onRefresh }) => {
  const isSeller = String(trade.seller_id) === String(userData?.id);
  const isBuyer = String(trade.buyer_id) === String(userData?.id);
  const counterparty = isSeller ? trade.buyer : trade.seller; 
  
  const [showUpload, setShowUpload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(trade.time_remaining);

  // Timer countdown
  useEffect(() => {
    if (!trade.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(trade.expires_at);
      const diffMs = expires - now;
      
      if (diffMs <= 0) {
        setTimeRemaining('00:00');
        clearInterval(interval);
        onRefresh(); // Refresh to update status
        return;
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setTimeRemaining(`${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [trade.expires_at, onRefresh]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        await onUploadProof(trade.id, file);
        setUploadedFile(file);
        setShowUpload(false);
      } catch (error) {
        // Error handled in parent
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCancel = () => {
    if (cancelReason.trim()) {
      onCancelTrade(trade.id, cancelReason);
      setShowCancel(false);
      setCancelReason('');
    }
  };

  // Get payment details from trade
  const paymentDetails = trade.payment_details || {};
  const bankDetails = paymentDetails.instructions || trade.terms || 'No payment details provided';

  // Check if proof exists
  const hasProofs = trade.proofs && trade.proofs.length > 0;
  const latestProof = hasProofs ? trade.proofs[trade.proofs.length - 1] : null;

  const isExpired = timeRemaining === '00:00' || trade.status !== 'processing';

  return (
    <div className={`bg-gray-800/50 rounded-2xl p-4 md:p-6 border transition-all ${
      isExpired ? 'border-red-500/50' : 'border-gray-700/50'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-400" />
            <span className="text-gray-300 font-semibold text-sm md:text-base">{counterparty?.username || 'Waiting for counterparty...'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className={isExpired ? "text-red-400" : "text-blue-400"} />
            <span className={isExpired ? "text-red-400" : "text-gray-400"}>
              {isExpired ? 'Expired' : `Expires in: ${timeRemaining}`}
            </span>
          </div>
          <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
            trade.paid_at 
              ? 'bg-green-500/20 text-green-400' 
              : hasProofs
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {trade.paid_at ? 'Payment Confirmed' : hasProofs ? 'Proof Uploaded' : 'Awaiting Payment'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isBuyer && !trade.paid_at && (
            <>
              <button
                onClick={() => setShowBankDetails(true)}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
              >
                <Eye size={14} />
                Bank Details
              </button>
              
              {!hasProofs && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                  <Upload size={14} />
                  Upload Proof
                </button>
              )}
              
              {hasProofs && !trade.paid_at && (
                <button
                  onClick={() => onMarkAsPaid(trade.id)}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                  <Send size={14} />
                  Payment Sent
                </button>
              )}
            </>
          )}

          {isSeller && hasProofs && !trade.paid_at && (
            <button
              onClick={() => onConfirmPayment(trade.id)}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
            >
              <Check size={14} />
              Release Tokens
            </button>
          )}

          <button
            onClick={() => setShowCancel(true)}
            className="px-3 md:px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold rounded-xl transition-colors flex items-center gap-2 text-xs md:text-sm"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>

      {/* Trade Status Information */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 md:p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-blue-300 font-semibold mb-2 text-sm md:text-base">Trade Instructions</h4>
            {isBuyer && !hasProofs && (
              <div className="text-blue-200 text-xs md:text-sm space-y-1">
                <p>1. Click "Bank Details" to see seller's payment information</p>
                <p>2. Make payment to the provided account</p>
                <p>3. Click "Upload Proof" and upload your payment receipt</p>
                <p>4. Click "Payment Sent" to notify the seller</p>
                <p>5. Wait for seller to confirm and release tokens</p>
              </div>
            )}
            {isBuyer && hasProofs && !trade.paid_at && (
              <div className="text-yellow-200 text-xs md:text-sm space-y-1">
                <p>✅ Payment proof uploaded successfully!</p>
                <p>📤 Click "Payment Sent" to notify the seller about your payment</p>
                <p>⏳ Waiting for seller to verify and release tokens</p>
              </div>
            )}
            {isBuyer && trade.paid_at && (
              <div className="text-green-200 text-xs md:text-sm">
                <p>✅ Trade completed! Tokens have been released to your account.</p>
              </div>
            )}
            {isSeller && hasProofs && !trade.paid_at && (
              <div className="text-green-200 text-xs md:text-sm space-y-1">
                <p>📥 Buyer has uploaded payment proof and marked payment as sent</p>
                <p>💰 Check your bank account to confirm receipt</p>
                <p>✅ Click "Release Tokens" to complete the trade</p>
                <p>🚀 Tokens will be transferred to buyer automatically</p>
              </div>
            )}
            {isSeller && !hasProofs && (
              <div className="text-yellow-200 text-xs md:text-sm">
                <p>⏳ Waiting for buyer to make payment and upload proof.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Proof Information */}
      {hasProofs && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 md:p-4 mb-4">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-green-400 flex-shrink-0" />
            <div>
              <h5 className="text-green-300 font-semibold text-sm md:text-base">Payment Proof Uploaded</h5>
              <p className="text-green-200 text-xs md:text-sm">
                {latestProof?.description || 'Payment receipt uploaded'} • {new Date(latestProof?.created_at).toLocaleString()}
              </p>
              {isSeller && (
                <p className="text-green-200 text-xs md:text-sm mt-1">
                  Please verify the payment in your account before releasing tokens.
                </p>
              )}
              {latestProof?.file_path && (
                <button
                  onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/${latestProof.file_path}`, '_blank')}
                  className="text-blue-400 hover:text-blue-300 text-xs md:text-sm mt-1 flex items-center gap-1"
                >
                  <Eye size={12} />
                  View Proof
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-400 text-xs md:text-sm">Amount</p>
          <p className="text-gray-100 font-semibold text-sm md:text-base">{trade.amount} CMEME</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs md:text-sm">Price</p>
          <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.price}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs md:text-sm">Total</p>
          <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.total} USD</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs md:text-sm">Payment Method</p>
          <p className="text-gray-100 font-semibold text-sm md:text-base">{trade.payment_method}</p>
        </div>
      </div>

      {/* Counterparty Information */}
      <div className="bg-gray-900/50 rounded-xl p-3 md:p-4 border border-gray-700">
        <h4 className="text-gray-300 font-semibold mb-2 text-sm md:text-base">
          {isSeller ? 'Buyer Information' : 'Seller Information'}
        </h4>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs md:text-sm font-bold text-gray-900">
            {counterparty?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-gray-100 font-medium text-sm md:text-base">{counterparty?.username || 'Unknown'}</p>
            <p className="text-gray-400 text-xs md:text-sm">
              Success Rate: {counterparty?.p2p_success_rate || 100}%
            </p>
            <p className="text-gray-400 text-xs md:text-sm">
              Completed Trades: {counterparty?.p2p_completed_trades || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Payment Instructions</h3>
              <p className="text-gray-400 text-sm mt-1">
                Send payment to the following account details:
              </p>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <h4 className="text-gray-300 font-semibold mb-3">Seller's Payment Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Payment Method:</span>
                    <p className="text-gray-100 font-medium">{trade.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Instructions:</span>
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <pre className="text-gray-100 whitespace-pre-wrap text-sm font-mono">
                        {bankDetails}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-yellow-300 font-semibold">Important</h5>
                    <ul className="text-yellow-200 text-sm mt-1 space-y-1">
                      <li>• Make payment only to the account details shown above</li>
                      <li>• Keep your payment receipt safe</li>
                      <li>• Upload payment proof immediately after payment</li>
                      <li>• Click "Payment Sent" after uploading proof</li>
                      <li>• Contact support if you encounter any issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowBankDetails(false)}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowBankDetails(false);
                    setShowUpload(true);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all"
                >
                  I've Made Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Proof Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Upload Payment Proof</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-300">Please upload proof of payment for this trade.</p>
              <p className="text-gray-400 text-sm">
                Upload a screenshot or photo of your payment receipt/confirmation (JPEG, PNG, GIF, max 5MB).
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-600"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  Uploading proof...
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 rounded-xl transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Cancel Trade</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-300">Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
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