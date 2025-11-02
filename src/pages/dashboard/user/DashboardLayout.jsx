// src/pages/dashboard/user/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "../../../utils/localStorage";
import api from "../../../utils/api";
import {
  Menu,
  X,
  User,
  Home,
  CheckSquare,
  Users,
  Trophy,
  Wallet,
  History,
  LogOut,
  Copy,
  Check,
  Lock,
  FileText,
  Download,
  Link,
  ArrowUpDown,
  Clock,
  BarChart3,
} from "lucide-react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositConfirmModalOpen, setDepositConfirmModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [fromWallet, setFromWallet] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendDescription, setSendDescription] = useState("");
  const [fundType, setFundType] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("23:56:35");
  const [settings, setSettings] = useState({
    wallet: {
      deposit_address: '',
      network: 'base',
      token: 'USDC',
      min_deposit: 10
    }
  });
  
  // Deposit Wallet Address State
  const [depositWalletAddress, setDepositWalletAddress] = useState("");
  
  // Avatar Modal States
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("adventurer");
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const navigate = useNavigate();
  const location = useLocation();

  // List of available DiceBear avatar styles
  const avatarStyles = [
    "adventurer",
    "adventurer-neutral",
    "bottts",
    "fun-emoji",
    "identicon",
    "micah",
    "pixel-art",
    "pixel-art-neutral",
    "rings",
    "shapes",
    "thumbs",
  ];

  // Generate avatar URL using DiceBear
  const generateAvatarUrl = (username, style) => {
    const seed = encodeURIComponent(username || "guest");
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  // Fetch deposit wallet address from settings
  const fetchDepositWalletAddress = async () => {
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
   
      setDepositWalletAddress(response.data.data.address || '');
    } catch (error) {
      console.error('Error fetching deposit wallet:', error);
      // Fallback to user's wallet address if settings fail
      setDepositWalletAddress(userData?.walletAddress || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    }
  };

  useEffect(() => {
    const user = getUserFromLocalStorage();
    const token = localStorage.getItem('authToken');
    
    if (!user || !token) {
      navigate('/auth');
      return;
    }
    
    fetchUserData();
  }, [navigate]);

  // Fetch deposit wallet when user data is loaded
  useEffect(() => {
    if (userData) {
      fetchDepositWalletAddress();
    }
  }, [userData]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, minutes, seconds] = timeRemaining.split(":").map(Number)
      let totalSeconds = hours * 3600 + minutes * 60 + seconds - 1

      if (totalSeconds < 0) totalSeconds = 86399

      const newHours = Math.floor(totalSeconds / 3600)
      const newMinutes = Math.floor((totalSeconds % 3600) / 60)
      const newSeconds = totalSeconds % 60

      setTimeRemaining(
        `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining]);

  // Auto-assign default avatar on first load if none exists
  useEffect(() => {
    if (userData && !userData.avatar_url && userData.username) {
      const defaultUrl = generateAvatarUrl(userData.username, "adventurer");
      setSelectedAvatar(defaultUrl);
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user');
      const responseData = response.data.data || response.data;

      // normalize data
      const normalizedUser = {
        ...responseData.user,
        token_balance: Number(responseData.user.token_balance) || 0,
        usdc_balance: Number(responseData.user.usdc_balance) || 0,
        is_verified: Boolean(responseData.user.is_verified),
        username: responseData.user.username || 'User',
        uid: responseData.user.uid || 'UID123456789',
        walletAddress: responseData.user.wallet_address || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        totalBalance: Number(responseData.user.token_balance) || 0,
        totalUSD: Number(responseData.user.usdc_balance) || 0,
        miningProgress: 0,
        dailyReward: 50,
        streak: 2,
        referral_code: responseData.user.referral_code || 'N/A',
        p2p_success_rate: responseData.user.p2p_success_rate || 100,
        avatar_url: responseData.user.avatar_url || '',
      };

      setUserData(normalizedUser);
      setSelectedAvatar(normalizedUser.avatar_url || generateAvatarUrl(normalizedUser.username, selectedStyle));
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        removeUserFromLocalStorage();
        navigate('/auth');
      } else {
        setError("Failed to load user data. Please try again.");
        // Fallback to mock data
        setUserData({
          username: "demo",
          tokens: 885,
          verified: false,
          uid: "UID123456789",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          totalBalance: 100,
          totalUSD: 10.0,
          miningProgress: 0,
          dailyReward: 50,
          streak: 2,
          token_balance: 100,
          usdc_balance: 10.0,
          is_verified: false,
          referral_code: "cmemeAB",
          p2p_success_rate: 100,
          avatar_url: "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeUserFromLocalStorage();
      navigate('/auth');
    }
  };

  // Avatar Modal Functions
  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setSelectedStyle(newStyle);
    const newUrl = generateAvatarUrl(userData?.username, newStyle);
    setSelectedAvatar(newUrl);
  };

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const newUrl = generateAvatarUrl(randomSeed, selectedStyle);
    setSelectedAvatar(newUrl);
  };

  const handleSaveAvatar = async () => {
    try {
      await api.post("/user/update-avatar", { avatar_url: selectedAvatar });
      // Update local user data
      setUserData((prev) => ({ ...prev, avatar_url: selectedAvatar }));
      setAvatarModalOpen(false);
      showToast('Avatar updated successfully!', 'success');
    } catch (err) {
      console.error("Error saving avatar:", err);
      showToast('Failed to save avatar. Try again.', 'error');
    }
  };

  const openAvatarModal = () => {
    const initialUrl = userData?.avatar_url || generateAvatarUrl(userData?.username, selectedStyle);
    setSelectedAvatar(initialUrl);
    setAvatarModalOpen(true);
  };

  // Deposit Confirmation Handler
  const handleConfirmDeposit = async () => {
    try {
      const response = await api.post('/deposits/confirm', {
        amount: parseFloat(depositAmount),
        transaction_hash: transactionHash,
        from_wallet: fromWallet,
        currency: 'USDC',
        network: 'base'
      });

      if (response.data.status === 'success') {
        showToast('Deposit confirmed! Waiting for approval.', 'success');
        setDepositConfirmModalOpen(false);
        setDepositAmount("");
        setTransactionHash("");
        setFromWallet("");
        setFundType(null);
        
        // Refresh user data
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error confirming deposit:', error);
      showToast(error.response?.data?.message || 'Failed to confirm deposit', 'error');
    }
  };

  // Send Token Handler
  const handleSendToken = async () => {
    try {
      const response = await api.post('/transactions/send', {
        amount: parseFloat(sendAmount),
        recipient_address: recipientAddress,
        description: sendDescription || `Transfer to ${recipientAddress}`,
        currency: 'CMEME'
      });

      if (response.data.status === 'success') {
        showToast(`Successfully sent ${sendAmount} CMEME tokens!`, 'success');
        setSendModalOpen(false);
        setSendAmount("");
        setRecipientAddress("");
        setSendDescription("");
        
        // Refresh user data to update balances
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error sending token:', error);
      showToast(error.response?.data?.message || 'Failed to send tokens', 'error');
    }
  };

  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/dashboard/kyc', label: 'KYC Verification', icon: FileText },
    { path: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/dashboard/referrals', label: 'Referrals', icon: Users },
    { path: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/dashboard/about', label: 'About Us', icon: Users },
  ];

  const walletNavItems = [
    { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { path: '/dashboard/history', label: 'History', icon: History },
    
  ];

  const p2pNavItems = [
    { path: '/dashboard/p2p', label: 'P2P Trading', icon: ArrowUpDown },
    { path: '/dashboard/p2p/active', label: 'Active Trades', icon: Clock },
    { path: '/dashboard/p2p/history', label: 'P2P History', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          active
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg"
            : "text-gray-300 hover:bg-gray-800/50"
        }`}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </button>
    );
  };

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[toast.type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform transition-transform duration-300 animate-in slide-in-from-right`}>
        <div className="flex items-center space-x-2">
          <Check size={20} />
          <span>{toast.message}</span>
        </div>
      </div>
    );
  };

  // Avatar Modal
  const renderAvatarModal = () => {
    if (!avatarModalOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setAvatarModalOpen(false)}
      >
        <div
          className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Choose Your Avatar</h2>
            <button
              onClick={() => setAvatarModalOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-5">
            {/* Avatar Style Dropdown */}
            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Avatar Style</label>
              <select
                value={selectedStyle}
                onChange={handleStyleChange}
                className="bg-gray-800 text-gray-100 rounded-lg px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
              >
                {avatarStyles.map((style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center">
              <img
                src={selectedAvatar}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
              />
            </div>

            {/* Randomize Button */}
            <button
              onClick={handleRandomize}
              className="py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
            >
              🎲 Randomize Avatar
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleSaveAvatar}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fund Modal content
  const renderFundModal = () => {
    if (!fundModalOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setFundModalOpen(false)}
      >
        <div
          className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Fund Account</h2>
            <button
              onClick={() => setFundModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {!fundType ? (
            <div className="p-6 space-y-4">
              <p className="text-gray-400 mb-4">Choose funding method:</p>
              <button
                onClick={() => setFundType("cmeme")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg"
              >
                Fund with CMEME
              </button>
              <button
                onClick={() => setFundType("usdc")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-all shadow-lg"
              >
                Fund with USDC
              </button>
            </div>
          ) : fundType === "cmeme" ? (
            <div className="p-6 space-y-4">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Your UID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-950 px-3 py-2 rounded-lg text-yellow-400 font-mono text-sm">
                    {userData?.uid}
                  </code>
                  <button
                    onClick={() => handleCopy(userData?.uid)}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Share this UID with the sender. Transaction will be auto-verified.
              </p>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm">✓ You can withdraw CMEME tokens anytime</p>
              </div>
              <button
                onClick={() => {
                  setFundType(null)
                  setFundModalOpen(false)
                }}
                className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 space-y-3">
                <p className="text-gray-400 text-sm">Deposit Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-950 px-3 py-2 rounded-lg text-blue-400 font-mono text-xs break-all">
                    {settings.wallet?.deposit_address || 'Loading...'}
                  </code>
                  <button
                    onClick={() => handleCopy(settings.wallet?.deposit_address)}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-gray-300" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-gray-200">Base Network</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Token:</span>
                    <span className="text-gray-200">USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min. Deposit:</span>
                    <span className="text-gray-200">10 USDC</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm">
                  ✓ USDC deposits can be withdrawn after approval
                </p>
              </div>

              <p className="text-gray-400 text-sm">
                Send USDC to the address above on Base Network, then confirm your deposit below.
              </p>

              <button
                onClick={() => {
                  // Open deposit confirmation modal
                  setFundModalOpen(false);
                  setTimeout(() => {
                    setDepositConfirmModalOpen(true);
                  }, 300);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-all shadow-lg"
              >
                I've Sent USDC - Confirm Deposit
              </button>

              <button
                onClick={() => {
                  setFundType(null)
                  setFundModalOpen(false)
                }}
                className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Send Token Modal
  const renderSendModal = () => {
    if (!sendModalOpen) return null;

    const isValid = sendAmount && parseFloat(sendAmount) > 0 && recipientAddress;
    const availableBalance = userData?.token_balance || 0;
    const transferFee = 0.5;
    const totalAmount = (parseFloat(sendAmount) || 0) + transferFee;

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSendModalOpen(false)}
      >
        <div
          className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Send CMEME Tokens</h2>
            <button
              onClick={() => setSendModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Recipient UID or Wallet Address</label>
              <input
                type="text"
                placeholder="Enter recipient UID or wallet address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Amount (CMEME)</label>
              <input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
              <p className="text-xs text-gray-400">
                Available: {availableBalance} CMEME
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
              <input
                type="text"
                placeholder="Add a note for this transaction"
                value={sendDescription}
                onChange={(e) => setSendDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transfer Amount:</span>
                <span className="text-gray-200">{sendAmount || '0'} CMEME</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee:</span>
                <span className="text-red-400">{transferFee} CMEME</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                <span className="text-gray-300 font-medium">Total Deducted:</span>
                <span className="text-yellow-400 font-bold">{totalAmount.toFixed(2)} CMEME</span>
              </div>
            </div>

            {totalAmount > availableBalance && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">
                  ⚠️ Insufficient balance. You need {totalAmount.toFixed(2)} CMEME but only have {availableBalance} CMEME available.
                </p>
              </div>
            )}

            <button 
              onClick={handleSendToken}
              disabled={!isValid || totalAmount > availableBalance}
              className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                isValid && totalAmount <= availableBalance
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isValid && totalAmount <= availableBalance ? 'Send Tokens' : 'Fill All Fields'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Deposit Confirmation Modal
  const renderDepositConfirmModal = () => {
    if (!depositConfirmModalOpen) return null;

    const isValid = depositAmount && parseFloat(depositAmount) >= 10 && transactionHash && fromWallet;

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setDepositConfirmModalOpen(false)}
      >
        <div
          className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Confirm USDC Deposit</h2>
            <button
              onClick={() => setDepositConfirmModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Amount Sent (USDC)</label>
              <input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <p className="text-xs text-gray-400">
                Minimum deposit: 10 USDC
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Transaction Hash</label>
              <input
                type="text"
                placeholder="Enter transaction hash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">From Wallet Address</label>
              <input
                type="text"
                placeholder="Enter your wallet address"
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                ℹ️ Your deposit will be reviewed and approved within 24 hours. You'll be notified once approved.
              </p>
            </div>

            <button 
              onClick={handleConfirmDeposit}
              disabled={!isValid}
              className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                isValid 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isValid ? 'Confirm Deposit' : 'Fill All Fields'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Withdraw Modal content
  const renderWithdrawModal = () => {
    if (!withdrawModalOpen) return null;

    const minWithdrawal = 5;
    const gasFee = 1.5;
    const availableUSDC = userData?.usdc_balance || 0;
    const netAmount = (parseFloat(withdrawAmount) || 0) - gasFee;
    const isValid = (parseFloat(withdrawAmount) || 0) >= minWithdrawal && netAmount > 0;

    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setWithdrawModalOpen(false)}
      >
        <div
          className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">Withdraw USDC</h2>
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Available Balance */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-gray-100">${availableUSDC.toFixed(2)} USDC</p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Withdrawal Amount (USDC)</label>
              <input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50"
              />
              <p className="text-xs text-gray-400">
                Minimum withdrawal: ${minWithdrawal} USDC
              </p>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Withdrawal Amount:</span>
                <span className="text-gray-200">${(parseFloat(withdrawAmount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gas Fee:</span>
                <span className="text-red-400">-${gasFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                <span className="text-gray-300 font-medium">You Receive:</span>
                <span className={`font-bold ${netAmount > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  ${netAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ Withdrawals may take 10-30 minutes to process on the blockchain
              </p>
            </div>

            {/* Withdraw Button */}
            <button 
              onClick={() => {
                if (isValid) {
                  // Handle withdrawal logic here
                  showToast(`Withdrawal initiated: $${withdrawAmount} USDC`, 'success');
                  setWithdrawModalOpen(false);
                  setWithdrawAmount("");
                }
              }}
              disabled={!isValid}
              className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                isValid 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isValid ? 'Confirm Withdrawal' : 'Enter Valid Amount'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
      {/* Toast Notifications */}
      <Toast />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-gray-700/50">
        <div className="flex flex-col h-full bg-[#0f1419] text-gray-200 overflow-y-auto">

          {/* Profile Section */}
          <div className="px-6 py-4 space-y-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div 
                onClick={openAvatarModal}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-gray-900 cursor-pointer hover:scale-105 transition-transform relative"
              >
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  userData?.username?.charAt(0).toUpperCase() || 'U'
                )}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold px-1 py-0.5 rounded shadow text-[10px]">
                  Edit
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{userData?.username || 'User'}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400">{userData?.uid || 'Loading...'}</p>
                  <button
                    onClick={() => handleCopy(userData?.uid)}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    {copied ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-gray-300" />
                    )}
                  </button> 
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                userData?.is_verified
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {userData?.is_verified ? "✓ Verified" : "Not Verified"}
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                Main
              </h3>
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* P2P Trading */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                P2P Trading
              </h3>
              {p2pNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* Wallet & Trading */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                Wallet & Trading
              </h3>
              {walletNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* Staking & Withdrawals */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                Staking & Withdrawals
              </h3>
              
              {/* USDC Withdrawal - Enabled */}
              <button 
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all font-medium"
              >
                <div className="flex items-center gap-3">
                  <Download size={20} />
                  <span>Withdraw USDC</span>
                </div>
                <span className="text-xs bg-green-500/30 px-2 py-1 rounded">Available</span>
              </button>

              {/* CMEME Withdrawal - Locked */}
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                <div className="flex items-center gap-3">
                  <Lock size={20} />
                  <span>Withdraw CMEME</span>
                </div>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
              </button>

              {/* Staking Options - Both Locked */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                  <div className="flex items-center gap-3">
                    <Lock size={20} />
                    <span>Stake CMEME</span>
                  </div>
                  <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                  <div className="flex items-center gap-3">
                    <Lock size={20} />
                    <span>Stake USDC</span>
                  </div>
                  <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 w-80 h-full z-50 lg:hidden shadow-2xl">
            <div className="flex flex-col h-full bg-[#0f1419] text-gray-200 overflow-y-auto">
              {/* Close button - mobile only */}
              <div className="flex justify-end p-4 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Rest of sidebar content same as desktop */}
              {/* Profile Section */}
              <div className="px-6 py-4 space-y-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => {
                      openAvatarModal();
                      setSidebarOpen(false);
                    }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-gray-900 cursor-pointer hover:scale-105 transition-transform relative"
                  >
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt="User Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      userData?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold px-1 py-0.5 rounded shadow text-[10px]">
                      Edit
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{userData?.username || 'User'}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">{userData?.uid || 'Loading...'}</p>
                      <button
                        onClick={() => handleCopy(userData?.uid)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                      >
                        {copied ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} className="text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verification Badge */}
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                    userData?.is_verified
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {userData?.is_verified ? "✓ Verified" : "Not Verified"}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                    Main
                  </h3>
                  {mainNavItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>

                {/* P2P Trading */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                    P2P Trading
                  </h3>
                  {p2pNavItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>

                {/* Wallet & Trading */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                    Wallet & Trading
                  </h3>
                  {walletNavItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>

                {/* Staking & Withdrawals */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                    Staking & Withdrawals
                  </h3>
                  
                  {/* USDC Withdrawal - Enabled */}
                  <button 
                    onClick={() => {
                      setWithdrawModalOpen(true);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <span>Withdraw USDC</span>
                    </div>
                    <span className="text-xs bg-green-500/30 px-2 py-1 rounded">Available</span>
                  </button>

                  {/* CMEME Withdrawal - Locked */}
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                    <div className="flex items-center gap-3">
                      <Lock size={20} />
                      <span>Withdraw CMEME</span>
                    </div>
                    <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
                  </button>

                  {/* Staking Options - Both Locked */}
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                      <div className="flex items-center gap-3">
                        <Lock size={20} />
                        <span>Stake CMEME</span>
                      </div>
                      <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium bg-gray-800/30 border border-gray-600/30">
                      <div className="flex items-center gap-3">
                        <Lock size={20} />
                        <span>Stake USDC</span>
                      </div>
                      <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">Locked</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="p-4 flex-shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <Menu size={24} className="text-gray-200" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-yellow-400">CMEME Token</h1>
                <p className="text-xs text-gray-400">Mining Platform</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/profile')}
              className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <User size={20} className="text-gray-200" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-4">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
              {error}
              <button 
                onClick={() => setError("")}
                className="float-right text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}
          <Outlet context={{ 
            userData, 
            refetchUserData: fetchUserData,
            setSendModalOpen,
            setFundModalOpen,
            setWithdrawModalOpen,
            timeRemaining
          }} />
        </main>
      </div>

      {/* Modals */}
      {renderAvatarModal()}
      {renderFundModal()}
      {renderSendModal()}
      {renderWithdrawModal()}
      {renderDepositConfirmModal()}
    </div>
  );
};

export default DashboardLayout;