import { useState } from "react"
import {
  Home,
  CheckSquare,
  Users,
  Trophy,
  Wallet,
  LogOut,
  Copy,
  Check,
  Lock,
  History,
  Download,
  Link,
  X,
} from "lucide-react"

const SidebarContent = ({ currentPage, setCurrentPage, setSidebarOpen, userData }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  const walletNavItems = [
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "history", label: "History", icon: History },
    { id: "p2p", label: "P2P Trade", icon: Users },
  ]

  const NavItem = ({ item }) => {
    const Icon = item.icon
    const isActive = currentPage === item.id

    return (
      <button
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
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1419] text-gray-200 overflow-y-auto">
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
      <div className="px-6 py-4 space-y-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-gray-900">
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{userData.username}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400">{userData.uid}</p>
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

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
            Main
          </h3>
          {mainNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Wallet & Trading */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
            Wallet & Tradingggg
          </h3>
          {walletNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Staking & Connections */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
            Staking & Connections
          </h3>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all font-medium">
            <Link size={20} />
            <span>Connect Wallet</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all font-medium">
            <Lock size={20} />
            <span>Withdraw Tokens</span>
          </button>

          {/* Staking Options */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all font-medium">
              <Download size={20} />
              <span>Stake CMEME</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all font-medium">
              <Download size={20} />
              <span>Stake USDC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors font-medium">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default SidebarContent