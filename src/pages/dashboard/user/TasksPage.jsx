import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  CheckSquare, Play, TrendingUp, Twitter, Send, Clock, 
  CheckCircle, Wallet, AlertCircle, X, ExternalLink, 
  Upload, Image, ThumbsUp, MessageCircle, Repeat, Users,
  Trash2
} from "lucide-react";
import api from "../../../utils/api";
import toast from 'react-hot-toast';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ 
    completed_today: 0, 
    total_earned_today: 0,
    engagement_tasks_completed: 0 
  });
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [socialHandle, setSocialHandle] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const { userData, refetchUserData } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [userData]);

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
    }
  };

  const handleCompleteTask = async (taskId, socialHandle = null, screenshotData = null) => {
    try {
      setCompletingTask(taskId);
      
      const payload = {};
      if (socialHandle) {
        payload.social_handle = socialHandle;
      }
      if (screenshotData) {
        payload.screenshot_url = screenshotData.screenshot_url;
        payload.screenshot_public_id = screenshotData.screenshot_public_id;
      }
      
      const response = await api.post(`/tasks/${taskId}/complete`, payload);
      
      if (response.data.status === 'success') {
        await Promise.all([fetchTasks(), fetchTaskStats()]);
        
        if (refetchUserData) {
          await refetchUserData();
        }
        
        toast.success(response.data.message || 'Task completed successfully!');
        
        if (showSocialModal) {
          setShowSocialModal(false);
          setCurrentTask(null);
          setSocialHandle('');
        }
        if (showScreenshotModal) {
          setShowScreenshotModal(false);
          setCurrentTask(null);
          setScreenshotFile(null);
          setUploadedScreenshot(null);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.message || 'Failed to complete task');
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

  const handleEngagementTaskClick = (task) => {
    if (task.action_url) {
      window.open(task.action_url, '_blank', 'noopener,noreferrer');
    }
    // Show screenshot upload modal after a delay
    setTimeout(() => {
      setCurrentTask(task);
      setShowScreenshotModal(true);
    }, 1500);
  };

  const handleScreenshotUpload = async () => {
    if (!screenshotFile || !currentTask) return;

    try {
      setUploadingScreenshot(true);
      
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append('task_id', currentTask.id);

      const uploadResponse = await api.post('/tasks/upload-screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.status === 'success') {
        setUploadedScreenshot(uploadResponse.data.data);
        toast.success('Screenshot uploaded successfully!');
        
        // Auto-complete the task with the uploaded screenshot
        await handleCompleteTask(currentTask.id, null, uploadResponse.data.data);
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast.error(error.response?.data?.message || 'Failed to upload screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!uploadedScreenshot) return;

    try {
      await api.post('/tasks/delete-screenshot', {
        public_id: uploadedScreenshot.screenshot_public_id
      });
      
      setUploadedScreenshot(null);
      setScreenshotFile(null);
      toast.success('Screenshot removed');
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast.error('Failed to remove screenshot');
    }
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
      case 'follow_x':
        return <Users className="text-sky-400" size={24} />;
      case 'like_x':
        return <ThumbsUp className="text-red-400" size={24} />;
      case 'retweet_x':
        return <Repeat className="text-green-400" size={24} />;
      case 'comment_x':
        return <MessageCircle className="text-yellow-400" size={24} />;
      case 'quote_tweet':
        return <MessageCircle className="text-blue-400" size={24} />;
      case 'join_twitter_space':
        return <Users className="text-purple-400" size={24} />;
      case 'follow':
      case 'like':
      case 'comment':
      case 'share':
      case 'retweet':
        return <Twitter className="text-sky-400" size={24} />;
      case 'join_telegram':
        return <Send className="text-blue-500" size={24} />;
      case 'join_discord':
        return <ExternalLink className="text-indigo-400" size={24} />;
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
      const isWalletConnected = userData?.wallet_address;
      
      if (!isWalletConnected) {
        return 'Connect Wallet';
      } else {
        return 'Completed';
      }
    }
    
    // Social connection tasks
    if (task.type === 'connect_twitter' || task.type === 'connect_telegram') {
      return 'Connect Account';
    }
    
    // Engagement tasks with screenshot requirement
    if (task.requires_screenshot) {
      if (task.type === 'follow_x') return 'Follow & Upload Proof';
      if (task.type === 'like_x') return 'Like & Upload Proof';
      if (task.type === 'retweet_x') return 'Retweet & Upload Proof';
      if (task.type === 'comment_x') return 'Comment & Upload Proof';
      if (task.type === 'quote_tweet') return 'Quote Tweet & Upload Proof';
      if (task.type === 'join_twitter_space') return 'Join Space & Upload Proof';
    }
    
    // Engagement tasks with action URLs
    if (task.action_url) {
      if (task.type === 'follow') return 'Follow Now';
      if (task.type === 'like') return 'Like Post';
      if (task.type === 'comment') return 'Comment Now';
      if (task.type === 'share') return 'Share Now';
      if (task.type === 'retweet') return 'Retweet Now';
      if (task.type === 'join_telegram') return 'Join Telegram';
      if (task.type === 'join_discord') return 'Join Discord';
    }
    
    if (task.type === 'watch_ads') {
      return `Watch Ad (${task.current_attempts || 0}/${task.max_attempts})`;
    }
    
    return 'Complete Task';
  };

  const isTaskDisabled = (task) => {
    if (completingTask === task.id) return true;
    if (task.is_completed) return true;
    
    // Wallet task is completed automatically when wallet is connected
    if (task.type === 'connect_wallet' && userData?.wallet_address) {
      return true;
    }
    
    if (!task.can_complete) return true;
    return false;
  };

  const getTaskStatus = (task) => {
    if (task.is_completed) {
      return { text: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    
    // Wallet task status
    if (task.type === 'connect_wallet') {
      const isWalletConnected = userData?.wallet_address;
      
      if (isWalletConnected) {
        return { text: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' };
      } else {
        return { text: 'Connect Wallet', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      }
    }
    
    if (!task.can_complete) {
      return { text: 'Unavailable', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
    
    return { text: 'Available', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  };

  const handleTaskAction = (task) => {
    if (task.type === 'connect_wallet') {
      if (!userData?.wallet_address) {
        handleWalletTaskClick();
      }
    } else if (task.type === 'connect_twitter' || task.type === 'connect_telegram') {
      handleSocialTaskClick(task);
    } else if (task.requires_screenshot) {
      handleEngagementTaskClick(task);
    } else if (task.action_url) {
      handleEngagementTaskClick(task);
    } else {
      handleCompleteTask(task.id);
    }
  };

  const engagementTaskTypes = [
    'follow_x', 'like_x', 'retweet_x', 'comment_x', 
    'quote_tweet', 'join_twitter_space'
  ];

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
              {stats.engagement_tasks_completed || 0}
            </div>
            <div className="text-gray-400 text-sm">Engagement Tasks</div>
          </div>
        </div>
      </div>

      {/* Engagement Tasks Section */}
      {tasks.some(task => engagementTaskTypes.includes(task.type)) && (
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-4">Social Engagement Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tasks.filter(task => engagementTaskTypes.includes(task.type)).map((task) => {
              const status = getTaskStatus(task);
              const isWalletTask = task.type === 'connect_wallet';
              const isSocialTask = task.type === 'connect_twitter' || task.type === 'connect_telegram';
              const isEngagementTask = engagementTaskTypes.includes(task.type);
              const isWalletConnected = userData?.wallet_address;
              
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
                    {task.requires_screenshot && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Image size={14} />
                        Screenshot Required
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleTaskAction(task)}
                    disabled={isTaskDisabled(task)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isTaskDisabled(task)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : isEngagementTask
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {completingTask === task.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {task.is_completed && <CheckCircle size={16} />}
                        {isEngagementTask && <ExternalLink size={16} />}
                        {getTaskButtonText(task)}
                      </div>
                    )}
                  </button>

                  {/* Engagement Task Instructions */}
                  {isEngagementTask && !task.is_completed && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <p className="text-blue-400 text-xs">
                        {task.requires_screenshot 
                          ? `Click to open ${task.social_platform || 'X'} and complete the task. You'll need to upload a screenshot as proof.`
                          : `Click to complete this task and earn ${task.reward} CMEME automatically!`
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Tasks Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-100 mb-4">Daily Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.filter(task => !engagementTaskTypes.includes(task.type)).map((task) => {
            const status = getTaskStatus(task);
            const isWalletTask = task.type === 'connect_wallet';
            const isSocialTask = task.type === 'connect_twitter' || task.type === 'connect_telegram';
            const isEngagementTask = task.action_url && !isSocialTask && !isWalletTask;
            const isWalletConnected = userData?.wallet_address;
            
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
                      : isEngagementTask
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
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
                      {isEngagementTask && <ExternalLink size={16} />}
                      {getTaskButtonText(task)}
                    </div>
                  )}
                </button>

                {/* Additional Info */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>
                    {task.type === 'daily_streak' && 'Resets in 24h'}
                    {task.type === 'watch_ads' && 'Resets daily'}
                    {(task.type.includes('connect') || isEngagementTask) && 'One-time reward'}
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
                      Click to connect your Base Network wallet and automatically earn {task.reward} CMEME!
                    </p>
                  </div>
                )}

                {/* Wallet Task Completed Message */}
                {isWalletTask && isWalletConnected && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 text-xs">
                      ✓ Wallet connected! You've earned {task.reward} CMEME automatically.
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

                {/* Engagement Task Instructions */}
                {isEngagementTask && !task.is_completed && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-400 text-xs">
                      Click to complete this task and earn {task.reward} CMEME automatically!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

      {/* Screenshot Upload Modal */}
      {showScreenshotModal && currentTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTaskIcon(currentTask.type)}
                <h3 className="text-lg font-bold text-gray-100">
                  Upload Screenshot Proof
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowScreenshotModal(false);
                  setCurrentTask(null);
                  setScreenshotFile(null);
                  setUploadedScreenshot(null);
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              Please upload a screenshot showing you completed the {currentTask.title.toLowerCase()}.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Screenshot
              </label>
              
              {uploadedScreenshot ? (
                <div className="border-2 border-green-500/30 rounded-xl p-4 bg-green-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={20} />
                      <span>Screenshot Uploaded Successfully</span>
                    </div>
                    <button
                      onClick={handleDeleteScreenshot}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <img 
                    src={uploadedScreenshot.screenshot_url} 
                    alt="Uploaded screenshot"
                    className="w-full h-32 object-contain rounded-lg border border-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Screenshot ready for submission
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files[0])}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {screenshotFile ? (
                      <div className="text-blue-400">
                        <Image size={32} className="mx-auto mb-2" />
                        <p>{screenshotFile.name}</p>
                        <p className="text-sm text-gray-400 mt-1">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">Click to upload screenshot</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleScreenshotUpload}
              disabled={!screenshotFile || uploadingScreenshot || uploadedScreenshot}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingScreenshot ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  Uploading...
                </div>
              ) : uploadedScreenshot ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Screenshot Uploaded - Processing Task...
                </div>
              ) : (
                `Upload & Earn ${currentTask.reward} CMEME`
              )}
            </button>

            {uploadedScreenshot && (
              <p className="text-green-400 text-sm text-center mt-3">
                Task completion in progress...
              </p>
            )}
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