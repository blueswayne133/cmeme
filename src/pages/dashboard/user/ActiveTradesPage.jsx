import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Clock, User, DollarSign, Coins, Upload, Check, X, AlertTriangle, Eye, Shield } from "lucide-react";
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
  const isSeller = String(trade.seller_id) === String(userData?.id);
  const isBuyer = String(trade.buyer_id) === String(userData?.id);
  const counterparty = isSeller ? trade.buyer : trade.seller; 
  
  const [showUpload, setShowUpload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);

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

  // Get payment details from trade
  const paymentDetails = trade.payment_details || {};
  const bankDetails = paymentDetails.instructions || trade.terms || 'No payment details provided';

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
            <>
              <button
                onClick={() => setShowBankDetails(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <Eye size={16} />
                View Bank Details
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <Upload size={16} />
                Upload Proof
              </button>
            </>
          )}

          {isSeller && trade.paid_at && (
            <button
              onClick={() => onConfirmPayment(trade.id)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <Check size={16} />
              Release Tokens
            </button>
          )}

          <button
            onClick={() => setShowCancel(true)}
            className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>

      {/* Trade Status Information */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-blue-300 font-semibold mb-2">Trade Instructions</h4>
            {isBuyer && !trade.paid_at && (
              <div className="text-blue-200 text-sm space-y-1">
                <p>1. Click "View Bank Details" to see seller's payment information</p>
                <p>2. Make payment to the provided account</p>
                <p>3. Click "Upload Proof" and upload your payment receipt</p>
                <p>4. Wait for seller to confirm and release tokens</p>
              </div>
            )}
            {isBuyer && trade.paid_at && (
              <div className="text-yellow-200 text-sm">
                <p>✅ Payment proof uploaded. Waiting for seller to confirm receipt and release tokens.</p>
              </div>
            )}
            {isSeller && trade.paid_at && (
              <div className="text-green-200 text-sm space-y-1">
                <p>1. Buyer has uploaded payment proof</p>
                <p>2. Check your bank account to confirm receipt</p>
                <p>3. Click "Release Tokens" to complete the trade</p>
                <p>4. Tokens will be transferred to buyer automatically</p>
              </div>
            )}
            {isSeller && !trade.paid_at && (
              <div className="text-yellow-200 text-sm">
                <p>⏳ Waiting for buyer to make payment and upload proof.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
          <p className="text-gray-100 font-semibold">{trade.payment_method}</p>
        </div>
      </div>

      {/* Counterparty Information */}
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
        <h4 className="text-gray-300 font-semibold mb-2">
          {isSeller ? 'Buyer Information' : 'Seller Information'}
        </h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold text-gray-900">
            {counterparty?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-gray-100 font-medium">{counterparty?.username || 'Unknown'}</p>
            <p className="text-gray-400 text-sm">
              Success Rate: {counterparty?.p2p_success_rate || 100}%
            </p>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Payment Instructions</h3>
              <p className="text-gray-400 text-sm mt-1">
                Send payment to the following account details:
              </p>
            </div>
            <div className="p-6 space-y-4">
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
                  {paymentDetails.account_number && (
                    <div>
                      <span className="text-gray-400 text-sm">Account Number:</span>
                      <p className="text-gray-100 font-medium">{paymentDetails.account_number}</p>
                    </div>
                  )}
                  {paymentDetails.account_name && (
                    <div>
                      <span className="text-gray-400 text-sm">Account Name:</span>
                      <p className="text-gray-100 font-medium">{paymentDetails.account_name}</p>
                    </div>
                  )}
                  {paymentDetails.bank_name && (
                    <div>
                      <span className="text-gray-400 text-sm">Bank Name:</span>
                      <p className="text-gray-100 font-medium">{paymentDetails.bank_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="text-yellow-300 font-semibold">Important</h5>
                    <ul className="text-yellow-200 text-sm mt-1 space-y-1">
                      <li>• Make payment only to the account details shown above</li>
                      <li>• Keep your payment receipt safe</li>
                      <li>• Upload payment proof immediately after payment</li>
                      <li>• Contact support if you encounter any issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Upload Payment Proof</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">Please upload proof of payment for this trade.</p>
              <p className="text-gray-400 text-sm">
                Upload a screenshot or photo of your payment receipt/confirmation.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100"
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