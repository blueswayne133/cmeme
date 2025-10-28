import { useState, useEffect } from "react";
import { 
  Search, Filter, RefreshCw, CheckCircle, XCircle, User, 
  BarChart3, Users, TrendingUp, Plus, Edit, Trash2, 
  ToggleLeft, ToggleRight, X, Save, AlertCircle 
} from "lucide-react";
import api from "../../../utils/api";

const AdminTaskManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward_amount: '',
    reward_type: 'CMEME',
    type: '',
    max_attempts_per_day: '',
    cooldown_minutes: '',
    sort_order: '',
    is_active: true,
    is_available: true,
    metadata: {}
  });

  // Task types for dropdown
  const taskTypes = [
    'watch_ads',
    'daily_streak',
    'connect_twitter',
    'connect_telegram',
    'connect_wallet',
    'social_share',
    'refer_friend',
    'daily_login'
  ];

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchTasksOverview();
    } else if (activeTab === 'stats') {
      fetchTaskStats();
    }
  }, [activeTab, dateFilter]);

  const fetchTasksOverview = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/tasks');
      setTasks(response.data.data.tasks);
      setStats(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Error fetching tasks: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTasks = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/tasks/users/${userId}`);
      setUserTasks(response.data.data.tasks);
      setSelectedUser(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      alert('Error fetching user tasks: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/tasks/stats?period=${dateFilter}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
      alert('Error fetching task stats: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/tasks', formData);
      alert('Task created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchTasksOverview();
    } catch (error) {
      alert('Error creating task: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/tasks/${editingTask.id}`, formData);
      alert('Task updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchTasksOverview();
    } catch (error) {
      alert('Error updating task: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/tasks/${taskId}`);
      alert('Task deleted successfully!');
      fetchTasksOverview();
    } catch (error) {
      alert('Error deleting task: ' + error.response?.data?.message || error.message);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      await api.post(`/admin/tasks/${taskId}/toggle-status`);
      alert('Task status updated!');
      fetchTasksOverview();
    } catch (error) {
      alert('Error updating task status: ' + error.response?.data?.message || error.message);
    }
  };

  const resetUserTask = async (taskId) => {
    if (!selectedUser) return;
    
    if (!confirm('Are you sure you want to reset this task for the user?')) return;

    try {
      await api.post(`/admin/tasks/${taskId}/reset`, {
        user_id: selectedUser.id
      });
      alert('Task reset successfully!');
      fetchUserTasks(selectedUser.id);
    } catch (error) {
      alert('Error resetting task: ' + error.response?.data?.message || error.message);
    }
  };

  const forceCompleteTask = async (taskId) => {
    if (!selectedUser) return;
    
    if (!confirm('Are you sure you want to manually complete this task for the user?')) return;

    try {
      await api.post(`/admin/tasks/${taskId}/complete`, {
        user_id: selectedUser.id
      });
      alert('Task completed successfully!');
      fetchUserTasks(selectedUser.id);
    } catch (error) {
      alert('Error completing task: ' + error.response?.data?.message || error.message);
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      fetchUserTasks(searchUserId.trim());
      setActiveTab('user');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reward_amount: '',
      reward_type: 'CMEME',
      type: '',
      max_attempts_per_day: '',
      cooldown_minutes: '',
      sort_order: '',
      is_active: true,
      is_available: true,
      metadata: {}
    });
    setEditingTask(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      reward_amount: task.reward_amount,
      reward_type: task.reward_type,
      type: task.type,
      max_attempts_per_day: task.max_attempts_per_day,
      cooldown_minutes: task.cooldown_minutes,
      sort_order: task.sort_order,
      is_active: task.is_active,
      is_available: task.is_available,
      metadata: task.metadata || {}
    });
    setShowEditModal(true);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm mb-2 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0 ml-4`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Modal Component
  const TaskModal = ({ isOpen, onClose, onSubmit, title, isEdit = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select task type</option>
                  {taskTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Reward Amount *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.reward_amount}
                  onChange={(e) => setFormData({...formData, reward_amount: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Reward Type *</label>
                <select
                  required
                  value={formData.reward_type}
                  onChange={(e) => setFormData({...formData, reward_type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CMEME">CMEME</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Max Attempts/Day *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_attempts_per_day}
                  onChange={(e) => setFormData({...formData, max_attempts_per_day: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Cooldown (minutes) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData({...formData, cooldown_minutes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Sort Order *</label>
                <input
                  type="number"
                  required
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Enter task description"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                Available
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage user tasks and monitor completion progress</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>
      </div>

      {/* Search User */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 border border-gray-700">
        <form onSubmit={handleUserSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-400 text-sm mb-2">Search User by ID</label>
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Enter User ID"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Search User
            </button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto mb-6 border-b border-gray-700 scrollbar-hide">
        <div className="flex space-x-1 min-w-max">
          {['overview', 'user', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && 'Tasks Overview'}
              {tab === 'user' && 'User Tasks'}
              {tab === 'stats' && 'Statistics'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filter and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'overview') fetchTasksOverview();
            else if (activeTab === 'stats') fetchTaskStats();
          }}
          className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <StatCard
                  title="Total Tasks"
                  value={stats.total_tasks || 0}
                  icon={BarChart3}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Active Tasks"
                  value={stats.active_tasks || 0}
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <StatCard
                  title="Completions Today"
                  value={stats.total_completions_today || 0}
                  icon={TrendingUp}
                  color="bg-purple-500"
                />
              </div>

              {/* Tasks List */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">All Tasks</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm">Task</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm hidden sm:table-cell">Type</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm">Reward</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm hidden md:table-cell">Limit</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm hidden lg:table-cell">Completions</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm">Status</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                          <td className="p-3 sm:p-4">
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">{task.title}</p>
                              <p className="text-gray-400 text-xs sm:text-sm line-clamp-1">{task.description}</p>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 hidden sm:table-cell">
                            <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 capitalize">
                              {task.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <p className="text-white text-sm sm:text-base">{task.reward_amount} {task.reward_type}</p>
                          </td>
                          <td className="p-3 sm:p-4 hidden md:table-cell">
                            <p className="text-gray-300 text-sm">{task.max_attempts_per_day}/day</p>
                          </td>
                          <td className="p-3 sm:p-4 hidden lg:table-cell">
                            <p className="text-gray-300 text-sm">{task.today_completions || 0}</p>
                          </td>
                          <td className="p-3 sm:p-4">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                task.is_active 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {task.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                              {task.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 sm:p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 sm:p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Tasks Tab */}
          {activeTab === 'user' && (
            <div>
              {selectedUser ? (
                <>
                  {/* User Info */}
                  <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-sm sm:text-base truncate">{selectedUser.username}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{selectedUser.email}</p>
                          <p className="text-gray-400 text-xs">ID: {selectedUser.id}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-white font-semibold text-sm sm:text-base">{selectedUser.token_balance} CMEME</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Streak: {selectedUser.mining_streak || 0} days</p>
                      </div>
                    </div>
                  </div>

                  {/* User Tasks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {userTasks.map((task) => (
                      <div key={task.id} className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <h4 className="text-white font-semibold text-sm sm:text-base">{task.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.is_completed 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {task.is_completed ? 'Completed' : 'Available'}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{task.description}</p>
                        
                        <div className="space-y-2 mb-3 sm:mb-4">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Progress:</span>
                            <span className="text-white">
                              {task.current_attempts}/{task.max_attempts_per_day}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Reward:</span>
                            <span className="text-green-400">
                              {task.reward_amount} {task.reward_type}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => resetUserTask(task.id)}
                            disabled={task.current_attempts === 0}
                            className="flex-1 px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-xs sm:text-sm flex items-center justify-center gap-1"
                          >
                            <XCircle size={14} />
                            Reset
                          </button>
                          <button
                            onClick={() => forceCompleteTask(task.id)}
                            disabled={task.is_completed || !task.can_complete}
                            className="flex-1 px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-xs sm:text-sm flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Users size={40} className="mx-auto text-gray-600 mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">Search for a user to view their tasks</p>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats.stats && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <StatCard
                  title="Total Completions"
                  value={stats.stats.total_completions || 0}
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <StatCard
                  title="Unique Users"
                  value={stats.stats.unique_users || 0}
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Total Attempts"
                  value={stats.stats.total_attempts || 0}
                  icon={TrendingUp}
                  color="bg-purple-500"
                />
              </div>

              {/* Top Tasks */}
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Top Tasks ({dateFilter})</h3>
                <div className="space-y-3 sm:space-y-4">
                  {stats.top_tasks?.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{task.title}</p>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{task.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-white font-semibold text-sm sm:text-base">{task.completions_count} completions</p>
                        <p className="text-gray-400 text-xs sm:text-sm">{task.reward_amount} {task.reward_type} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={createTask}
        title="Create New Task"
      />

      <TaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={updateTask}
        title="Edit Task"
        isEdit={true}
      />
    </div>
  );
};

export default AdminTaskManagement;