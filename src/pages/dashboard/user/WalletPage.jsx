import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Wallet, Check, Copy, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import api from "../../../utils/api";
import toast from 'react-hot-toast';

const WalletPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletStatus, setWalletStatus] = useState(null);
  const { userData, refetchUserData } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const fetchWalletStatus = async () => {
    try {
      const response = await api.get('/wallet/status');
      setWalletStatus(response.data.data);
      
      // Pre-fill the input with existing wallet address for updates
      if (response.data.data.wallet_address) {
        setWalletAddress(response.data.data.wallet_address);
      }
    } catch (error) {
      console.error('Error fetching wallet status:', error);
      toast.error('Failed to fetch wallet status');
    }
  };

  const handleConnectWallet = async (e) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      toast.error('Please enter your wallet address');
      return;
    }

    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      toast.error('Please enter a valid Base Network wallet address (0x followed by 40 characters)');
      return;
    }

    try {
      setLoading(true);
      
      // Check if user already has a wallet
      if (walletStatus?.has_existing_wallet) {
        // Update existing wallet
        await api.post('/wallet/update', {
          wallet_address: walletAddress,
          network: 'base'
        });
        toast.success('Wallet address updated successfully!');
      } else {
        // Connect new wallet
        await api.post('/wallet/connect', {
          wallet_address: walletAddress,
          network: 'base'
        });
        toast.success('Wallet connected successfully! You can now claim your 0.5 CMEME bonus in the Tasks section.');
      }

      await refetchUserData();
      await fetchWalletStatus();
      
      // Navigate back to tasks after successful connection/update
      navigate('/dashboard/tasks');
      
    } catch (error) {
      console.error('Error with wallet operation:', error);
      toast.error(error.response?.data?.message || 'Failed to process wallet operation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletStatus?.wallet_address) {
      navigator.clipboard.writeText(walletStatus.wallet_address);
      setCopied(true);
      toast.success('Wallet address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isConnected = walletStatus?.wallet_connected;
  const hasExistingWallet = walletStatus?.has_existing_wallet;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500">
          <Wallet size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            {isConnected ? 'Wallet Connected' : 'Connect Base Network Wallet'}
          </h2>
          <p className="text-gray-400">
            {isConnected 
              ? 'Your Base Network wallet is successfully connected' 
              : 'Connect your Base Network wallet to earn 0.5 bonus CMEME tokens'
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connect/Update Wallet Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-100 mb-4">
            {hasExistingWallet ? 'Update Wallet Address' : 'Connect Your Wallet'}
          </h3>

          <form onSubmit={handleConnectWallet} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Base Network Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 font-mono text-sm"
              />
              <p className="text-gray-400 text-xs mt-2">
                Only Base Network addresses are supported (0x...)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !walletAddress.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {hasExistingWallet ? 'Updating...' : 'Connecting...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {hasExistingWallet ? <RefreshCw size={20} /> : <Wallet size={20} />}
                  {hasExistingWallet ? 'Update Wallet' : 'Connect Wallet (+0.5 CMEME Bonus)'}
                </div>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-semibold text-sm mb-1">Important Information</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Only Base Network addresses are supported</li>
                  <li>• You can only connect one wallet address</li>
                  <li>• You'll earn 0.5 bonus CMEME tokens for connecting</li>
                  <li>• After connecting, claim your bonus in the Tasks section</li>
                  <li>• You can update your wallet address anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Wallet Status</h3>
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-green-400" />
                  <span className="text-green-400 font-semibold">Connected</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-gray-100 font-semibold">Base Network</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-100 font-mono">
                      {formatAddress(walletStatus?.wallet_address)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      {copied ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${
                    walletStatus?.wallet_bonus_claimed ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {walletStatus?.wallet_bonus_claimed ? 'Bonus Claimed' : 'Bonus Available in Tasks'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Connected:</span>
                  <span className="text-gray-100">
                    {walletStatus?.wallet_connected_at 
                      ? new Date(walletStatus.wallet_connected_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Removed the claim bonus button - claiming is now done in Tasks */}
              {!walletStatus?.wallet_bonus_claimed && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 text-sm text-center">
                    Go to <strong>Tasks</strong> section to claim your 0.5 CMEME bonus
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet size={48} className="text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-gray-300 mb-2">No Wallet Connected</h4>
              <p className="text-gray-400">
                Connect your Base Network wallet to start earning rewards
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;