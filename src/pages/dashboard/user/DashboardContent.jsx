import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../../utils/api";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const DashboardContent = () => {
  const [miningStatus, setMiningStatus] = useState({
    has_active_session: false,
    progress: 0,
    time_remaining: 86400,
    daily_reward: 50,
    streak: 2
  });
  const [loading, setLoading] = useState(false);
  const { userData, refetchUserData, setSendModalOpen, setFundModalOpen, setWithdrawModalOpen, timeRemaining } = useOutletContext();

  // Remove API call since endpoint doesn't exist
  // useEffect(() => {
  //   fetchMiningStatus();
  // }, []);

  // const fetchMiningStatus = async () => {
  //   try {
  //     const response = await api.get('/mining/status');
  //     setMiningStatus(response.data);
  //   } catch (error) {
  //     console.error('Error fetching mining status:', error);
  //     // Fallback to static data if API fails
  //     setMiningStatus({
  //       has_active_session: false,
  //       progress: 0,
  //       time_remaining: 86400,
  //       daily_reward: 50,
  //       streak: 2
  //     });
  //   }
  // };

  const handleStartMining = async () => {
    setLoading(true);
    try {
      // await api.post('/mining/start');
      // Simulate API call
      setTimeout(() => {
        setMiningStatus(prev => ({
          ...prev,
          has_active_session: true,
          progress: 50
        }));
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
      // await api.post('/mining/claim');
      // Simulate API call
      setTimeout(() => {
        setMiningStatus(prev => ({
          ...prev,
          has_active_session: false,
          progress: 0
        }));
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
            <span className="text-xl font-semibold text-yellow-400">MTK</span>
          </div>
          
          {/* USD Equivalent */}
          <p className="text-gray-400 text-sm mt-2">
            ≈ $
            {(
              (userData?.token_balance || userData?.totalBalance || 0) * 2
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
          <span className="text-gray-400 font-semibold">{miningStatus.progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${miningStatus.progress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">
          Next reward in: <span className="text-gray-200 font-mono font-semibold">{timeRemaining}</span>
        </p>
      </div>

      {/* Wait Button */}
      <button disabled className="w-full py-4 rounded-xl bg-gray-700/30 text-gray-500 font-semibold cursor-not-allowed">
        Wait for next reward
      </button>

      {/* Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Daily Reward</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{miningStatus.daily_reward}</span>
            <span className="text-lg font-semibold text-yellow-400">MTK</span>
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