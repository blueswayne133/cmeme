// src/pages/dashboard/LeaderboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Calendar,
  Crown,
  Medal,
  Star,
  Users,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import api from "../../../utils/api";
import { useNavigate } from "react-router-dom";

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    period: "week",
    date_range: "",
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activePeriod, setActivePeriod] = useState("week");
  const navigate = useNavigate();

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (period, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await api.get("/leaderboard", { params: { period } });
      const payload = res.data?.data || res.data || {};
      
      setLeaderboardData({
        period: payload.period || period,
        date_range: payload.date_range || payload.dateRange || "",
        leaderboard: payload.leaderboard || payload.ranking || [],
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboardData((prev) => ({ ...prev, leaderboard: [] }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaderboard(activePeriod);
  }, [activePeriod, fetchLeaderboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(activePeriod, true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activePeriod, fetchLeaderboard]);

  // Manual refresh
  const handleRefresh = () => {
    fetchLeaderboard(activePeriod, true);
  };

  // Period change handler
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  // helper: pick avatar field used in your DashboardLayout
  const backendAvatarFrom = (user) => {
    if (!user) return "";
    return user.avatar_url || user.avatar || user.avatarUrl || "";
  };

  // DiceBear generator (same as in DashboardLayout)
  const generateAvatarUrl = (username = "guest", style = "adventurer") => {
    const seed = encodeURIComponent(username || "guest");
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-orange-500";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-amber-500 to-amber-700";
    if (rank <= 10) return "from-purple-500 to-purple-700";
    return "from-gray-600 to-gray-800";
  };

  const getPodiumColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-orange-500";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-amber-500 to-amber-700";
    return "from-gray-600 to-gray-800";
  };

  const formatTimeSince = (date) => {
    if (!date) return "Never";
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const list = leaderboardData.leaderboard || [];
  const topThree = list.slice(0, 3);
  const others = list.slice(3);

  return (
    <div className="space-y-6 pb-12">
      {/* Top header - using dashboard gradient */}
      <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-b-3xl pb-6 pt-6 px-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-white hover:bg-purple-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-white">Rankings</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg text-white hover:bg-purple-700/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button className="text-sm text-white/90 hover:text-white transition-colors">
              rules
            </button>
          </div>
        </div>

        {/* Last updated time */}
        {lastUpdated && (
          <div className="text-center text-xs text-white/70 mt-1">
            Updated {formatTimeSince(lastUpdated)}
          </div>
        )}

        {/* toggle (week / month) */}
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-white/15 p-1 rounded-full inline-flex gap-1">
            {["week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activePeriod === p
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-md"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* date range */}
        <div className="mt-3 text-center text-sm text-white/90">
          {leaderboardData.date_range || "—"}
        </div>

        {/* podium container */}
        <div className="mt-6">
          <div className="max-w-[720px] mx-auto px-2">
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-full h-1/2 flex justify-center">
                  <div className={`bg-gradient-to-b ${getPodiumColor(2)} rounded-t-xl w-full max-w-[120px] h-32 relative flex items-end justify-center shadow-lg`}>
                    {topThree[1] && (
                      <div className="absolute -top-6 bg-gradient-to-r from-gray-400 to-gray-600 p-2 rounded-full shadow-lg border-2 border-white">
                        <Medal size={22} className="text-white" />
                      </div>
                    )}
                    <img
                      src={
                        backendAvatarFrom(topThree[1]) ||
                        generateAvatarUrl(topThree[1]?.username, "adventurer")
                      }
                      alt={topThree[1]?.username || "user"}
                      className="w-16 h-16 rounded-full border-2 border-white mb-3 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 pb-3 text-center">
                      <div className="text-white font-semibold truncate text-sm">
                        {topThree[1]?.username || "No one"}
                      </div>
                      <div className="text-white text-xs font-bold">
                        {topThree[1]
                          ? Number(topThree[1].total_earned).toLocaleString()
                          : "0"}{" "}
                        CMEME
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-white text-lg font-bold mt-2">2nd</div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <div className={`bg-gradient-to-b ${getPodiumColor(1)} rounded-t-2xl w-full max-w-[140px] h-44 relative flex items-end justify-center shadow-xl`}>
                    {topThree[0] && (
                      <div className="absolute -top-8 bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg border-2 border-white">
                        <Crown size={24} className="text-white" />
                      </div>
                    )}
                    <img
                      src={
                        backendAvatarFrom(topThree[0]) ||
                        generateAvatarUrl(topThree[0]?.username, "adventurer")
                      }
                      alt={topThree[0]?.username || "user"}
                      className="w-20 h-20 rounded-full border-4 border-white mb-3 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 pb-4 text-center">
                      <div className="text-white font-bold truncate">
                        {topThree[0]?.username || "No one"}
                      </div>
                      <div className="text-white text-sm font-bold">
                        {topThree[0]
                          ? Number(topThree[0].total_earned).toLocaleString()
                          : "0"}{" "}
                        CMEME
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-yellow-400 text-lg font-bold mt-2">1st</div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-full h-1/2 flex justify-center">
                  <div className={`bg-gradient-to-b ${getPodiumColor(3)} rounded-t-xl w-full max-w-[120px] h-28 relative flex items-end justify-center shadow-lg`}>
                    {topThree[2] && (
                      <div className="absolute -top-6 bg-gradient-to-r from-amber-500 to-amber-700 p-2 rounded-full shadow-lg border-2 border-white">
                        <Medal size={22} className="text-white" />
                      </div>
                    )}
                    <img
                      src={
                        backendAvatarFrom(topThree[2]) ||
                        generateAvatarUrl(topThree[2]?.username, "adventurer")
                      }
                      alt={topThree[2]?.username || "user"}
                      className="w-16 h-16 rounded-full border-2 border-white mb-3 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 pb-3 text-center">
                      <div className="text-white font-semibold truncate text-sm">
                        {topThree[2]?.username || "No one"}
                      </div>
                      <div className="text-white text-xs font-bold">
                        {topThree[2]
                          ? Number(topThree[2].total_earned).toLocaleString()
                          : "0"}{" "}
                        CMEME
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-amber-500 text-lg font-bold mt-2">3rd</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard list container */}
      <div className="mx-4 -mt-6 rounded-t-3xl bg-gray-800/80 backdrop-blur-sm shadow-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4">
          {others.length === 0 && list.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Trophy size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-lg font-semibold mb-2">No Rankings Yet</p>
              <p className="text-sm">Start mining to appear on the leaderboard!</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
              >
                Start Mining
              </button>
            </div>
          ) : others.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p>Only top 3 rankings available</p>
              <p className="text-sm mt-2">Keep mining to see more rankings!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {others.map((user) => (
                <div key={user.rank} className="flex items-center gap-4 py-4 hover:bg-gray-700/30 transition-colors">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-r ${getRankBadgeColor(
                      user.rank
                    )} text-white shadow-lg`}
                  >
                    {user.rank}
                  </div>

                  <img
                    src={
                      backendAvatarFrom(user) ||
                      generateAvatarUrl(user.username || user.uid || "guest", "adventurer")
                    }
                    alt={user.username || user.uid}
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/50"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="font-semibold text-gray-100 truncate">
                          {user.username || user.uid}
                        </div>
                        <div className="text-sm text-gray-400 truncate">{user.uid || ""}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-sm font-bold text-yellow-400">
                          {Number(user.total_earned).toLocaleString()} CMEME
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.transaction_count} claim{user.transaction_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* bottom legend */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-yellow-400" />
                <span>1st Place</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal size={16} className="text-gray-300" />
                <span>2nd Place</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal size={16} className="text-amber-500" />
                <span>3rd Place</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-yellow-400">
              <Star size={16} />
              <span>Top {list.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;