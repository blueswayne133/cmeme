// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from "react";
import { Save, Wallet, Copy, Check, DollarSign, TrendingUp, TrendingDown, AlertCircle, Infinity } from "lucide-react";
import api from "../../../utils/api";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    wallet: {
      deposit_address: '',
      network: 'base',
      token: 'USDC',
      min_deposit: 10
    },
    token: {
      cmeme_rate: 0.2
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rateHistory, setRateHistory] = useState([]);
  const [rateChange, setRateChange] = useState({ percentage: 0, direction: 'same' });

  useEffect(() => {
    fetchSettings();
    fetchRateHistory();
  }, []);

  // Calculate rate change when rate updates
  useEffect(() => {
    if (rateHistory.length > 0 && settings.token?.cmeme_rate) {
      const previousRate = rateHistory[0]?.new_rate || rateHistory[0]?.rate;
      if (previousRate) {
        const percentage = ((settings.token.cmeme_rate - previousRate) / previousRate) * 100;
        setRateChange({
          percentage: Math.abs(percentage),
          direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'same'
        });
      }
    }
  }, [settings.token?.cmeme_rate, rateHistory]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const data = response.data.data || {
        wallet: {
          deposit_address: '',
          network: 'base',
          token: 'USDC',
          min_deposit: 10
        },
        token: {
          cmeme_rate: 0.2
        }
      };
      
      if (!data.token) {
        data.token = { cmeme_rate: 0.2 };
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRateHistory = async () => {
    try {
      const response = await api.get('/admin/token-rate/history');
      setRateHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rate history:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings', settings);
      alert('Settings saved successfully!');
      
      // Refresh rate history after saving
      await fetchRateHistory();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateWalletSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        [key]: value
      }
    }));
  };

  const updateTokenSetting = (key, value) => {
    // Allow any numeric value, including 0 and negative numbers
    const numericValue = value === '' ? 0 : parseFloat(value);
    setSettings(prev => ({
      ...prev,
      token: {
        ...prev.token,
        [key]: isNaN(numericValue) ? 0 : numericValue
      }
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    }).format(value);
  };

  // Quick rate adjustment buttons
  const quickAdjustRates = [
    { label: '+10%', multiplier: 1.1 },
    { label: '+25%', multiplier: 1.25 },
    { label: '+50%', multiplier: 1.5 },
    { label: '2x', multiplier: 2 },
    { label: '10x', multiplier: 10 },
    { label: '-10%', multiplier: 0.9 },
    { label: '-25%', multiplier: 0.75 },
    { label: '-50%', multiplier: 0.5 },
    { label: '1/2', multiplier: 0.5 },
    { label: 'Reset to 0.2', multiplier: 0.2 / (settings.token?.cmeme_rate || 0.2) },
  ];

  const applyQuickAdjust = (multiplier) => {
    const currentRate = settings.token?.cmeme_rate || 0.2;
    const newRate = currentRate * multiplier;
    updateTokenSetting('cmeme_rate', newRate.toFixed(8));
  };

  // Set specific values
  const setSpecificRate = (rate) => {
    updateTokenSetting('cmeme_rate', rate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Settings</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage platform settings and token rates</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Rate Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">CMEME Token Rate</h2>
              <p className="text-gray-400">Set the current value of CMEME token</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Rate Display */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Current Rate:</span>
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(settings.token?.cmeme_rate || 0.2)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                1 CMEME = {formatCurrency(settings.token?.cmeme_rate || 0.2)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Infinity size={12} className="text-blue-400" />
                <span className="text-blue-400 text-xs">Unlimited rate adjustment</span>
              </div>
            </div>

            {/* Rate Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CMEME Token Rate (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  step="any" 
                  required
                  value={settings.token?.cmeme_rate || 0.2}
                  onChange={(e) => updateTokenSetting('cmeme_rate', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter any value..."
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                You can enter ANY numeric value - positive, negative, or zero
              </p>
            </div>

            {/* Common Values */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Common Values
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setSpecificRate(0.001)}
                  className="py-2 px-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-colors"
                >
                  $0.001
                </button>
                <button
                  onClick={() => setSpecificRate(0.01)}
                  className="py-2 px-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-colors"
                >
                  $0.01
                </button>
                <button
                  onClick={() => setSpecificRate(0.1)}
                  className="py-2 px-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-colors"
                >
                  $0.10
                </button>
                <button
                  onClick={() => setSpecificRate(1)}
                  className="py-2 px-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-colors"
                >
                  $1.00
                </button>
              </div>
            </div>

            {/* Quick Adjust Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Adjust
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {quickAdjustRates.map((adjustment, index) => (
                  <button
                    key={index}
                    onClick={() => applyQuickAdjust(adjustment.multiplier)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      adjustment.multiplier > 1 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' 
                        : adjustment.label.includes('Reset')
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    }`}
                  >
                    {adjustment.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Change Preview */}
            {rateHistory.length > 0 && rateChange.direction !== 'same' && (
              <div className={`rounded-xl p-4 border ${
                rateChange.direction === 'up' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {rateChange.direction === 'up' ? (
                    <TrendingUp size={16} className="text-green-400" />
                  ) : (
                    <TrendingDown size={16} className="text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    rateChange.direction === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Rate {rateChange.direction === 'up' ? 'Increase' : 'Decrease'}: {rateChange.percentage.toFixed(2)}%
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Previous rate: {formatCurrency(rateHistory[0]?.new_rate || rateHistory[0]?.rate)}
                </p>
              </div>
            )}

            {/* Warning for significant changes */}
            {rateChange.percentage > 50 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Significant Change</span>
                </div>
                <p className="text-yellow-400 text-xs mt-1">
                  You're changing the rate by {rateChange.percentage.toFixed(2)}%. This will affect all user balances.
                </p>
              </div>
            )}

            {/* Warning for zero or negative rates */}
            {(settings.token?.cmeme_rate <= 0) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Warning: Non-Positive Rate</span>
                </div>
                <p className="text-red-400 text-xs mt-1">
                  The rate is set to {formatCurrency(settings.token?.cmeme_rate)}. Users will see zero or negative USD values.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Wallet Settings</h2>
              <p className="text-gray-400">Configure deposit wallet for users</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Deposit Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Wallet Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={settings.wallet?.deposit_address || ''}
                  onChange={(e) => updateWalletSetting('deposit_address', e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                />
                <button
                  onClick={() => handleCopy(settings.wallet?.deposit_address || '')}
                  disabled={!settings.wallet?.deposit_address}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed border border-gray-600 rounded-xl text-gray-300 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Network */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network *</label>
                <select
                  value={settings.wallet?.network || 'base'}
                  onChange={(e) => updateWalletSetting('network', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="base">Base Network</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                </select>
              </div>

              {/* Minimum Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Deposit *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={settings.wallet?.min_deposit || 10}
                  onChange={(e) => updateWalletSetting('min_deposit', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate History */}
      {rateHistory.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rate Change History</h3>
          <div className="space-y-3">
            {rateHistory.slice(0, 10).map((record, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-200 font-mono">{formatCurrency(record.new_rate || record.rate)}</span>
                    {record.change_percentage !== 0 && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        record.change_percentage > 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.change_percentage > 0 ? '↑' : '↓'} {Math.abs(record.change_percentage).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString()}
                    {record.reason && ` • ${record.reason}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;