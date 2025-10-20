// src/pages/dashboard/user/TasksPage.jsx

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckSquare, Play, TrendingUp, Twitter, Send, Clock, CheckCircle } from "lucide-react";
import api from "../../../utils/api";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
  const { userData, refetchUserData } = useOutletContext();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to default tasks if API fails
      setTasks(getDefaultTasks());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTasks = () => [
    {
      id: 1,
      title: "Watch Ads",
      description: "Watch ads to earn CMEME tokens. Up to 60 times daily.",
      reward: 0.05,
      reward_type: "CMEME",
      type: "watch_ads",
      max_attempts: 60,
      current_attempts: 0,
      is_available: true,
      is_completed: false,
      cooldown_minutes: 0
    },
    {
      id: 2,
      title: "Daily Streak Claim",
      description: "Claim your daily streak bonus.",
      reward: 0.5,
      reward_type: "CMEME",
      type: "daily_streak",
      max_attempts: 1,
      current_attempts: 0,
      is_available: true,
      is_completed: false,
      cooldown_minutes: 1440
    },
    {
      id: 3,
      title: "Connect X (Twitter) Account",
      description: "Connect your X (Twitter) account to earn rewards.",
      reward: 5,
      reward_type: "CMEME",
      type: "connect_twitter",
      max_attempts: 1,
      current_attempts: 0,
      is_available: true,
      is_completed: false,
      cooldown_minutes: 0
    },
    {
      id: 4,
      title: "Connect Telegram Account",
      description: "Connect your Telegram account to earn rewards.",
      reward: 5,
      reward_type: "CMEME",
      type: "connect_telegram",
      max_attempts: 1,
      current_attempts: 0,
      is_available: true,
      is_completed: false,
      cooldown_minutes: 0
    }
  ];

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTask(taskId);
      const response = await api.post(`/tasks/${taskId}/complete`);
      
      if (response.data.status === 'success') {
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                is_completed: task.max_attempts === 1 ? true : task.is_completed,
                current_attempts: task.current_attempts + 1
              }
            : task
        ));
        
        // Refresh user data to update balances
        if (refetchUserData) {
          await refetchUserData();
        }
        
        alert(response.data.message || 'Task completed successfully!');
        
        // Refresh tasks to get updated progress
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
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
      default:
        return <CheckSquare className="text-gray-400" size={24} />;
    }
  };

  const getTaskButtonText = (task) => {
    if (task.is_completed && task.max_attempts === 1) {
      return 'Completed';
    }
    
    if (completingTask === task.id) {
      return 'Processing...';
    }
    
    if (task.type === 'watch_ads') {
      return `Watch Ad (${task.current_attempts || 0}/${task.max_attempts})`;
    }
    
    return 'Complete Task';
  };

  const isTaskDisabled = (task) => {
    if (completingTask === task.id) return true;
    if (task.is_completed && task.max_attempts === 1) return true;
    if (task.type === 'watch_ads' && task.current_attempts >= task.max_attempts) return true;
    if (!task.is_available) return true;
    return false;
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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
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
              
              {/* Reward Badge */}
              <div className="text-right">
                <div className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                  +{task.reward} {task.reward_type}
                </div>
                {task.type === 'watch_ads' && (
                  <div className="text-xs text-gray-400 mt-1">
                    {task.current_attempts || 0}/{task.max_attempts} today
                  </div>
                )}
              </div>
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
              onClick={() => handleCompleteTask(task.id)}
              disabled={isTaskDisabled(task)}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                isTaskDisabled(task)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
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
                  {task.is_completed && task.max_attempts === 1 && (
                    <CheckCircle size={16} />
                  )}
                  {getTaskButtonText(task)}
                </div>
              )}
            </button>

            {/* Status Info */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span>
                {task.type === 'daily_streak' && 'Resets in 24h'}
                {task.type === 'watch_ads' && 'Resets daily'}
                {task.type.includes('connect') && 'One-time reward'}
              </span>
              {task.is_completed && task.max_attempts === 1 && (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Card */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {tasks.filter(t => t.is_completed).length}
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
              {tasks.reduce((total, task) => {
                if (task.is_completed || task.current_attempts > 0) {
                  return total + (task.reward * (task.current_attempts || (task.is_completed ? 1 : 0)));
                }
                return total;
              }, 0).toFixed(2)}
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
    </div>
  );
};

export default TasksPage;