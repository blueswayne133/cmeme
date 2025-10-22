import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { CheckSquare, Play, TrendingUp, Twitter, Send, Clock, CheckCircle, Wallet, AlertCircle } from "lucide-react";
import api from "../../../utils/api";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed_today: 0, total_earned_today: 0 });
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
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
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTask(taskId);
      const response = await api.post(`/tasks/${taskId}/complete`);
      
      if (response.data.status === 'success') {
        // Refresh both tasks and stats
        await Promise.all([fetchTasks(), fetchTaskStats()]);
        
        // Refresh user data to update balances
        if (refetchUserData) {
          await refetchUserData();
        }
        
        alert(response.data.message || 'Task completed successfully!');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      
      // Special handling for wallet connection task
      if (error.response?.data?.message?.includes('wallet') || 
          error.response?.data?.message?.includes('connect')) {
        alert('Please connect your wallet first to complete this task.');
        navigate('/dashboard/wallet');
      } else {
        alert(error.response?.data?.message || 'Failed to complete task');
      }
    } finally {
      setCompletingTask(null);
    }
  };

  const handleWalletTaskClick = () => {
    // Navigate to wallet page for connection
    navigate('/dashboard/wallet');
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
    
    if (!task.can_complete) {
      if (task.type === 'watch_ads' && task.current_attempts >= task.max_attempts) {
        return 'Daily Limit Reached';
      }
      return 'Cannot Complete';
    }
    
    if (task.type === 'watch_ads') {
      return `Watch Ad (${task.current_attempts || 0}/${task.max_attempts})`;
    }

    if (task.type === 'connect_wallet') {
      return 'Connect Wallet';
    }
    
    return 'Complete Task';
  };

  const isTaskDisabled = (task) => {
    if (completingTask === task.id) return true;
    if (task.is_completed) return true;
    if (!task.can_complete && task.type !== 'connect_wallet') return true;
    return false;
  };

  const getTaskStatus = (task) => {
    if (task.is_completed) {
      return { text: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    
    if (!task.can_complete && task.type !== 'connect_wallet') {
      return { text: 'Unavailable', color: 'text-red-400', bg: 'bg-red-500/20' };
    }

    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.hasConnectedWallet?.();
      return { 
        text: isWalletConnected ? 'Wallet Connected' : 'Connect Wallet', 
        color: isWalletConnected ? 'text-green-400' : 'text-yellow-400', 
        bg: isWalletConnected ? 'bg-green-500/20' : 'bg-yellow-500/20' 
      };
    }
    
    return { text: 'Available', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  };

  const handleTaskAction = (task) => {
    if (task.type === 'connect_wallet' && !userData?.hasConnectedWallet?.()) {
      handleWalletTaskClick();
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
          const isWalletConnected = userData?.hasConnectedWallet?.();
          
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
                disabled={isTaskDisabled(task) && !isWalletTask}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isTaskDisabled(task) && !isWalletTask
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : isWalletTask && !isWalletConnected
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
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
                    Click to connect your Base Network wallet and claim your 2500 CMEME bonus!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

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