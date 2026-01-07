import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../../utils/api";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const DashboardContent = () => {
  const [miningStatus, setMiningStatus] = useState({
    can_claim: true,
    last_claimed_at: null,
    next_claim_at: null,
    time_remaining: 0,
    progress: 0
  });
  const [loading, setLoading] = useState(false);
  const { userData, refetchUserData, setSendModalOpen, setFundModalOpen, setWithdrawModalOpen, timeRemaining } = useOutletContext();

  // Initialize mining status
  useEffect(() => {
    fetchMiningStatus();
  }, []);

  const fetchMiningStatus = async () => {
    try {
      const response = await api.get('/mining/status');
      setMiningStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching mining status:', error);
    }
  };

  // Countdown effect for next claim and progress calculation
  useEffect(() => {
    if (!miningStatus.can_claim && miningStatus.time_remaining > 0) {
      const timer = setInterval(() => {
        setMiningStatus(prev => {
          const newTimeRemaining = Math.max(0, prev.time_remaining - 1);
          const totalTime = 86400; // 24 hours in seconds
          const progress = Math.min(100, ((totalTime - newTimeRemaining) / totalTime) * 100);
          
          return {
            ...prev,
            time_remaining: newTimeRemaining,
            progress: progress
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (miningStatus.can_claim && miningStatus.time_remaining === 0) {
      // When claim is available, set progress to 100%
      setMiningStatus(prev => ({
        ...prev,
        progress: 100
      }));
    }
  }, [miningStatus.can_claim, miningStatus.time_remaining]);

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaimMining = async () => {
    setLoading(true);
    try {
      const response = await api.post('/mining/claim');
      
      if (response.data.status === 'success') {
        // Reset progress to 0 immediately
        setMiningStatus(prev => ({
          ...prev,
          can_claim: false,
          progress: 0,
          time_remaining: 86400 // Reset to 24 hours
        }));

        // Refresh mining status from server
        await fetchMiningStatus();
        
        // Refresh user data to update balances
        if (refetchUserData) {
          await refetchUserData();
        }
        
        alert('1 CMEME token claimed successfully!');
      }
    } catch (error) {
      console.error('Error claiming mining reward:', error);
      alert(error.response?.data?.message || 'Failed to claim mining reward');
    } finally {
      setLoading(false);
    }
  };

  // Render mining button
  const renderMiningButton = () => {
    if (miningStatus.can_claim) {
      return (
        <button
          onClick={handleClaimMining}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Claiming..." : "Claim 1 CMEME"}
        </button>
      );
    } else {
      return (
        <button 
          disabled 
          className="w-full py-4 rounded-xl bg-gray-700/30 text-gray-500 font-semibold cursor-not-allowed"
        >
          Next claim in: {formatTime(miningStatus.time_remaining)}
        </button>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Balance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-100">
              {userData?.token_balance || userData?.totalBalance || '0.00'}
            </span>
            <span className="text-xl font-semibold text-yellow-400">CMEME</span>
          </div>
          
          {/* USD Equivalent */}
          <p className="text-gray-400 text-sm mt-2">
            ≈ $
           {(
    (userData?.token_balance || userData?.totalBalance || 0) * 
    (userData?.cmeme_rate || userData?.data?.cmeme_rate || 0.2) // Use dynamic rate from user data
  ).toFixed(2)}
          </p>
        </div>

        {/* USDC Balance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Total USDC</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-100">
              ${userData?.usdc_balance?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xl font-semibold text-blue-400">USDC</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSendModalOpen && setSendModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowUpRight size={20} />
          <span>Send</span>
        </button>
        <button
          onClick={() => setFundModalOpen && setFundModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowDownLeft size={20} />
          <span>Fund</span>
        </button>
      </div>

      {/* Mining Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-100">Daily Mining</h3>
          <span className="text-gray-400 font-semibold">
            {miningStatus.can_claim ? 'Ready to Claim' : 'On Cooldown'}
          </span>
        </div>

        {/* Mining Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Mining Progress</span>
            <span className="text-sm font-semibold text-gray-300">{Math.round(miningStatus.progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${miningStatus.progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm">
            {miningStatus.can_claim ? (
              <span className="text-green-400">✅ Mining complete! Ready to claim</span>
            ) : (
              <>Next claim in: <span className="text-gray-200 font-mono font-semibold">{formatTime(miningStatus.time_remaining)}</span></>
            )}
          </p>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm text-center">
            💎 Claim 1 CMEME token every 24 hours
          </p>
        </div>

        {/* Mining Button */}
        {renderMiningButton()}

        {/* Info */}
        <div className="text-center text-gray-400 text-sm">
          {miningStatus.last_claimed_at && (
            <p>Last claimed: {new Date(miningStatus.last_claimed_at).toLocaleDateString()}</p>
          )}
          <p>Resets every 24 hours</p>
        </div>
      </div>

      {/* Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Daily Mining Reward</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">1</span>
            <span className="text-lg font-semibold text-yellow-400">CMEME</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Task Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{userData?.mining_streak || 0}</span>
            <span className="text-lg font-semibold text-yellow-400">days</span>
          </div>
          <p className="text-gray-400 text-xs mt-2">From daily tasks</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;