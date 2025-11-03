import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Filter, ArrowUpDown, Clock, User, DollarSign, Coins, Shield, AlertCircle, Plus, Eye, Lock, Trash2, X, AlertTriangle, MessageCircle, Send } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const P2PTradePage = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    payment_method: '',
    amount: ''
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tradeDetailModal, setTradeDetailModal] = useState(null);
  const { userData } = useOutletContext();

  const isKycVerified = userData?.kyc_status === 'verified';

  useEffect(() => {
    fetchTrades();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [activeTab, filters]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const tradeType = activeTab === 'buy' ? 'sell' : 'buy';
      const response = await api.get('/p2p/trades', {
        params: { type: tradeType, ...filters }
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

      <KycWarningBanner />

      <div className="flex bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'buy'
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Buy CMEME
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'sell'
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Sell CMEME
        </button>
      </div>

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
                activeTab={activeTab}
              />
            ))}
          </div>
        )}
      </div>

      {createModalOpen && (
        <CreateTradeModal
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTrade}
          userData={userData}
          isKycVerified={isKycVerified}
        />
      )}

      {tradeDetailModal && (
        <TradeDetailModal
          trade={tradeDetailModal}
          onClose={() => setTradeDetailModal(null)}
          onInitiate={handleInitiateTrade}
          onDelete={handleDeleteTrade}
          userData={userData}
          isKycVerified={isKycVerified}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

const TradeCard = ({ trade, onViewDetails, onInitiate, userData, isKycVerified, activeTab }) => {
  const isOwnTrade = String(trade.seller_id) === String(userData?.id);
  
  const getButtonText = () => {
    if (activeTab === 'buy') {
      return 'Buy CMEME';
    } else {
      return 'Sell CMEME';
    }
  };

  const getButtonColor = () => {
    if (activeTab === 'buy') {
      return 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white';
    } else {
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900';
    }
  };

  const getTradeTypeInfo = () => {
    if (activeTab === 'buy') {
      return `${trade.seller?.username} is selling CMEME`;
    } else {
      return `${trade.seller?.username} is buying CMEME`;
    }
  };

  return (
    <div className="p-4 md:p-6 hover:bg-gray-800/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-300 font-medium text-sm md:text-base">{getTradeTypeInfo()}</span>
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
                className={`px-4 md:px-6 py-2 md:py-3 font-semibold rounded-xl transition-all text-sm md:text-base ${getButtonColor()}`}
              >
                {getButtonText()}
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

const CreateTradeModal = ({ onClose, onSubmit, userData, isKycVerified }) => {
  const [formData, setFormData] = useState({
    type: 'sell',
    amount: '',
    price: '',
    payment_method: 'bank_transfer',
    terms: '',
    time_limit: 15,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      newErrors.terms = 'Payment instructions are required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
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
          {isKycVerified && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-green-400">
                <Shield size={16} />
                <span className="text-sm font-medium">KYC Verified</span>
              </div>
            </div>
          )}

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

          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-gray-100 font-semibold text-lg">
                ${totalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>

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
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Payment Instructions
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

const TradeDetailModal = ({ trade, onClose, onInitiate, onDelete, userData, isKycVerified, activeTab }) => {
  const isOwnTrade = String(trade.seller_id) === String(userData?.id);
  
  const getInitiateButtonText = () => {
    if (activeTab === 'buy') {
      return 'Start Trade - Buy CMEME';
    } else {
      return 'Start Trade - Sell CMEME';
    }
  };

  const getTradeTypeDisplay = () => {
    return trade.type === 'sell' ? 'Selling CMEME' : 'Buying CMEME';
  };

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

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
              <p className="text-yellow-300 font-semibold text-center">
                {getTradeTypeDisplay()}
              </p>
            </div>

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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="text-gray-100 font-semibold text-xl">{trade.amount} CMEME</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-gray-100 font-semibold text-xl">${trade.price}</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-gray-100 font-semibold text-xl">${trade.total} USD</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Time Limit</p>
                <p className="text-gray-100 font-semibold text-xl">{trade.time_limit}min</p>
              </div>
            </div>

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
                        {trade.terms || 'No payment instructions provided'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            <div className="flex flex-col sm:flex-row gap-3">
              {!isOwnTrade && trade.status === 'active' && (
                isKycVerified ? (
                  <button
                    onClick={() => onInitiate(trade.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
                  >
                    {getInitiateButtonText()}
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
                  onClick={() => onDelete(trade.id)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Trade
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
      </div>
    </div>
  );
};

export default P2PTradePage;