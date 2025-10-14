import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Copy, Check, Twitter, Lock, ShieldCheck, Send, User, Mail, Calendar } from "lucide-react";
import api from "../../../utils/api";

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData, refetchUserData } = useOutletContext();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // If you want to fetch additional profile data, use:
      // const response = await api.get('/profile');
      // setProfileData(response.data.data);
      
      // For now, we'll use the userData from context
      setProfileData(userData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const displayData = profileData || userData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Account Info</h2>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-gray-900">
              {displayData?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100">{displayData?.username || 'User'}</h3>
              <span className="text-sm text-gray-400">Regular Member</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>User ID</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 font-mono">{displayData?.uid || 'Loading...'}</span>
              <button
                onClick={() => handleCopy(displayData?.uid)}
                className="p-1 rounded hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-t border-gray-700/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <User size={16} />
              <span>Full Name</span>
            </div>
            <p className="text-gray-100">
              {displayData?.first_name || 'N/A'} {displayData?.last_name || ''}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail size={16} />
              <span>Email Address</span>
            </div>
            <p className="text-gray-100">{displayData?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="py-3 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <span>Wallet Address</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded-lg text-blue-400 font-mono text-sm break-all">
              {displayData?.wallet_address || displayData?.walletAddress || '0x...'}
            </code>
            <button
              onClick={() => handleCopy(displayData?.wallet_address || displayData?.walletAddress)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Account Options */}
        <div className="space-y-3 pt-4">
          <button className="flex justify-between items-center w-full py-3 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg transition-colors px-2">
            <div className="flex items-center gap-3 text-gray-300">
              <ShieldCheck size={18} />
              <span>Account Verification</span>
            </div>
            <span className={`text-sm font-semibold ${
              displayData?.is_verified || displayData?.verified 
                ? "text-green-400" 
                : "text-yellow-400"
            }`}>
              {displayData?.is_verified || displayData?.verified ? "Verified" : "Pending"}
            </span>
          </button>

          <button className="flex justify-between items-center w-full py-3 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg transition-colors px-2">
            <div className="flex items-center gap-3 text-gray-300">
              <Lock size={18} />
              <span>Security Settings</span>
            </div>
            <span className="text-gray-400 text-sm">Manage</span>
          </button>

          <button className="flex justify-between items-center w-full py-3 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg transition-colors px-2">
            <div className="flex items-center gap-3 text-gray-300">
              <Twitter size={18} />
              <span>Twitter Connection</span>
            </div>
            <span className="text-gray-400 text-sm">
              {displayData?.twitter_linked ? "Connected" : "Not Connected"}
            </span>
          </button>

          <button className="flex justify-between items-center w-full py-3 hover:bg-gray-700/20 rounded-lg transition-colors px-2">
            <div className="flex items-center gap-3 text-gray-300">
              <Send size={18} />
              <span>Telegram Connection</span>
            </div>
            <span className="text-gray-400 text-sm">
              {displayData?.telegram_linked ? "Connected" : "Not Connected"}
            </span>
          </button>
        </div>

        {/* Referral Information */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Referral Code</p>
              <p className="text-yellow-400 font-mono font-semibold">
                {displayData?.referral_code || 'N/A'}
              </p>
            </div>
            <button
              onClick={() => handleCopy(displayData?.referral_code)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all text-sm"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">CMEME Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              {displayData?.token_balance || displayData?.totalBalance || '0.00'}
            </span>
            <span className="text-lg font-semibold text-yellow-400">CMEME</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">USDC Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">
              ${displayData?.usdc_balance?.toFixed(2) || '0.00'}
            </span>
            <span className="text-lg font-semibold text-blue-400">USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;