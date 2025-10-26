import { useState, useEffect } from "react";
import { Users, Wallet, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Shield, CreditCard, Activity } from "lucide-react";
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, change }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{loading ? '...' : value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome to your administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          value={`$${stats.transactions.total_volume.toLocaleString()}`}
          icon={CreditCard}
          color="bg-purple-500"
          subtitle={`$${stats.transactions.today_volume.toLocaleString()} today`}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentActivity.recent_users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                  <p className={`text-xs ${user.current_kyc?.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.current_kyc?.status || 'No KYC'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending KYC */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Pending KYC Verification</h3>
          <div className="space-y-3">
            {recentActivity.pending_kyc.map((kyc) => (
              <div key={kyc.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{kyc.user?.username}</p>
                    <p className="text-gray-400 text-sm">{kyc.document_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">{new Date(kyc.created_at).toLocaleDateString()}</p>
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