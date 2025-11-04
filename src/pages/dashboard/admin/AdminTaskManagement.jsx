import { useState, useEffect } from "react";
import { 
  Search, Filter, Plus, Edit, Trash2, Download, 
  ArrowUpDown, ChevronLeft, ChevronRight, X,
  CheckCircle, Clock, AlertCircle, Users, BarChart3,
  ExternalLink, Image, Eye, RefreshCw, TrendingUp,
  Shield, Zap, MessageCircle, ThumbsUp, Repeat,
  DownloadCloud, FileText, UserCheck, Settings
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../utils/api";

const AdminTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    is_active: "",
    sort_field: "sort_order",
    sort_direction: "asc"
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [taskTypes, setTaskTypes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedTaskProgress, setSelectedTaskProgress] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward_amount: "",
    reward_type: "CMEME",
    type: "",
    max_attempts_per_day: 1,
    cooldown_minutes: 0,
    sort_order: 0,
    is_active: true,
    is_available: true,
    action_url: "",
    social_platform: "",
    required_content: "",
    metadata: {}
  });

  useEffect(() => {
    fetchTasks();
    fetchTaskTypes();
  }, [filters, pagination.current_page, activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = '/admin/tasks';
      if (activeTab === 'engagement') {
        url = '/admin/tasks/engagement';
      }

      const response = await api.get(url, {
        params: {
          ...filters,
          page: pagination.current_page,
          per_page: pagination.per_page
        }
      });
      
      const responseData = response.data.data;
      if (activeTab === 'engagement') {
        setTasks(responseData.tasks || []);
      } else {
        setTasks(responseData.tasks || []);
        setPagination({
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          per_page: responseData.per_page || 15,
          total: responseData.total || 0
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await api.get('/admin/tasks/types');
      setTaskTypes(response.data.data);
    } catch (error) {
      console.error("Error fetching task types:", error);
    }
  };

  const fetchTaskProgress = async (taskId) => {
    try {
      const response = await api.get(`/admin/tasks/${taskId}/progress`);
      setSelectedTaskProgress(response.data.data.progress || []);
      setShowProgressModal(true);
    } catch (error) {
      console.error("Error fetching task progress:", error);
      toast.error("Failed to fetch task progress");
    }
  };

  const fetchTaskAnalytics = async (taskId) => {
    try {
      const response = await api.get(`/admin/tasks/${taskId}`);
      setAnalyticsData(response.data.data);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error("Error fetching task analytics:", error);
      toast.error("Failed to fetch task analytics");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/admin/tasks/${editingTask.id}`, formData);
        toast.success("Task updated successfully");
      } else {
        await api.post('/admin/tasks', formData);
        toast.success("Task created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (task) => {
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
      action_url: task.action_url || "",
      social_platform: task.social_platform || "",
      required_content: task.required_content || "",
      metadata: task.metadata || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (task) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/admin/tasks/${task.id}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete task";
      toast.error(errorMessage);
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      await api.post(`/admin/tasks/${task.id}/toggle-status`);
      toast.success("Task status updated");
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update task status";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      reward_amount: "",
      reward_type: "CMEME",
      type: "",
      max_attempts_per_day: 1,
      cooldown_minutes: 0,
      sort_order: 0,
      is_active: true,
      is_available: true,
      action_url: "",
      social_platform: "",
      required_content: "",
      metadata: {}
    });
    setEditingTask(null);
  };

  const exportCompletions = async () => {
    try {
      const response = await api.get('/admin/tasks/export-completions');
      const data = response.data.data;
      
      // Create CSV content
      const headers = ['ID', 'User', 'Email', 'Task', 'Task Type', 'Attempts', 'Reward Amount', 'Total Reward', 'Completion Date', 'Has Screenshot'];
      const csvContent = [
        headers.join(','),
        ...data.map(item => [
          item.id,
          `"${item.user}"`,
          `"${item.email}"`,
          `"${item.task}"`,
          `"${item.task_type}"`,
          item.attempts,
          item.reward_amount,
          item.total_reward,
          item.completion_date,
          item.has_screenshot
        ].join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-completions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Completions exported successfully');
    } catch (error) {
      console.error('Error exporting completions:', error);
      toast.error('Failed to export completions');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-full ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  const TaskTypeBadge = ({ type }) => {
    const getTypeColor = (type) => {
      if (type.includes('connect')) return 'bg-blue-500/20 text-blue-400';
      if (type.includes('watch')) return 'bg-purple-500/20 text-purple-400';
      if (type.includes('streak')) return 'bg-green-500/20 text-green-400';
      if (type.includes('engagement') || type.includes('_x')) return 'bg-orange-500/20 text-orange-400';
      return 'bg-gray-500/20 text-gray-400';
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'follow_x': return <Users size={12} />;
        case 'like_x': return <ThumbsUp size={12} />;
        case 'retweet_x': return <Repeat size={12} />;
        case 'comment_x': return <MessageCircle size={12} />;
        case 'connect_twitter': return <Shield size={12} />;
        case 'connect_telegram': return <Zap size={12} />;
        case 'watch_ads': return <BarChart3 size={12} />;
        case 'daily_streak': return <TrendingUp size={12} />;
        default: return <CheckCircle size={12} />;
      }
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
        {getTypeIcon(type)}
        {taskTypes[type] || type}
      </span>
    );
  };

  const EngagementTaskModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Task Progress - {selectedTaskProgress[0]?.task?.title}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Completions</p>
              <p className="text-2xl font-bold text-white">{selectedTaskProgress.length}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Screenshot Proofs</p>
              <p className="text-2xl font-bold text-green-400">
                {selectedTaskProgress.filter(p => p.proof_data?.screenshot_url).length}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedTaskProgress.map((progress, index) => (
              <div key={index} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-white">
                      {progress.user?.username || 'N/A'} ({progress.user?.email || 'N/A'})
                    </p>
                    <p className="text-sm text-gray-400">
                      Completed: {new Date(progress.last_completed_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Attempts: {progress.attempts_count}
                    </p>
                  </div>
                  <p className="text-green-400 font-semibold">
                    +{(progress.attempts_count * (progress.task?.reward_amount || 0)).toFixed(2)} {progress.task?.reward_type}
                  </p>
                </div>
                
                {progress.proof_data?.screenshot_url && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-300 mb-2">Screenshot Proof:</p>
                    <img 
                      src={progress.proof_data.screenshot_url} 
                      alt="Task completion proof"
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(progress.proof_data.screenshot_url, '_blank')}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Click to view full size
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowProgressModal(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Task Analytics - {analyticsData?.title}
          </h2>
        </div>
        
        <div className="p-6">
          {analyticsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Completions</p>
                  <p className="text-2xl font-bold text-white">{analyticsData.total_completions || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Today's Completions</p>
                  <p className="text-2xl font-bold text-blue-400">{analyticsData.today_completions || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Screenshot Proofs</p>
                  <p className="text-2xl font-bold text-green-400">{analyticsData.screenshot_completions || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {((analyticsData.total_completions || 0) * analyticsData.reward_amount).toFixed(2)} {analyticsData.reward_type}
                  </p>
                </div>
              </div>

              {analyticsData.recent_completions && analyticsData.recent_completions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Completions</h3>
                  <div className="space-y-3">
                    {analyticsData.recent_completions.map((completion, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{completion.user?.username}</p>
                          <p className="text-gray-400 text-sm">{completion.user?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm">
                            {new Date(completion.last_completed_at).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {completion.attempts_count} attempts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowAnalyticsModal(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const engagementTaskTypes = [
    'follow_x', 'like_x', 'retweet_x', 'comment_x', 
    'quote_tweet', 'join_twitter_space'
  ];

  const filteredTasks = activeTab === 'engagement' 
    ? tasks.filter(task => engagementTaskTypes.includes(task.type))
    : activeTab === 'active'
    ? tasks.filter(task => task.is_active)
    : tasks;

  // Pagination Component
  const Pagination = () => {
    const totalPages = pagination.last_page;
    const currentPage = pagination.current_page;
    
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-6 border-t border-gray-700 bg-gray-800">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} tasks
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Task Management
        </h1>
        <p className="text-gray-400">
          Manage and monitor all platform tasks and engagement activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={BarChart3}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Tasks"
          value={tasks.filter(t => t.is_active).length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Engagement Tasks"
          value={tasks.filter(t => engagementTaskTypes.includes(t.type)).length}
          icon={Users}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Completions"
          value={tasks.reduce((sum, task) => sum + (task.total_completions || 0), 0)}
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl p-1 mb-6">
        <div className="flex space-x-1">
          {['all', 'engagement', 'active'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' && 'All Tasks'}
              {tab === 'engagement' && 'Engagement Tasks'}
              {tab === 'active' && 'Active Tasks'}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={exportCompletions}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors"
            >
              <DownloadCloud size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(taskTypes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  type: "",
                  is_active: "",
                  sort_field: "sort_order",
                  sort_direction: "asc"
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors w-full md:w-auto justify-center"
            >
              <RefreshCw size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm">Task</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm hidden sm:table-cell">Type</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm">Reward</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm hidden md:table-cell">Completions</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm hidden lg:table-cell">Status</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-gray-300 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 lg:px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
                    <td className="px-4 lg:px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                    <td className="px-4 lg:px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                    <td className="px-4 lg:px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                    <td className="px-4 lg:px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                    <td className="px-4 lg:px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                  </tr>
                ))
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={48} className="text-gray-600 mb-4" />
                      <p>No tasks found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or create a new task</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <p className="font-medium text-white text-sm lg:text-base">{task.title}</p>
                        <p className="text-gray-400 text-xs lg:text-sm mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="sm:hidden mt-2">
                          <TaskTypeBadge type={task.type} />
                        </div>
                        {task.action_url && (
                          <a 
                            href={task.action_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-1"
                          >
                            <ExternalLink size={12} />
                            Action URL
                          </a>
                        )}
                        <div className="md:hidden mt-2">
                          <p className="text-gray-400 text-xs">
                            Completions: {task.total_completions || 0}
                          </p>
                        </div>
                        <div className="lg:hidden mt-2 flex gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            task.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {task.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                      <TaskTypeBadge type={task.type} />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <p className="text-yellow-400 font-semibold text-sm lg:text-base">
                        {task.reward_amount} {task.reward_type}
                      </p>
                      <p className="text-gray-400 text-xs lg:text-sm">
                        {task.max_attempts_per_day}/day
                      </p>
                    </td>
                    <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {task.total_completions || 0}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Today: {task.today_completions || 0}
                        </p>
                        {engagementTaskTypes.includes(task.type) && task.screenshot_completions > 0 && (
                          <p className="text-green-400 text-xs">
                            {task.screenshot_completions} screenshots
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {task.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.is_available 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {task.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex gap-1 lg:gap-2 flex-wrap">
                        <button
                          onClick={() => fetchTaskAnalytics(task.id)}
                          className="p-1 lg:p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 size={14} className="lg:w-4" />
                        </button>
                        <button
                          onClick={() => fetchTaskProgress(task.id)}
                          className="p-1 lg:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Progress"
                        >
                          <Eye size={14} className="lg:w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1 lg:p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} className="lg:w-4" />
                        </button>
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="p-1 lg:p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-colors"
                          title="Toggle Status"
                        >
                          <Settings size={14} className="lg:w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="p-1 lg:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="lg:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      {Object.entries(taskTypes).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.reward_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reward Type *
                    </label>
                    <select
                      required
                      value={formData.reward_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, reward_type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="CMEME">CMEME</option>
                      <option value="POINTS">POINTS</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Attempts/Day
                    </label>
                    <input
                      type="number"
                      value={formData.max_attempts_per_day}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_attempts_per_day: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cooldown (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.cooldown_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, cooldown_minutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Action URL
                  </label>
                  <input
                    type="url"
                    value={formData.action_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="ml-2 text-sm text-gray-300">
                      Active
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="ml-2 text-sm text-gray-300">
                      Available
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && <EngagementTaskModal />}

      {/* Analytics Modal */}
      {showAnalyticsModal && <AnalyticsModal />}
    </div>
  );
};

export default AdminTaskManagement;