// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from "react";
import { Save, Wallet, Copy, Check } from "lucide-react";
import api from "../../../utils/api";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    wallet: {
      deposit_address: '',
      network: 'base',
      token: 'USDC',
      min_deposit: 10
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.data || {
        wallet: {
          deposit_address: '',
          network: 'base',
          token: 'USDC',
          min_deposit: 10
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings', settings);
      alert('Wallet settings saved successfully!');
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
            <p className="text-gray-400 text-sm sm:text-base">Manage platform wallet settings</p>
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

        <div className="space-y-6 max-w-2xl">
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
            <p className="text-gray-400 text-xs mt-2">
              This wallet address will be shown to users for USDC deposits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
                <option value="bsc">BSC</option>
              </select>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token *</label>
              <select
                value={settings.wallet?.token || 'USDC'}
                onChange={(e) => updateWalletSetting('token', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
                <option value="MATIC">MATIC</option>
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

          {/* Preview Card */}
          {settings.wallet?.deposit_address && (
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Wallet Address:</span>
                  <code className="text-blue-400 font-mono text-sm">
                    {settings.wallet.deposit_address.slice(0, 10)}...{settings.wallet.deposit_address.slice(-8)}
                  </code>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-gray-200 capitalize">{settings.wallet.network}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Token:</span>
                  <span className="text-gray-200">{settings.wallet.token}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Min Deposit:</span>
                  <span className="text-gray-200">{settings.wallet.min_deposit} {settings.wallet.token}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;