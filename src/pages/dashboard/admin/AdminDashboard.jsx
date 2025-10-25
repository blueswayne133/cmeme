
import { useState, useEffect } from "react";
import { Users, Wallet, CheckCircle, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import api from "../../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKyc: 0,
    pendingDeposits: 0,
    totalVolume: 0,
    todayMining: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{loading ? '...' : value}</p>
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingUp}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Pending KYC"
          value={stats.pendingKyc}
          icon={AlertTriangle}
          color="bg-yellow-500"
          change={-5}
        />
        <StatCard
          title="Pending Deposits"
          value={stats.pendingDeposits}
          icon={Wallet}
          color="bg-orange-500"
          change={15}
        />
        <StatCard
          title="Total Volume"
          value={`$${stats.totalVolume}`}
          icon={BarChart3}
          color="bg-purple-500"
          change={20}
        />
        <StatCard
          title="Today's Mining"
          value={stats.todayMining}
          icon={CheckCircle}
          color="bg-indigo-500"
          change={25}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Signups</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    U{i}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">user{i}@example.com</p>
                    <p className="text-gray-400 text-xs">2 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle size={20} className="text-yellow-400" />
              <div>
                <p className="text-white text-sm font-medium">High withdrawal volume</p>
                <p className="text-gray-400 text-xs">Monitor transaction limits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">System running smoothly</p>
                <p className="text-gray-400 text-xs">All services operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;