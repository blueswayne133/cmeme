import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Crown, CheckCircle, AlertCircle, Coins, DollarSign } from "lucide-react";
import api from "../../../utils/api";

const SubscriptionPage = () => {
  const { userData, refetchUserData } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('CMEME'); // 'CMEME' or 'USDC'
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    has_subscribed: false,
    can_subscribe: true,
    subscription_fee_cmeme: 1500,
    subscription_fee_usdc: 1500,
    user_balance_cmeme: 0,
    user_balance_usdc: 0,
    can_pay_cmeme: false,
    can_pay_usdc: false,
  });

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    // Auto-switch currency if user doesn't have enough balance in selected currency
    if (!subscriptionStatus.has_subscribed && subscriptionStatus.can_subscribe) {
      if (selectedCurrency === 'CMEME' && !subscriptionStatus.can_pay_cmeme && subscriptionStatus.can_pay_usdc) {
        setSelectedCurrency('USDC');
      } else if (selectedCurrency === 'USDC' && !subscriptionStatus.can_pay_usdc && subscriptionStatus.can_pay_cmeme) {
        setSelectedCurrency('CMEME');
      }
    }
  }, [subscriptionStatus, selectedCurrency]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setSubscriptionStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!subscriptionStatus.can_subscribe) {
      alert('You have already subscribed. This is a one-time subscription.');
      return;
    }

    const fee = selectedCurrency === 'CMEME' 
      ? subscriptionStatus.subscription_fee_cmeme 
      : subscriptionStatus.subscription_fee_usdc;
    
    const balance = selectedCurrency === 'CMEME'
      ? subscriptionStatus.user_balance_cmeme
      : subscriptionStatus.user_balance_usdc;
    
    const canPay = selectedCurrency === 'CMEME'
      ? subscriptionStatus.can_pay_cmeme
      : subscriptionStatus.can_pay_usdc;

    if (!canPay) {
      alert(`Insufficient ${selectedCurrency} balance. You need ${fee.toLocaleString('en-US', { 
        minimumFractionDigits: selectedCurrency === 'CMEME' ? 2 : 2, 
        maximumFractionDigits: selectedCurrency === 'CMEME' ? 8 : 2 
      })} ${selectedCurrency} to subscribe. Your current balance: ${balance.toLocaleString('en-US', { 
        minimumFractionDigits: selectedCurrency === 'CMEME' ? 2 : 2, 
        maximumFractionDigits: selectedCurrency === 'CMEME' ? 8 : 2 
      })} ${selectedCurrency}`);
      return;
    }

    if (!confirm(`Are you sure you want to subscribe? This will cost ${fee.toLocaleString('en-US', { 
      minimumFractionDigits: selectedCurrency === 'CMEME' ? 2 : 2, 
      maximumFractionDigits: selectedCurrency === 'CMEME' ? 8 : 2 
    })} ${selectedCurrency} (one-time only).\n\nYour ${selectedCurrency} balance: ${balance.toLocaleString('en-US', { 
      minimumFractionDigits: selectedCurrency === 'CMEME' ? 2 : 2, 
      maximumFractionDigits: selectedCurrency === 'CMEME' ? 8 : 2 
    })} ${selectedCurrency}\nAfter subscription: ${(balance - fee).toLocaleString('en-US', { 
      minimumFractionDigits: selectedCurrency === 'CMEME' ? 2 : 2, 
      maximumFractionDigits: selectedCurrency === 'CMEME' ? 8 : 2 
    })} ${selectedCurrency}`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/subscription/subscribe', {
        currency: selectedCurrency
      });
      
      if (response.data.status === 'success') {
        alert(response.data.message);
        await fetchSubscriptionStatus();
        if (refetchUserData) {
          await refetchUserData();
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const feeCMEME = subscriptionStatus.subscription_fee_cmeme || 1500;
  const feeUSDC = subscriptionStatus.subscription_fee_usdc || 1500;
  const balanceCMEME = subscriptionStatus.user_balance_cmeme || 0;
  const balanceUSDC = subscriptionStatus.user_balance_usdc || 0;
  const canPayCMEME = subscriptionStatus.can_pay_cmeme || false;
  const canPayUSDC = subscriptionStatus.can_pay_usdc || false;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Subscription</h2>

      {/* Subscription Card */}
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border ${
        subscriptionStatus.has_subscribed 
          ? 'border-green-500/30' 
          : 'border-yellow-500/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            subscriptionStatus.has_subscribed 
              ? 'bg-green-500/20' 
              : 'bg-yellow-500/20'
          }`}>
            <Crown 
              size={32} 
              className={subscriptionStatus.has_subscribed ? 'text-green-400' : 'text-yellow-400'} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              {subscriptionStatus.has_subscribed 
                ? 'Subscription Active' 
                : 'Premium Subscription'}
            </h3>
            
            {subscriptionStatus.has_subscribed ? (
              <div className="space-y-2">
                <p className="text-green-400 flex items-center gap-2">
                  <CheckCircle size={16} />
                  You are a premium subscriber!
                </p>
                {subscriptionStatus.subscribed_at && (
                  <p className="text-gray-400 text-sm">
                    Subscribed on: {new Date(subscriptionStatus.subscribed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown size={24} className="text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-semibold text-lg">Premium Subscription</p>
                      <p className="text-gray-300 text-sm">Choose your payment method</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      One-time payment - no recurring charges
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Unlock premium features
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Lifetime access
                    </p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* CMEME Option */}
                    <button
                      onClick={() => setSelectedCurrency('CMEME')}
                      disabled={!canPayCMEME}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCurrency === 'CMEME'
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      } ${!canPayCMEME ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Coins size={20} className={selectedCurrency === 'CMEME' ? 'text-yellow-400' : 'text-gray-400'} />
                        <span className={`font-semibold ${selectedCurrency === 'CMEME' ? 'text-yellow-400' : 'text-gray-300'}`}>
                          Pay with CMEME
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {feeCMEME.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} CMEME
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Balance: {balanceCMEME.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </p>
                      {!canPayCMEME && (
                        <p className="text-xs text-red-400 mt-1">Insufficient</p>
                      )}
                    </button>

                    {/* USDC Option */}
                    <button
                      onClick={() => setSelectedCurrency('USDC')}
                      disabled={!canPayUSDC}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedCurrency === 'USDC'
                          ? 'border-blue-400 bg-blue-400/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      } ${!canPayUSDC ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} className={selectedCurrency === 'USDC' ? 'text-blue-400' : 'text-gray-400'} />
                        <span className={`font-semibold ${selectedCurrency === 'USDC' ? 'text-blue-400' : 'text-gray-300'}`}>
                          Pay with USDC
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {feeUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Balance: {balanceUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {!canPayUSDC && (
                        <p className="text-xs text-red-400 mt-1">Insufficient</p>
                      )}
                    </button>
                  </div>
                </div>

                {/* Balance Check */}
                {selectedCurrency === 'CMEME' && !canPayCMEME && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      Insufficient CMEME balance. You need {((feeCMEME - balanceCMEME).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }))} more CMEME tokens.
                    </p>
                  </div>
                )}

                {selectedCurrency === 'USDC' && !canPayUSDC && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      Insufficient USDC balance. You need {((feeUSDC - balanceUSDC).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} more USDC.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={loading || !subscriptionStatus.can_subscribe || (selectedCurrency === 'CMEME' ? !canPayCMEME : !canPayUSDC)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown size={20} />
                      Subscribe Now - Pay {selectedCurrency === 'CMEME' 
                        ? `${feeCMEME.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} CMEME`
                        : `${feeUSDC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`}
                    </>
                  )}
                </button>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <p className="text-blue-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    This is a one-time subscription payment. You can only subscribe once.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      {!subscriptionStatus.has_subscribed && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Premium Subscription Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Premium Features</p>
                <p className="text-gray-400 text-sm">Unlock all premium platform features</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">One-Time Payment</p>
                <p className="text-gray-400 text-sm">No recurring charges or fees</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CheckCircle size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Lifetime Access</p>
                <p className="text-gray-400 text-sm">Premium status forever</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Crown size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Premium Badge</p>
                <p className="text-gray-400 text-sm">Display your premium status</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
