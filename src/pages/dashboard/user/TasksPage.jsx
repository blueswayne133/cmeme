import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { CheckSquare, Play, TrendingUp, Twitter, Send, Clock, CheckCircle, Wallet, AlertCircle, X } from "lucide-react";
import api from "../../../utils/api";
import toast from 'react-hot-toast';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed_today: 0, total_earned_today: 0 });
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [socialHandle, setSocialHandle] = useState('');
  const { userData, refetchUserData } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
      toast.error('Failed to load task statistics');
    }
  };

  const handleCompleteTask = async (taskId, socialHandle = null) => {
    try {
      setCompletingTask(taskId);
      
      let response;
      if (socialHandle) {
        // For social tasks with handle
        response = await api.post(`/tasks/${taskId}/complete`, {
          social_handle: socialHandle
        });
      } else {
        // For regular tasks
        response = await api.post(`/tasks/${taskId}/complete`);
      }
      
      if (response.data.status === 'success') {
        // Refresh both tasks and stats
        await Promise.all([fetchTasks(), fetchTaskStats()]);
        
        // Refresh user data to update balances
        if (refetchUserData) {
          await refetchUserData();
        }
        
        toast.success(response.data.message || 'Task completed successfully!');
        
        // Close modal if open
        if (showSocialModal) {
          setShowSocialModal(false);
          setCurrentTask(null);
          setSocialHandle('');
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      
      // Special handling for wallet connection task
      if (error.response?.data?.message?.includes('wallet') || 
          error.response?.data?.message?.includes('connect')) {
        toast.error('Please connect your wallet first to complete this task.');
        navigate('/dashboard/wallet');
      } else {
        toast.error(error.response?.data?.message || 'Failed to complete task');
      }
    } finally {
      setCompletingTask(null);
    }
  };

  const handleClaimWalletBonus = async () => {
    try {
      setCompletingTask('wallet_bonus');
      const response = await api.post('/wallet/claim-bonus');
      
      if (response.data.status === 'success') {
        await Promise.all([fetchTasks(), fetchTaskStats()]);
        if (refetchUserData) {
          await refetchUserData();
        }
        toast.success(response.data.message || 'Wallet bonus claimed successfully!');
      }
    } catch (error) {
      console.error('Error claiming wallet bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to claim wallet bonus');
    } finally {
      setCompletingTask(null);
    }
  };

  const handleWalletTaskClick = () => {
    navigate('/dashboard/wallet');
  };

  const handleSocialTaskClick = (task) => {
    setCurrentTask(task);
    setShowSocialModal(true);
  };

  const submitSocialHandle = () => {
    if (!socialHandle.trim()) {
      toast.error('Please enter your social media handle');
      return;
    }

    handleCompleteTask(currentTask.id, socialHandle.trim());
  };

  const getTaskIcon = (taskType) => {
    switch (taskType) {
      case 'watch_ads':
        return <Play className="text-blue-400" size={24} />;
      case 'daily_streak':
        return <TrendingUp className="text-green-400" size={24} />;
      case 'connect_twitter':
        return <Twitter className="text-sky-400" size={24} />;
      case 'connect_telegram':
        return <Send className="text-blue-500" size={24} />;
      case 'connect_wallet':
        return <Wallet className="text-purple-400" size={24} />;
      default:
        return <CheckSquare className="text-gray-400" size={24} />;
    }
  };

  const getTaskButtonText = (task) => {
    if (task.is_completed) {
      return 'Completed';
    }
    
    if (completingTask === task.id) {
      return 'Processing...';
    }

    // Special handling for wallet task
    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.hasConnectedWallet?.();
      const hasClaimedBonus = userData?.walletDetail?.bonus_claimed;
      
      if (!isWalletConnected) {
        return 'Connect Wallet';
      } else if (isWalletConnected && !hasClaimedBonus) {
        return 'Claim 0.5 CMEME';
      } else if (hasClaimedBonus) {
        return 'Bonus Claimed';
      }
    }
    
    if (task.type === 'watch_ads') {
      return `Watch Ad (${task.current_attempts || 0}/${task.max_attempts})`;
    }
    
    return 'Complete Task';
  };

  const isTaskDisabled = (task) => {
    if (completingTask === task.id) return true;
    if (task.is_completed) return true;
    
    // Special logic for wallet task
    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.hasConnectedWallet?.();
      const hasClaimedBonus = userData?.walletDetail?.bonus_claimed;
      
      if (!isWalletConnected) return false; // Allow navigation to wallet page
      if (isWalletConnected && hasClaimedBonus) return true; // Disable if bonus claimed
      return false; // Allow claiming bonus
    }
    
    if (!task.can_complete) return true;
    return false;
  };

  const getTaskStatus = (task) => {
    if (task.is_completed) {
      return { text: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    
    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.hasConnectedWallet?.();
      const hasClaimedBonus = userData?.walletDetail?.bonus_claimed;
      
      if (!isWalletConnected) {
        return { text: 'Connect Wallet', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      } else if (isWalletConnected && !hasClaimedBonus) {
        return { text: 'Claim Bonus', color: 'text-blue-400', bg: 'bg-blue-500/20' };
      } else if (hasClaimedBonus) {
        return { text: 'Bonus Claimed', color: 'text-green-400', bg: 'bg-green-500/20' };
      }
    }
    
    if (!task.can_complete) {
      return { text: 'Unavailable', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
    
    return { text: 'Available', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  };

  const handleTaskAction = (task) => {
    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.hasConnectedWallet?.();
      const hasClaimedBonus = userData?.walletDetail?.bonus_claimed;
      
      if (!isWalletConnected) {
        handleWalletTaskClick();
      } else if (isWalletConnected && !hasClaimedBonus) {
        handleClaimWalletBonus();
      }
      // If bonus already claimed, do nothing (button disabled)
    } else if (task.type === 'connect_twitter' || task.type === 'connect_telegram') {
      handleSocialTaskClick(task);
    } else {
      handleCompleteTask(task.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500">
          <CheckSquare size={32} className="text-gray-900" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Daily Tasks</h2>
          <p className="text-gray-400">Complete tasks to earn bonus CMEME tokens</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.completed_today || 0}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-100">
              {tasks.length}
            </div>
            <div className="text-gray-400 text-sm">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.total_earned_today?.toFixed(2) || '0.00'}
            </div>
            <div className="text-gray-400 text-sm">CMEME Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {tasks.find(t => t.type === 'watch_ads')?.current_attempts || 0}
            </div>
            <div className="text-gray-400 text-sm">Ads Watched</div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const status = getTaskStatus(task);
          const isWalletTask = task.type === 'connect_wallet';
          const isSocialTask = task.type === 'connect_twitter' || task.type === 'connect_telegram';
          const isWalletConnected = userData?.hasConnectedWallet?.();
          const hasClaimedBonus = userData?.walletDetail?.bonus_claimed;
          
          return (
            <div
              key={task.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTaskIcon(task.type)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">{task.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                  {status.text}
                </div>
              </div>

              {/* Reward Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                  +{task.reward} {task.reward_type}
                </div>
                {task.type === 'watch_ads' && (
                  <div className="text-xs text-gray-400">
                    {task.remaining_attempts} attempts left
                  </div>
                )}
                {isWalletTask && isWalletConnected && (
                  <div className="text-xs text-green-400">
                    ✓ Wallet Connected
                  </div>
                )}
                {isSocialTask && task.is_completed && (
                  <div className="text-xs text-green-400">
                    ✓ Connected
                  </div>
                )}
              </div>

              {/* Progress Bar for Watch Ads */}
              {task.type === 'watch_ads' && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${((task.current_attempts || 0) / task.max_attempts) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleTaskAction(task)}
                disabled={isTaskDisabled(task)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isTaskDisabled(task)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : isWalletTask && !isWalletConnected
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                    : isWalletTask && isWalletConnected && !hasClaimedBonus
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 shadow-lg hover:shadow-xl'
                }`}
              >
                {completingTask === task.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {task.is_completed && <CheckCircle size={16} />}
                    {isWalletTask && !isWalletConnected && <Wallet size={16} />}
                    {isWalletTask && isWalletConnected && !hasClaimedBonus && <CheckCircle size={16} />}
                    {getTaskButtonText(task)}
                  </div>
                )}
              </button>

              {/* Additional Info */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>
                  {task.type === 'daily_streak' && 'Resets in 24h'}
                  {task.type === 'watch_ads' && 'Resets daily'}
                  {task.type.includes('connect') && 'One-time reward'}
                </span>
                {task.cooldown_minutes > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {task.cooldown_minutes}min cooldown
                  </span>
                )}
              </div>

              {/* Wallet Task Instructions */}
              {isWalletTask && !isWalletConnected && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-xs">
                    Click to connect your Base Network wallet and claim your 0.5 CMEME bonus!
                  </p>
                </div>
              )}

              {/* Wallet Task Claim Instructions */}
              {isWalletTask && isWalletConnected && !hasClaimedBonus && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-xs">
                    Wallet connected! Click above to claim your 0.5 CMEME bonus.
                  </p>
                </div>
              )}

              {/* Social Task Instructions */}
              {isSocialTask && !task.is_completed && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-xs">
                    Click to connect your {task.type === 'connect_twitter' ? 'Twitter' : 'Telegram'} account and earn {task.reward} CMEME!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Social Media Handle Modal */}
      {showSocialModal && currentTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTaskIcon(currentTask.type)}
                <h3 className="text-lg font-bold text-gray-100">
                  Connect {currentTask.type === 'connect_twitter' ? 'Twitter' : 'Telegram'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSocialModal(false);
                  setCurrentTask(null);
                  setSocialHandle('');
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              Enter your {currentTask.type === 'connect_twitter' ? 'Twitter' : 'Telegram'} handle to complete this task and earn {currentTask.reward} CMEME.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {currentTask.type === 'connect_twitter' ? 'Twitter Handle' : 'Telegram Username'}
              </label>
              <input
                type="text"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder={currentTask.type === 'connect_twitter' ? '@username' : '@username'}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={submitSocialHandle}
              disabled={completingTask === currentTask.id || !socialHandle.trim()}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completingTask === currentTask.id ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  Connecting...
                </div>
              ) : (
                `Connect & Earn ${currentTask.reward} CMEME`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      {tasks.length === 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
          <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Tasks Available</h3>
          <p className="text-gray-400">Tasks will be available soon. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;