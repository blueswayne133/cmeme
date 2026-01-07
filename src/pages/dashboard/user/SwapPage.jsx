import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowUpDown, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import api from "../../../utils/api";

const SwapPage = () => {
  const { userData, refetchUserData } = useOutletContext();
  const [swapType, setSwapType] = useState('cmeme-to-usdc'); // 'cmeme-to-usdc' or 'usdc-to-cmeme'
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchPreview();
    } else {
      setPreview(null);
    }
  }, [amount, swapType]);

  const fetchPreview = async () => {
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
      console.error('Error fetching preview:', error);
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (preview && !preview.has_sufficient_balance) {
      alert(`Insufficient ${swapType === 'cmeme-to-usdc' ? 'CMEME' : 'USDC'} balance`);
      return;
    }

    if (!confirm(`Are you sure you want to swap ${amount} ${swapType === 'cmeme-to-usdc' ? 'CMEME' : 'USDC'}?`)) {
      return;
    }

    try {
      setLoading(true);
      const endpoint = swapType === 'cmeme-to-usdc' 
        ? '/swap/cmeme-to-usdc' 
        : '/swap/usdc-to-cmeme';
      
      const response = await api.post(endpoint, {
        amount: parseFloat(amount)
      });

      if (response.data.status === 'success') {
        alert(response.data.message);
        setAmount('');
        setPreview(null);
        if (refetchUserData) {
          await refetchUserData();
        }
      }
    } catch (error) {
      console.error('Error swapping:', error);
      alert(error.response?.data?.message || 'Failed to process swap');
    } finally {
      setLoading(false);
    }
  };

  const handleMax = () => {
    if (swapType === 'cmeme-to-usdc') {
      setAmount(userData?.token_balance || 0);
    } else {
      setAmount(userData?.usdc_balance || 0);
    }
  };

  const toggleSwapType = () => {
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

      {/* Swap Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
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
                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-lg font-semibold"
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
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
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
            disabled={loading || !amount || parseFloat(amount) <= 0 || (preview && !preview.has_sufficient_balance)}
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
            <ArrowRight size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Swap between CMEME tokens and USDC instantly</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Exchange rate is based on current CMEME rate: {userData?.cmeme_rate || 0.2} USDC per CMEME</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>Swaps are processed immediately and cannot be reversed</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p>All swaps are recorded in your transaction history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;

