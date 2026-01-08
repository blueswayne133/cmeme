import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowUpDown, ArrowRight, RefreshCw, AlertCircle, Crown, X, CheckCircle } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const SwapPage = () => {
  const { userData, refetchUserData } = useOutletContext();
  const navigate = useNavigate();
  const [swapType, setSwapType] = useState('cmeme-to-usdc'); // 'cmeme-to-usdc' or 'usdc-to-cmeme'
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    has_subscribed: false,
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    // Only fetch preview if user is subscribed
    if (subscriptionStatus.has_subscribed && amount && parseFloat(amount) > 0) {
      fetchPreview();
    } else {
      setPreview(null);
    }
  }, [amount, swapType, subscriptionStatus.has_subscribed]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setSubscriptionStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchPreview = async () => {
    if (!subscriptionStatus.has_subscribed) {
      setPreview(null);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setPreview(null);
      return;
    }

    try {
      setPreviewLoading(true);
      const from = swapType === 'cmeme-to-usdc' ? 'CMEME' : 'USDC';
      const response = await api.get('/swap/preview', {
        params: {
          from,
          amount: parseFloat(amount)
        }
      });

      if (response.data.status === 'success') {
        setPreview(response.data.data);
      }
    } catch (error) {
      if (error.response?.data?.requires_subscription) {
        setShowSubscriptionModal(true);
        setPreview(null);
      } else {
        console.error('Error fetching preview:', error);
        setPreview(null);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSwap = async () => {
    // Check subscription first
    if (!subscriptionStatus.has_subscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount', {
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
        icon: '❌',
      });
      return;
    }

    if (preview && !preview.has_sufficient_balance) {
      toast.error(`Insufficient ${swapType === 'cmeme-to-usdc' ? 'CMEME' : 'USDC'} balance`, {
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
        icon: '❌',
      });
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmSwap = async () => {
    setShowConfirmModal(false);

    try {
      setLoading(true);
      const endpoint = swapType === 'cmeme-to-usdc' 
        ? '/swap/cmeme-to-usdc' 
        : '/swap/usdc-to-cmeme';
      
      const response = await api.post(endpoint, {
        amount: parseFloat(amount)
      });

      if (response.data.status === 'success') {
        toast.success('Swap completed successfully!', {
          style: {
            background: '#065f46',
            color: '#fff',
            border: '1px solid #10b981',
          },
          icon: '✅',
          duration: 4000,
        });
        setAmount('');
        setPreview(null);
        if (refetchUserData) {
          await refetchUserData();
        }
      }
    } catch (error) {
      if (error.response?.data?.requires_subscription) {
        setShowSubscriptionModal(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to process swap', {
          style: {
            background: '#7f1d1d',
            color: '#fff',
            border: '1px solid #ef4444',
          },
          icon: '❌',
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMax = () => {
    if (!subscriptionStatus.has_subscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    if (swapType === 'cmeme-to-usdc') {
      setAmount(userData?.token_balance || 0);
    } else {
      setAmount(userData?.usdc_balance || 0);
    }
  };

  const toggleSwapType = () => {
    if (!subscriptionStatus.has_subscribed) {
      setShowSubscriptionModal(true);
      return;
    }
    setSwapType(prev => prev === 'cmeme-to-usdc' ? 'usdc-to-cmeme' : 'cmeme-to-usdc');
    setAmount('');
    setPreview(null);
  };

  const fromCurrency = swapType === 'cmeme-to-usdc' ? 'CMEME' : 'USDC';
  const toCurrency = swapType === 'cmeme-to-usdc' ? 'USDC' : 'CMEME';
  const fromBalance = swapType === 'cmeme-to-usdc' 
    ? (userData?.token_balance || 0) 
    : (userData?.usdc_balance || 0);
  const toBalance = swapType === 'cmeme-to-usdc' 
    ? (userData?.usdc_balance || 0) 
    : (userData?.token_balance || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Swap Tokens</h2>

      {/* Subscription Required Message */}
      {!subscriptionStatus.has_subscribed && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Crown size={32} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Premium Subscription Required</h3>
              <p className="text-gray-300 mb-4">
                To use the swap feature, you need to be a premium subscriber. Subscribe now to unlock instant token swapping!
              </p>
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Crown size={20} />
                Go to Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 ${!subscriptionStatus.has_subscribed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-6">
          {/* From Currency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-sm font-medium">From</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">
                  Balance: {fromBalance.toLocaleString('en-US', { 
                    minimumFractionDigits: swapType === 'cmeme-to-usdc' ? 2 : 2,
                    maximumFractionDigits: swapType === 'cmeme-to-usdc' ? 8 : 2
                  })} {fromCurrency}
                </span>
                <button
                  onClick={handleMax}
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step={swapType === 'cmeme-to-usdc' ? '0.00000001' : '0.01'}
                min="0"
                disabled={!subscriptionStatus.has_subscribed}
                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="text-gray-400 font-semibold">{fromCurrency}</span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleSwapType}
              disabled={!subscriptionStatus.has_subscribed}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Switch swap direction"
            >
              <ArrowUpDown size={24} className="text-gray-300" />
            </button>
          </div>

          {/* To Currency Preview */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">To</label>
            <div className="relative">
              <div className="w-full px-4 py-4 bg-gray-900/30 border border-gray-600 rounded-xl text-gray-100 text-lg font-semibold">
                {previewLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-gray-400" />
                    <span className="text-gray-400">Calculating...</span>
                  </div>
                ) : preview ? (
                  <div className="flex items-center justify-between">
                    <span>
                      {preview.to_amount.toLocaleString('en-US', {
                        minimumFractionDigits: swapType === 'cmeme-to-usdc' ? 2 : 8,
                        maximumFractionDigits: swapType === 'cmeme-to-usdc' ? 2 : 8
                      })}
                    </span>
                    <span className="text-gray-400 font-semibold">{toCurrency}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">0.00</span>
                )}
              </div>
            </div>
            {preview && (
              <div className="mt-2 text-xs text-gray-400">
                Rate: 1 {fromCurrency} = {preview.rate} {toCurrency === 'USDC' ? 'USDC' : 'CMEME'}
              </div>
            )}
          </div>

          {/* Warning */}
          {preview && !preview.has_sufficient_balance && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-red-400 text-sm">
                Insufficient {fromCurrency} balance
              </p>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading || !subscriptionStatus.has_subscribed || !amount || parseFloat(amount) <= 0 || (preview && !preview.has_sufficient_balance)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Processing Swap...
              </>
            ) : (
              <>
                <ArrowRight size={20} />
                Swap {fromCurrency} to {toCurrency}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Swap Information</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Swap between CMEME tokens and USDC instantly</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Exchange rate is based on current CMEME rate: {userData?.cmeme_rate || 0.2} USDC per CMEME</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Premium subscription required to use swap feature</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Swaps are processed immediately and cannot be reversed</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>All swaps are recorded in your transaction history</p>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Crown size={32} className="text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Premium Subscription Required</h3>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  To use the swap feature, you need to be a <span className="text-yellow-400 font-semibold">premium subscriber</span>. 
                  Subscribe now to unlock instant token swapping between CMEME and USDC!
                </p>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Premium Benefits
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Instant token swapping
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Access to all premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Lifetime premium status
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowSubscriptionModal(false);
                      navigate('/dashboard/subscription');
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 rounded-xl transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Crown size={20} />
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Confirm Swap</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">You're swapping:</span>
                    <span className="text-white font-bold text-lg">
                      {amount} {fromCurrency}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight size={24} className="text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">You'll receive:</span>
                    <span className="text-green-400 font-bold text-lg">
                      {preview?.to_amount?.toLocaleString('en-US', {
                        minimumFractionDigits: swapType === 'cmeme-to-usdc' ? 2 : 8,
                        maximumFractionDigits: swapType === 'cmeme-to-usdc' ? 2 : 8
                      })} {toCurrency}
                    </span>
                  </div>
                  {preview && (
                    <div className="pt-3 border-t border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Exchange Rate:</span>
                        <span className="text-gray-300">
                          1 {fromCurrency} = {preview.rate} {toCurrency}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    This action cannot be undone. Please review carefully.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSwap}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Confirm Swap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapPage;
