import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy,
  DollarSign,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  Coins,
  Wallet,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const TopUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('cmeme'); // 'cmeme' or 'usdc'
  const [stats, setStats] = useState({
    total_users: 0,
    users_with_balance: 0,
    total_balance: 0,
    average_balance: 0,
    currency: 'CMEME'
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopUsers();
  }, [currency]);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/top', {
        params: {
          currency: currency,
          limit: 100
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setStats(response.data.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
      toast.error('Failed to fetch top users', {
        duration: 4000,
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success(`User ${user.username} deleted successfully!`, {
        icon: '🗑️',
        duration: 4000,
      });
      fetchTopUsers(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user', {
        duration: 4000,
      });
    }
  };

  const handleView = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: currency === 'usdc' ? 2 : 2,
      maximumFractionDigits: currency === 'usdc' ? 2 : 8
    });
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-500 to-orange-600';
    return 'from-blue-500 to-purple-600';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-400" size={28} />
            Top Users by Balance
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Users with highest {currency === 'usdc' ? 'USDC' : 'CMEME'} balances</p>
        </div>
        
        {/* Currency Toggle */}
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
          <button
            onClick={() => setCurrency('cmeme')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currency === 'cmeme'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins size={16} />
              <span className="hidden sm:inline">CMEME</span>
            </div>
          </button>
          <button
            onClick={() => setCurrency('usdc')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currency === 'usdc'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              <span className="hidden sm:inline">USDC</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-xs sm:text-sm font-medium">Total Users</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.total_users || 0}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="text-blue-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-xs sm:text-sm font-medium">With Balance</p>
              <p className="text-white text-xl sm:text-2xl font-bold">{stats.users_with_balance || 0}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Wallet className="text-green-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-xs sm:text-sm font-medium">Total {stats.currency}</p>
              <p className="text-white text-lg sm:text-xl font-bold truncate">{formatBalance(stats.total_balance)}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="text-purple-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-xs sm:text-sm font-medium">Average</p>
              <p className="text-white text-lg sm:text-xl font-bold truncate">{formatBalance(stats.average_balance)}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <DollarSign className="text-orange-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/80">
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-400 mt-2">Loading top users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <Trophy size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-lg">No users found</p>
                      <p className="text-sm">No users with {currency === 'usdc' ? 'USDC' : 'CMEME'} balance</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const rank = index + 1;
                  const balance = currency === 'usdc' ? user.usdc_balance : user.token_balance;
                  return (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-all duration-200 group">
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} text-white font-bold text-sm shadow-lg`}>
                          {getRankIcon(rank)}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold truncate text-sm sm:text-base">{user.username}</p>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">{user.email}</p>
                            {user.phone && (
                              <p className="text-gray-500 text-xs flex items-center gap-1">
                                <Phone size={10} />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {currency === 'usdc' ? (
                              <DollarSign size={14} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <Coins size={14} className="text-yellow-400 flex-shrink-0" />
                            )}
                            <p className="text-white font-bold text-sm sm:text-base">
                              {formatBalance(balance)} {currency === 'usdc' ? 'USDC' : 'CMEME'}
                            </p>
                          </div>
                          {currency === 'cmeme' && user.usdc_balance > 0 && (
                            <p className="text-gray-400 text-xs">
                              ${formatBalance(user.usdc_balance)} USDC
                            </p>
                          )}
                          {currency === 'usdc' && user.token_balance > 0 && (
                            <p className="text-gray-400 text-xs">
                              {formatBalance(user.token_balance)} CMEME
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_verified 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            {user.two_factor_enabled && (
                              <CheckCircle size={10} className="text-blue-400" />
                            )}
                            {user.phone_verified && (
                              <Phone size={10} className="text-green-400" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className="text-gray-300">
                          <p className="font-medium text-xs sm:text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-1 flex-wrap opacity-100 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleView(user)}
                            className="p-1.5 md:p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 md:p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-3 sm:p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading top users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={48} className="mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            users.map((user, index) => {
              const rank = index + 1;
              const balance = currency === 'usdc' ? user.usdc_balance : user.token_balance;
              return (
                <div key={user.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 sm:p-4 space-y-3">
                  {/* User Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} text-white font-bold text-sm shadow-lg`}>
                        {getRankIcon(rank)}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{user.username}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {mobileMenuOpen === user.id && (
                        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 min-w-[140px]">
                          <button
                            onClick={() => {
                              handleView(user);
                              setMobileMenuOpen(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-blue-500/20 flex items-center gap-2"
                          >
                            <Eye size={12} />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(user);
                              setMobileMenuOpen(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                          >
                            <Trash2 size={12} />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs">Balance</p>
                        <p className="text-white font-bold text-lg">
                          {formatBalance(balance)} {currency === 'usdc' ? 'USDC' : 'CMEME'}
                        </p>
                      </div>
                      {currency === 'usdc' ? (
                        <DollarSign size={24} className="text-blue-400" />
                      ) : (
                        <Coins size={24} className="text-yellow-400" />
                      )}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.is_verified 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400">Joined</p>
                      <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUsersPage;

