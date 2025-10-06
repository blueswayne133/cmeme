import { useState } from "react"
import { Copy, Check } from "lucide-react"

const ProfilePage = ({ userData }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Profile Details</h2>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-gray-900">
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">{userData.username}</h3>
            <div
              className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-medium ${
                userData.verified
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {userData.verified ? "✓ Verified" : "Not Verified"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400">Total Tokens</span>
            <span className="font-semibold text-gray-100">{userData.tokens} MTK</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400">User ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-yellow-400">{userData.uid}</span>
              <button
                onClick={() => handleCopy(userData.uid)}
                className="p-1 rounded hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400">Current Streak</span>
            <span className="font-semibold text-gray-100">{userData.streak} days</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-400">Daily Reward</span>
            <span className="font-semibold text-yellow-400">{userData.dailyReward} MTK</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage