import { useState, useEffect } from "react";
import { Trophy, Crown, Medal, Star, Calendar, Users, Award } from "lucide-react";
import api from "../../../utils/api";

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    period: "week",
    date_range: "",
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("week");

  useEffect(() => {
    fetchLeaderboard(activePeriod);
  }, [activePeriod]);

  const fetchLeaderboard = async (period) => {
    try {
      setLoading(true);
      const response = await api.get("/leaderboard", { params: { period } });
      setLeaderboardData(response.data.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-amber-600 to-amber-800";
    if (rank <= 10) return "from-purple-500 to-purple-700";
    return "from-gray-600 to-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const topThree = leaderboardData.leaderboard.slice(0, 3);
  const others = leaderboardData.leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy size={32} className="text-gray-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Leaderboard</h2>
            <p className="text-gray-400">Top miners based on CMEME earnings</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-gray-800 rounded-xl p-1">
          {["week", "month"].map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                activePeriod === period
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Calendar size={16} />
              <span className="capitalize">{period}ly</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar size={18} />
          <span className="font-medium capitalize">{activePeriod}ly Ranking</span>
        </div>
        <div className="text-gray-400 text-sm">{leaderboardData.date_range}</div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {topThree.map((user, index) => {
            const rankHeight = index === 0 ? "h-40" : index === 1 ? "h-32" : "h-28";
            const alignClass = index === 0 ? "justify-self-center" : index === 1 ? "justify-self-end" : "justify-self-start";

            return (
              <div key={user.rank} className={`flex flex-col items-center ${alignClass}`}>
                <div className={`relative ${rankHeight} w-24 flex flex-col items-center justify-end`}>
                  <div className={`absolute -top-6 bg-gradient-to-r ${getRankBadgeColor(user.rank)} p-2 rounded-full`}>
                    {user.rank === 1 ? (
                      <Crown size={24} className="text-yellow-200" />
                    ) : (
                      <Medal
                        size={22}
                        className={
                          user.rank === 2
                            ? "text-gray-300"
                            : "text-amber-500"
                        }
                      />
                    )}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-full border-2 border-gray-600"
                  />
                  <div className="text-center mt-3">
                    <h4 className="text-gray-100 font-semibold text-sm">{user.username}</h4>
                    <p className="text-yellow-400 font-bold text-xs">
                      {user.total_earned.toLocaleString()} CMEME
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden mt-6">
        {others.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Rankings Yet</h3>
            <p className="text-gray-400">Start mining to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50 max-h-[600px] overflow-y-auto">
            {others.map((user) => (
              <div key={user.rank} className="p-4 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getRankBadgeColor(
                      user.rank
                    )} flex items-center justify-center text-gray-900 font-bold`}
                  >
                    {user.rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-lg bg-gray-700"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-100 font-medium truncate">
                      {user.username}
                    </h3>
                    <p className="text-gray-500 text-sm">{user.uid}</p>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">
                      {user.total_earned.toLocaleString()} CMEME
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <h4 className="text-gray-300 font-semibold mb-3">Ranking Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Crown className="text-yellow-400" size={16} />
            <span className="text-gray-400">1st Place</span>
          </div>
          <div className="flex items-center gap-2">
            <Medal className="text-gray-400" size={16} />
            <span className="text-gray-400">2nd Place</span>
          </div>
          <div className="flex items-center gap-2">
            <Medal className="text-amber-600" size={16} />
            <span className="text-gray-400">3rd Place</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="text-purple-400" size={16} />
            <span className="text-gray-400">Top 10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
