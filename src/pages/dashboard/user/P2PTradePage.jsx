import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Filter, ArrowUpDown, Clock, User, DollarSign, Coins, Shield, AlertCircle, Plus, Eye, Lock, Trash2, X, AlertTriangle, MessageCircle, Send } from "lucide-react";
import api from "../../../utils/api";
import getEchoInstance from "../../../utils/echo";
import toast from "react-hot-toast";

const P2PTradePage = () => {
  const [activeTab, setActiveTab] = useState('sell');
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    payment_method: '',
    amount: ''
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tradeDetailModal, setTradeDetailModal] = useState(null);
  const { userData } = useOutletContext();
  const echoRef = useRef(null);

  // Check if user is KYC verified
  const isKycVerified = userData?.kyc_status === 'verified';

  useEffect(() => {
    fetchTrades();
    setupWebSockets();
    
    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
      }
    };
  }, [activeTab, filters]);

  const setupWebSockets = () => {
    // Disconnect existing connection
    if (echoRef.current) {
      echoRef.current.disconnect();
    }

    // Initialize new Echo instance
    echoRef.current = getEchoInstance();

    // Listen for connection events
    echoRef.current.connector.pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully for P2P trades');
    });

    echoRef.current.connector.pusher.connection.bind('error', (error) => {
      console.error('❌ Pusher connection error:', error);
    });

    // Listen for public trade updates
    echoRef.current.channel('p2p-trades')
      .listen('.P2PTradeUpdated', (e) => {
        console.log('📦 Trade update received:', e.trade);
        setTrades(prevTrades => 
          prevTrades.map(trade => 
            trade.id === e.trade.id ? { ...trade, ...e.trade } : trade
          )
        );
        
        // Update trade detail modal if open
        if (tradeDetailModal && tradeDetailModal.id === e.trade.id) {
          setTradeDetailModal(prev => ({ ...prev, ...e.trade }));
        }
      });
  };

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/p2p/trades', {
        params: { type: activeTab, ...filters }
      });
      setTrades(response.data.data.trades.data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrade = async (formData) => {
    if (!isKycVerified) {
      toast.error('KYC verification required to create trades');
      return;
    }

    try {
      await api.post('/p2p/trades', formData);
      setCreateModalOpen(false);
      fetchTrades();
      toast.success('Trade created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create trade';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleInitiateTrade = async (tradeId) => {
    if (!isKycVerified) {
      toast.error('KYC verification required to initiate trades');
      return;
    }

    try {
      await api.post(`/p2p/trades/${tradeId}/initiate`);
      setTradeDetailModal(null);
      fetchTrades();
      toast.success('Trade initiated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to initiate trade';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    try {
      await api.delete(`/p2p/trades/${tradeId}`);
      setTradeDetailModal(null);
      fetchTrades();
      toast.success('Trade deleted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete trade';
      toast.error(errorMessage);
      throw error;
    }
  };

  // KYC Warning Banner
  const KycWarningBanner = () => {
    if (isKycVerified) return null;

    return (
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Lock size={24} className="text-yellow-400" />
          <div className="flex-1">
            <h3 className="text-yellow-300 font-semibold">KYC Verification Required</h3>
            <p className="text-yellow-200 text-sm">
              You need to complete KYC verification to participate in P2P trading.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/kyc'}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-xl transition-all"
          >
            Verify KYC
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-100">P2P Trading</h2>
        <button
          onClick={() => isKycVerified ? setCreateModalOpen(true) : toast.error('KYC verification required')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-lg ${
            isKycVerified
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
          Create Trade
        </button>
      </div>

      {/* KYC Warning */}
      <KycWarningBanner />

      {/* Tabs */}
      <div className="flex bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'sell'
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Buy CMEME
        </button>
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'buy'
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Sell CMEME
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
            <select
              value={filters.payment_method}
              onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            >
              <option value="">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wise">Wise</option>
              <option value="paypal">PayPal</option>
              <option value="revolut">Revolut</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Min Amount</label>
            <input
              type="number"
              placeholder="0"
              value={filters.amount}
              onChange={(e) => setFilters(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTrades}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all"
            >
              <Search size={20} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12">
            <Coins size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Trades Found</h3>
            <p className="text-gray-400">Be the first to create a trade!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {trades.map((trade) => (
              <TradeCard 
                key={trade.id} 
                trade={trade} 
                onViewDetails={() => setTradeDetailModal(trade)}
                onInitiate={() => handleInitiateTrade(trade.id)}
                userData={userData}
                isKycVerified={isKycVerified}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Trade Modal */}
      {createModalOpen && (
        <CreateTradeModal
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTrade}
          userData={userData}
          isKycVerified={isKycVerified}
        />
      )}

      {/* Trade Detail Modal */}
      {tradeDetailModal && (
        <TradeDetailModal
          trade={tradeDetailModal}
          onClose={() => setTradeDetailModal(null)}
          onInitiate={handleInitiateTrade}
          onDelete={handleDeleteTrade}
          userData={userData}
          isKycVerified={isKycVerified}
        />
      )}
    </div>
  );
};

// TradeCard Component
const TradeCard = ({ trade, onViewDetails, onInitiate, userData, isKycVerified }) => {
  const isOwnTrade = String(trade.seller_id) === String(userData?.id);

  return (
    <div className="p-4 md:p-6 hover:bg-gray-800/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-300 font-medium text-sm md:text-base">{trade.seller?.username}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield size={14} className="text-green-400" />
              <span className="text-gray-400">{trade.seller?.p2p_success_rate || 100}% Success</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-blue-400" />
              <span className="text-gray-400">{trade.time_limit}min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Price</p>
              <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.price}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Available</p>
              <p className="text-gray-100 font-semibold text-sm md:text-base">{trade.amount} CMEME</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Limit</p>
              <p className="text-gray-100 font-semibold text-sm md:text-base">${trade.total}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Payment</p>
              <p className="text-gray-100 font-semibold text-sm md:text-base">{trade.payment_method}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 lg:mt-0">
          {!isOwnTrade ? (
            isKycVerified ? (
              <button
                onClick={onInitiate}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all text-sm md:text-base"
              >
                Trade
              </button>
            ) : (
              <button
                disabled
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
              >
                <Lock size={16} />
                Verify KYC
              </button>
            )
          ) : (
            <button
              disabled
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed text-sm md:text-base"
            >
              Your Trade
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200 font-medium rounded-xl transition-colors text-sm md:text-base"
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

// CreateTradeModal Component
const CreateTradeModal = ({ onClose, onSubmit, userData, isKycVerified }) => {
  const [formData, setFormData] = useState({
    type: 'sell',
    amount: '',
    price: '',
    payment_method: 'bank_transfer',
    payment_details: {},
    terms: '',
    time_limit: 15,
    custom_payment_method: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Prevent non-KYC users from accessing
  useEffect(() => {
    if (!isKycVerified) {
      toast.error('KYC verification required to create trades');
      onClose();
    }
  }, [isKycVerified, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isKycVerified) {
      toast.error('KYC verification required to create trades');
      return;
    }

    setErrors({});
    setLoading(true);

    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.terms || formData.terms.trim() === '') {
      newErrors.terms = 'Payment details are required';
    }
    if (formData.payment_method === 'other' && (!formData.custom_payment_method || formData.custom_payment_method.trim() === '')) {
      newErrors.custom_payment_method = 'Please specify the payment method';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Balance validation
    if (formData.type === 'sell' && (parseFloat(formData.amount) > userData?.token_balance)) {
      setErrors({ amount: 'Insufficient CMEME balance' });
      setLoading(false);
      return;
    }

    if (formData.type === 'buy') {
      const total = parseFloat(formData.amount) * parseFloat(formData.price);
      if (total > userData?.usdc_balance) {
        setErrors({ amount: 'Insufficient USDC balance for this trade' });
        setLoading(false);
        return;
      }
    }

    try {
      const submitData = {
        ...formData,
        payment_method: formData.payment_method === 'other' ? formData.custom_payment_method : formData.payment_method,
        payment_details: {
          instructions: formData.terms,
          account_name: userData?.name || userData?.username,
          created_at: new Date().toISOString()
        }
      };

      await onSubmit(submitData);
    } catch (error) {
      // Error handled in parent component
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalAmount = (parseFloat(formData.amount) || 0) * (parseFloat(formData.price) || 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100">Create P2P Trade</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* KYC Verified Badge */}
          {isKycVerified && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-green-400">
                <Shield size={16} />
                <span className="text-sm font-medium">KYC Verified</span>
              </div>
            </div>
          )}

          {/* Trade Type */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Trade Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['sell', 'buy'].map((type) => (
                <label
                  key={type}
                  className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.type === type
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={(e) => updateFormData('type', e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-gray-200 text-center">
                    {type === 'sell' ? 'Sell CMEME' : 'Buy CMEME'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount (CMEME)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => updateFormData('amount', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                  errors.amount ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.amount && (
                <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Available: {userData?.token_balance || 0} CMEME
              </p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={formData.price}
                onChange={(e) => updateFormData('price', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                  errors.price ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0.0000"
                disabled={loading}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-gray-100 font-semibold text-lg">
                ${totalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => updateFormData('payment_method', e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              disabled={loading}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wise">Wise</option>
              <option value="paypal">PayPal</option>
              <option value="revolut">Revolut</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Custom Payment Method */}
          {formData.payment_method === 'other' && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Specify Payment Method
              </label>
              <input
                type="text"
                value={formData.custom_payment_method}
                onChange={(e) => updateFormData('custom_payment_method', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                  errors.custom_payment_method ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter payment method name"
                disabled={loading}
              />
              {errors.custom_payment_method && (
                <p className="text-red-400 text-xs mt-1">{errors.custom_payment_method}</p>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Payment Details & Instructions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => updateFormData('terms', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                errors.terms ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Provide your payment details (account number, wallet address, PayPal email, etc.)"
              rows="3"
              disabled={loading}
            />
            {errors.terms && (
              <p className="text-red-400 text-xs mt-1">{errors.terms}</p>
            )}
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={formData.time_limit}
              onChange={(e) => updateFormData('time_limit', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              disabled={loading}
            />
          </div>

          {/* Balance Check */}
          {formData.type === 'sell' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                ℹ️ {formData.amount || 0} CMEME will be locked for this trade until completion
              </p>
            </div>
          )}

          {formData.type === 'buy' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                ℹ️ ${totalAmount.toFixed(2)} USDC will be locked for this trade until completion
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isKycVerified}
            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
              loading || !isKycVerified
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900'
            }`}
          >
            {loading ? 'Creating Trade...' : 'Create Trade'}
          </button>
        </form>
      </div>
    </div>
  );
};

// TradeDetailModal Component with Real-time Chat
const TradeDetailModal = ({ trade, onClose, onInitiate, onDelete, userData, isKycVerified }) => {
  const isOwnTrade = String(trade.seller_id) === String(userData?.id);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupPrivateChannel();
    
    return () => {
      if (echoRef.current) {
        echoRef.current.leave(`p2p-trade.${trade.id}`);
      }
    };
  }, [trade?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupPrivateChannel = () => {
    if (echoRef.current) {
      echoRef.current.leave(`p2p-trade.${trade.id}`);
    }

    echoRef.current = getEchoInstance();

    // Join private trade channel for chat
    echoRef.current.private(`p2p-trade.${trade.id}`)
      .listen('.NewTradeMessage', (e) => {
        console.log('New chat message:', e);
        setMessages(prev => [...prev, e.message]);
      })
      .listen('.P2PTradeUpdated', (e) => {
        console.log('Trade updated in modal:', e);
        // You might want to update the trade data here
      });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/p2p/trades/${trade.id}`);
      setMessages(response.data.data.trade.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await api.post(`/p2p/trades/${trade.id}/message`, {
        message: newMessage
      });
      
      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trade? This action cannot be undone and your locked funds will be refunded.")) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete(trade.id);
    } catch (error) {
      // Error handled in parent
    } finally {
      setDeleting(false);
    }
  };

  // Get payment details
  const paymentDetails = trade.payment_details || {};
  const bankDetails = paymentDetails.instructions || trade.terms || 'No payment details provided';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full border border-gray-700 shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700">
          <h2 className="text-lg md:text-xl font-bold text-gray-100">Trade Details #{trade.id}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Trade Information */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-700">
            <div className="space-y-4">
              {/* KYC Status */}
              {!isKycVerified && !isOwnTrade && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Lock size={16} />
                    <span className="font-medium">KYC Verification Required</span>
                  </div>
                  <p className="text-yellow-200 text-sm mt-1">
                    You need to complete KYC verification to initiate this trade.
                  </p>
                </div>
              )}

              {/* Trade Flow Information */}
              {!isOwnTrade && trade.status === 'active' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-300 font-semibold mb-3">How This Trade Works</h4>
                  <div className="space-y-2 text-blue-200 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">1</div>
                      <span>Click "Start Trade" to begin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">2</div>
                      <span>View seller's bank details and make payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">3</div>
                      <span>Upload payment proof in Active Trades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">4</div>
                      <span>Seller confirms receipt and releases tokens</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Info */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-900/50 rounded-xl p-3 md:p-4">
                  <p className="text-gray-400 text-xs md:text-sm">Amount</p>
                  <p className="text-gray-100 font-semibold text-base md:text-xl">{trade.amount} CMEME</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-3 md:p-4">
                  <p className="text-gray-400 text-xs md:text-sm">Price</p>
                  <p className="text-gray-100 font-semibold text-base md:text-xl">${trade.price}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-3 md:p-4">
                  <p className="text-gray-400 text-xs md:text-sm">Total</p>
                  <p className="text-gray-100 font-semibold text-base md:text-xl">${trade.total} USD</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-3 md:p-4">
                  <p className="text-gray-400 text-xs md:text-sm">Time Limit</p>
                  <p className="text-gray-100 font-semibold text-base md:text-xl">{trade.time_limit}min</p>
                </div>
              </div>

              {/* Payment Details */}
              {trade.type === 'sell' && (
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Method:</span>
                      <span className="text-gray-100">{trade.payment_method}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-2">Payment Instructions:</span>
                      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <pre className="text-gray-100 whitespace-pre-wrap text-sm font-mono">
                          {bankDetails}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  {trade.type === 'sell' ? 'Seller Information' : 'Buyer Information'}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg font-bold text-gray-900">
                    {trade.seller?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-100 font-semibold">{trade.seller?.username}</p>
                    <p className="text-gray-400 text-sm">
                      Success Rate: {trade.seller?.p2p_success_rate || 100}%
                    </p>
                    <p className="text-gray-400 text-sm">
                      Completed Trades: {trade.seller?.p2p_completed_trades || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trade Terms */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Important Information</h4>
                <ul className="text-yellow-300 text-sm space-y-1">
                  <li>• You have {trade.time_limit} minutes to complete the payment</li>
                  <li>• Upload payment proof after making the payment</li>
                  <li>• Only proceed with payment after initiating the trade</li>
                  <li>• Contact support if you encounter any issues</li>
                  {trade.type === 'sell' && (
                    <li>• Make payment only to the provided account details</li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isOwnTrade && trade.status === 'active' && (
                  isKycVerified ? (
                    <button
                      onClick={() => onInitiate(trade.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Start Trade
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock size={16} />
                      Verify KYC
                    </button>
                  )
                )}
                
                {isOwnTrade && trade.status === 'active' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Trade
                      </>
                    )}
                  </button>
                )}
                
                {isOwnTrade && trade.status !== 'active' && (
                  <button
                    disabled
                    className="flex-1 py-3 bg-gray-600 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                  >
                    Your Trade
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          {trade.status === 'processing' && (
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Trade Chat
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 md:max-h-none">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-xl ${
                      message.is_system
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : message.user_id === userData?.id
                        ? 'bg-green-500/10 border border-green-500/20 ml-8'
                        : 'bg-gray-700/50 border border-gray-600/50 mr-8'
                    }`}
                  >
                    {!message.is_system && (
                      <p className="text-xs text-gray-400 mb-1">
                        {message.user_id === userData?.id ? 'You' : trade.getCounterparty?.(userData)?.username}
                      </p>
                    )}
                    <p className="text-gray-200 text-sm">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:text-gray-400 text-gray-900 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default P2PTradePage;