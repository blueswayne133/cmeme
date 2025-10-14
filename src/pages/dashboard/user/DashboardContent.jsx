import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../../utils/api";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const DashboardContent = () => {
  const [miningStatus, setMiningStatus] = useState({
    has_active_session: false,
    progress: 0,
    time_remaining: 86400,
    daily_reward: 1,
    streak: 2
  });
  const [loading, setLoading] = useState(false);
  const { userData, refetchUserData, setSendModalOpen, setFundModalOpen, setWithdrawModalOpen, timeRemaining } = useOutletContext();

  // Initialize countdown from localStorage
  const [countdown, setCountdown] = useState(() => {
    const savedEndTime = localStorage.getItem('mining_end_time');
    if (savedEndTime) {
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(savedEndTime);
      const remaining = Math.max(0, endTime - now);
      
      // If there's remaining time, set active session
      if (remaining > 0) {
        setMiningStatus(prev => ({
          ...prev,
          has_active_session: true,
          progress: calculateProgress(remaining)
        }));
      }
      
      return remaining;
    }
    return 86400; // Default 24 hours
  });

  // Calculate progress based on remaining time
  const calculateProgress = (remainingTime) => {
    const totalTime = 86400; // 24 hours in seconds
    const elapsed = totalTime - remainingTime;
    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown effect
  useEffect(() => {
    // Only start countdown if there's active time remaining
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = prev - 1;
        
        // Update progress based on new countdown
        setMiningStatus(prevStatus => ({
          ...prevStatus,
          progress: calculateProgress(newCountdown)
        }));

        if (newCountdown <= 0) {
          clearInterval(timer);
          // Mining session completed
          setMiningStatus(prevStatus => ({
            ...prevStatus,
            has_active_session: false,
            progress: 100
          }));
          localStorage.removeItem('mining_end_time');
          return 0;
        }
        
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleStartMining = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const endTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
        localStorage.setItem('mining_end_time', endTime.toString());
        
        setMiningStatus(prev => ({
          ...prev,
          has_active_session: true,
          progress: 0
        }));
        setCountdown(86400);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error starting mining:', error);
      alert(error.response?.data?.message || 'Failed to start mining');
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setMiningStatus(prev => ({
          ...prev,
          has_active_session: false,
          progress: 0
        }));
        localStorage.removeItem('mining_end_time');
        setCountdown(86400);
        
        if (refetchUserData) {
          refetchUserData();
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert(error.response?.data?.message || 'Failed to claim reward');
      setLoading(false);
    }
  };

  // Start mining button with proper logic
  const renderMiningButton = () => {
    if (miningStatus.has_active_session) {
      if (countdown > 0) {
        return (
          <button disabled className="w-full py-4 rounded-xl bg-gray-700/30 text-gray-500 font-semibold cursor-not-allowed">
            Mining in progress... {formatTime(countdown)}
          </button>
        );
      } else {
        return (
          <button
            onClick={handleClaimReward}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        );
      }
    } else {
      return (
        <button
          onClick={handleStartMining}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Starting..." : "Start Mining"}
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
              (userData?.token_balance || userData?.totalBalance || 0) * 0.2
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

      {/* Mining Progress */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-100">Mining Progress</h3>
          <span className="text-gray-400 font-semibold">{Math.round(miningStatus.progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${miningStatus.progress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">
          Next reward in: <span className="text-gray-200 font-mono font-semibold">{formatTime(countdown)}</span>
        </p>
      </div>

      {/* Dynamic Mining Button */}
      {renderMiningButton()}

      {/* Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Daily Reward</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{miningStatus.daily_reward}</span>
            <span className="text-lg font-semibold text-yellow-400">CMEME</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{miningStatus.streak}</span>
            <span className="text-lg font-semibold text-yellow-400">days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;