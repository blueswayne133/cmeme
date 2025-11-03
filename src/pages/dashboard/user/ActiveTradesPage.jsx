import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Clock, User, Upload, Check, X, AlertTriangle, Eye, Send, FileText, AlertCircle } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

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

  const handleRejectPayment = async (tradeId, reason) => {
    try {
      await api.post(`/p2p/trades/${tradeId}/reject-payment`, { reason });
      fetchUserTrades();
      toast.success('Payment rejected. Buyer has been notified.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject payment';
      toast.error(errorMessage);
    }
  };

  const handleCreateDispute = async (tradeId, reason) => {
    try {
      await api.post(`/p2p/trades/${tradeId}/dispute`, { reason });
      fetchUserTrades();
      toast.success('Dispute created successfully! Support will review your case.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create dispute';
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
              onRejectPayment={handleRejectPayment}
              onCreateDispute={handleCreateDispute}
              onCancelTrade={handleCancelTrade}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveTradeCard = ({ 
  trade, 
  userData, 
  onUploadProof, 
  onMarkAsPaid, 
  onConfirmPayment, 
  onRejectPayment,
  onCreateDispute,
  onCancelTrade 
}) => {
  const isSeller = String(trade.seller_id) === String(userData?.id);
  const isBuyer = String(trade.buyer_id) === String(userData?.id);
  const counterparty = isSeller ? trade.buyer : trade.seller; 
  
  const [showUpload, setShowUpload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        return;
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setTimeRemaining(`${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [trade.expires_at]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        await onUploadProof(trade.id, file);
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

  const handleReject = () => {
    if (rejectReason.trim()) {
      onRejectPayment(trade.id, rejectReason);
      setShowReject(false);
      setRejectReason('');
    }
  };

  const handleDispute = () => {
    if (disputeReason.trim()) {
      onCreateDispute(trade.id, disputeReason);
      setShowDispute(false);
      setDisputeReason('');
    }
  };

  // Get payment details from trade
  const paymentDetails = trade.payment_details || {};
  const bankDetails = paymentDetails.instructions || trade.terms || 'No payment details provided';

  // Check if proof exists and payment is marked as sent
  const hasProofs = trade.proofs && trade.proofs.length > 0;
  const paymentMarkedAsSent = trade.paid_at !== null;
  const latestProof = hasProofs ? trade.proofs[trade.proofs.length - 1] : null;

  const isExpired = timeRemaining === '00:00' || trade.status !== 'processing';

  // Determine if cancel button should be shown
  const showCancelButton = 
    (isSeller && trade.status === 'active') || 
    (isBuyer && trade.status === 'processing') || 
    (isSeller && trade.status === 'processing' && !trade.buyer_id);

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
              ? paymentMarkedAsSent && !trade.completed_at
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-green-500/20 text-green-400'
              : hasProofs
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {trade.paid_at 
              ? paymentMarkedAsSent && !trade.completed_at
                ? 'Payment Sent - Awaiting Confirmation'
                : 'Payment Confirmed'
              : hasProofs
              ? 'Proof Uploaded'
              : 'Awaiting Payment'
            }
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

          {/* SELLER ACTIONS - Only show if payment is marked as sent but not confirmed */}
          {isSeller && hasProofs && paymentMarkedAsSent && !trade.completed_at && (
            <>
              <button
                onClick={() => onConfirmPayment(trade.id)}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
              >
                <Check size={14} />
                Confirm Payment
              </button>
              
              <button
                onClick={() => setShowReject(true)}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
              >
                <X size={14} />
                Reject Payment
              </button>
            </>
          )}

          {/* BUYER CAN FILE DISPUTE IF PAYMENT IS REJECTED OR NOT CONFIRMED AFTER MARKING AS SENT */}
          {isBuyer && paymentMarkedAsSent && !trade.completed_at && (
            <button
              onClick={() => setShowDispute(true)}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
            >
              <AlertCircle size={14} />
              File Dispute
            </button>
          )}

          {/* CANCEL TRADE BUTTON - Only show for seller when active, or buyer when processing */}
          {showCancelButton && (
            <button
              onClick={() => setShowCancel(true)}
              className="px-3 md:px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold rounded-xl transition-colors flex items-center gap-2 text-xs md:text-sm"
            >
              <X size={14} />
              Cancel Trade
            </button>
          )}
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
                <p>5. Wait for seller to confirm payment and release tokens</p>
              </div>
            )}
            {isBuyer && hasProofs && !trade.paid_at && (
              <div className="text-yellow-200 text-xs md:text-sm space-y-1">
                <p>✅ Payment proof uploaded successfully!</p>
                <p>📤 Click "Payment Sent" to notify the seller about your payment</p>
                <p>⏳ Seller will review your payment proof and confirm receipt</p>
              </div>
            )}
            {isBuyer && paymentMarkedAsSent && !trade.completed_at && (
              <div className="text-blue-200 text-xs md:text-sm space-y-1">
                <p>✅ Payment proof uploaded and marked as sent!</p>
                <p>⏳ Waiting for seller to confirm they received the payment</p>
                <p>📞 Seller has been notified and will verify the payment</p>
                <p>⚠️ If seller doesn't respond, you can file a dispute</p>
              </div>
            )}
            {isBuyer && trade.completed_at && (
              <div className="text-green-200 text-xs md:text-sm">
                <p>✅ Payment confirmed! Tokens have been released to your account.</p>
              </div>
            )}
            {isSeller && hasProofs && !paymentMarkedAsSent && (
              <div className="text-blue-200 text-xs md:text-sm space-y-1">
                <p>📥 Buyer has uploaded payment proof</p>
                <p>⏳ Waiting for buyer to mark payment as sent</p>
                <p>💰 Once buyer clicks "Payment Sent", you can verify and confirm</p>
              </div>
            )}
            {isSeller && paymentMarkedAsSent && !trade.completed_at && (
              <div className="text-green-200 text-xs md:text-sm space-y-1">
                <p>📥 Buyer has marked payment as sent!</p>
                <p>💰 Check your bank account to confirm receipt of payment</p>
                <p>✅ Click "Confirm Payment" if you received the money</p>
                <p>❌ Click "Reject Payment" if you didn't receive the money</p>
                <p>🚀 Tokens will be automatically released to buyer when you confirm</p>
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

      {/* PAYMENT PROOF DISPLAY - Show for both parties when proof is uploaded */}
      {hasProofs && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 md:p-4 mb-4">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="text-green-300 font-semibold text-sm md:text-base mb-2">
                Payment Proof {isSeller ? "Uploaded by Buyer" : "Uploaded by You"}
              </h5>
              <p className="text-green-200 text-xs md:text-sm mb-3">
                {latestProof?.description || 'Payment receipt uploaded'} • {new Date(latestProof?.created_at).toLocaleString()}
              </p>
              
              {/* DISPLAY THE PROOF IMAGE */}
              {latestProof?.file_path && (
                <div className="mt-3">
                  <p className="text-green-200 text-sm mb-2">Payment Proof Image:</p>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/storage/${latestProof.file_path}`}
                      alt="Payment proof" 
                      className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{display: 'none'}} className="text-center text-gray-400 py-4">
                      <FileText size={32} className="mx-auto mb-2" />
                      <p>Proof image cannot be displayed</p>
                      <button
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/${latestProof.file_path}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center gap-1 justify-center"
                      >
                        <Eye size={14} />
                        View Proof in New Tab
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {isSeller && paymentMarkedAsSent && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>Seller Action Required:</strong> Buyer has marked payment as sent. Please verify this payment proof matches the actual payment received in your account.
                  </p>
                </div>
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

      {/* Reject Payment Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Reject Payment</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-300">Please provide a reason for rejecting this payment:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (e.g., payment not received, wrong amount, etc.)..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowReject(false);
                    setRejectReason('');
                  }}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {showDispute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">File Dispute</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-300">Please provide details about the dispute:</p>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Enter dispute details (e.g., seller not releasing tokens, payment issues, etc.)..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDispute(false);
                    setDisputeReason('');
                  }}
                  className="flex-1 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispute}
                  disabled={!disputeReason.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                >
                  File Dispute
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