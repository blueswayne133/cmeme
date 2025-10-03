"use client"

import { useState, useEffect } from "react"
import {
  Home,
  CheckSquare,
  Users,
  Trophy,
  Wallet,
  Menu,
  X,
  LogOut,
  User,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [fundType, setFundType] = useState(null)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("23:56:35")

  // Mock user data
  const userData = {
    username: "demo",
    tokens: 885,
    verified: false,
    uid: "UID123456789",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    totalBalance: 100,
    totalUSD: 10.0,
    miningProgress: 0,
    dailyReward: 50,
    streak: 2,
  }

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, minutes, seconds] = timeRemaining.split(":").map(Number)
      let totalSeconds = hours * 3600 + minutes * 60 + seconds - 1

      if (totalSeconds < 0) totalSeconds = 86399

      const newHours = Math.floor(totalSeconds / 3600)
      const newMinutes = Math.floor((totalSeconds % 3600) / 60)
      const newSeconds = totalSeconds % 60

      setTimeRemaining(
        `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f1419] text-gray-200">
      {/* Close button - mobile only */}
      <div className="flex justify-end p-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-gray-900">
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{userData.username}</h3>
            <p className="text-sm text-gray-400">{userData.uid}</p>
          </div>
        </div>

        {/* Verification Badge */}
        <div
          className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
            userData.verified
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {userData.verified ? "✓ Verified" : "Not Verified"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg"
                  : "text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  const ProfilePage = () => (
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
            <span className="font-mono text-sm text-yellow-400">{userData.uid}</span>
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

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Balance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-100">{userData.totalBalance}</span>
            <span className="text-xl font-semibold text-yellow-400">MTK</span>
          </div>
        </div>

        {/* USD Balance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Total USD</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-100">${userData.totalUSD.toFixed(2)}</span>
            <span className="text-xl font-semibold text-gray-400">USD</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSendModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowUpRight size={20} />
          <span>Send</span>
        </button>
        <button
          onClick={() => setFundModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowDownLeft size={20} />
          <span>Fund</span>
        </button>
      </div>

      {/* Mining Progress */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-100">Mining Progress</h3>
          <span className="text-gray-400 font-semibold">{userData.miningProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${userData.miningProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">
          Next reward in: <span className="text-gray-200 font-mono font-semibold">{timeRemaining}</span>
        </p>
      </div>

      {/* Wait Button */}
      <button disabled className="w-full py-4 rounded-xl bg-gray-700/30 text-gray-500 font-semibold cursor-not-allowed">
        Wait for next reward
      </button>

      {/* Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Daily Reward</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{userData.dailyReward}</span>
            <span className="text-lg font-semibold text-yellow-400">MTK</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{userData.streak}</span>
            <span className="text-lg font-semibold text-yellow-400">days</span>
          </div>
        </div>
      </div>
    </div>
  )

  const PlaceholderPage = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Icon size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
      <p className="text-gray-400 max-w-md">{description}</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-gray-700/50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 w-80 h-full z-50 lg:hidden shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <Menu size={24} className="text-gray-200" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-yellow-400">MyToken</h1>
                <p className="text-xs text-gray-400">Mining Platform</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("profile")}
              className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <User size={20} className="text-gray-200" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          {currentPage === "dashboard" && <DashboardContent />}
          {currentPage === "profile" && <ProfilePage />}
          {currentPage === "tasks" && (
            <PlaceholderPage icon={CheckSquare} title="Tasks" description="Complete tasks to earn bonus rewards" />
          )}
          {currentPage === "referrals" && (
            <PlaceholderPage icon={Users} title="Referrals" description="Invite friends and earn 10% commission" />
          )}
          {currentPage === "leaderboard" && (
            <PlaceholderPage icon={Trophy} title="Leaderboard" description="See top miners and rankings" />
          )}
          {currentPage === "wallet" && (
            <PlaceholderPage icon={Wallet} title="Wallet" description="Manage your tokens and transactions" />
          )}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 lg:hidden z-30">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Fund Modal */}
      {fundModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setFundModalOpen(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-100">Fund Account</h2>
              <button
                onClick={() => setFundModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {!fundType ? (
              <div className="p-6 space-y-4">
                <button
                  onClick={() => setFundType("token")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
                >
                  Fund with Token
                </button>
                <button
                  onClick={() => setFundType("usd")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Fund with USD
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Send {fundType.toUpperCase()} to this address:</p>
                  <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-xl">
                    <span className="font-mono text-sm text-gray-100 truncate">{userData.walletAddress}</span>
                    <button
                      onClick={() => handleCopy(userData.walletAddress)}
                      className="ml-2 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setFundModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-gray-700/50 text-gray-300 font-semibold hover:bg-gray-700 transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSendModalOpen(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-100">Send Tokens</h2>
              <button
                onClick={() => setSendModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Recipient UID"
                className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                onClick={() => setSendModalOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
