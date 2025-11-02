import { useState, useEffect } from "react";
import { Users, Wallet, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Shield, CreditCard, Activity, RefreshCw } from "lucide-react";
import api from "../../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new_today: 0, weekly_growth: [] },
    kyc: { pending: 0, verified: 0 },
    transactions: { total_volume: 0, today_volume: 0 },
    trading: { active_trades: 0, completed_trades: 0 },
    wallets: { connected: 0 },
    tasks: { active: 0 }
  });
  const [recentActivity, setRecentActivity] = useState({
    recent_users: [],
    recent_transactions: [],
    pending_kyc: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsResponse, activityResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-activity')
      ]);
      
      setStats(statsResponse.data.data);
      setRecentActivity(activityResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, change }) => (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all h-full">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-white mb-1 truncate">{loading ? '...' : value}</p>
          {subtitle && <p className="text-gray-400 text-xs sm:text-sm truncate">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-xs sm:text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} ml-3 flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 sm:w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">Welcome to your administration panel</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="text-sm sm:text-base">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${stats.users.new_today} new today`}
        />
        <StatCard
          title="Active Users"
          value={stats.users.active}
          icon={Activity}
          color="bg-green-500"
          subtitle={`${Math.round((stats.users.active / stats.users.total) * 100)}% active`}
        />
        <StatCard
          title="Pending KYC"
          value={stats.kyc.pending}
          icon={AlertTriangle}
          color="bg-yellow-500"
          subtitle={`${stats.kyc.verified} verified`}
        />
        <StatCard
          title="Total Volume"
          value={`$${(stats.transactions.total_volume || 0).toLocaleString()}`}
          icon={CreditCard}
          color="bg-purple-500"
          subtitle={`$${(stats.transactions.today_volume || 0).toLocaleString()} today`}
        />
        <StatCard
          title="Active Trades"
          value={stats.trading.active_trades}
          icon={TrendingUp}
          color="bg-indigo-500"
          subtitle={`${stats.trading.completed_trades} completed`}
        />
        <StatCard
          title="Connected Wallets"
          value={stats.wallets.connected}
          icon={Wallet}
          color="bg-cyan-500"
        />
        <StatCard
          title="Active Tasks"
          value={stats.tasks.active}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          title="Security Score"
          value="98%"
          icon={Shield}
          color="bg-gray-600"
          subtitle="System Health"
        />
      </div>

      {/* Recent Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Users */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Recent Users</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {recentActivity.recent_users.length} users
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.recent_users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{user.username}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{user.email}</p>
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</p>
                  <p className={`text-xs ${user.current_kyc?.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.current_kyc?.status || 'No KYC'}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.recent_users.length === 0 && (
              <p className="text-gray-400 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Pending KYC */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Pending KYC Verification</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {recentActivity.pending_kyc.length} pending
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.pending_kyc.map((kyc) => (
              <div key={kyc.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={14} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{kyc.user?.username}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{kyc.document_type}</p>
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-gray-400 text-xs">{new Date(kyc.created_at).toLocaleDateString()}</p>
                  <p className="text-yellow-400 text-xs">Pending Review</p>
                </div>
              </div>
            ))}
            {recentActivity.pending_kyc.length === 0 && (
              <p className="text-gray-400 text-center py-4">No pending KYC requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;