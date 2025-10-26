"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  X,
  User,
  Copy,
  Check,
} from "lucide-react"
import SidebarContent from "./SidebarContent"
import DashboardContent from "./DashboardContent"
import ProfilePage from "./ProfilePage"
import TransactionHistory from "./TransactionHistory"
import TasksPage from "./TasksPage"
import ReferralsPage from "./ReferralsPage"
import LeaderboardPage from "./LeaderboardPage"
import WalletPage from "./WalletPage"
import P2PTradePage from "./P2PTradePage"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [fundType, setFundType] = useState(null)
  const [copied, setCopied] = useState(false)

  // Mock user data
  const userData = {
    username: "demo",
    tokens: 885,
    verified: false,
    uid: "UID123456789",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    totalBalance: 100,
    totalUSDC: 10.0,
    miningProgress: 0,
    dailyReward: 50,
    streak: 2,
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardContent 
          userData={userData} 
          setSendModalOpen={setSendModalOpen}
          setFundModalOpen={setFundModalOpen}
        />
      case "profile":
        return <ProfilePage userData={userData} />
      case "history":
        return <TransactionHistory />
      case "tasks":
        return <TasksPage />
      case "referrals":
        return <ReferralsPage />
      case "leaderboard":
        return <LeaderboardPage />
      case "wallet":
        return <WalletPage />
      case "p2p":
        return <P2PTradePage />
      default:
        return <DashboardContent 
          userData={userData} 
          setSendModalOpen={setSendModalOpen}
          setFundModalOpen={setFundModalOpen}
        />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-gray-700/50">
        <SidebarContent 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setSidebarOpen={setSidebarOpen}
          userData={userData}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 w-80 h-full z-50 lg:hidden shadow-2xl">
            <SidebarContent 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setSidebarOpen={setSidebarOpen}
              userData={userData}
            />
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
                <h1 className="text-xl font-bold text-yellow-400">CMEME TOKEN</h1>
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
          {renderPage()}
        </main>
      </div>

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
                <p className="text-gray-400 mb-4">Choose funding method:</p>
                <button
                  onClick={() => setFundType("cmeme")}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg"
                >
                  Fund with CMEME
                </button>
                <button
                  onClick={() => setFundType("usdc")}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-all shadow-lg"
                >
                  Fund with USDC
                </button>
              </div>
            ) : fundType === "cmeme" ? (
              <div className="p-6 space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Your UID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-950 px-3 py-2 rounded-lg text-yellow-400 font-mono text-sm">
                      {userData.uid}
                    </code>
                    <button
                      onClick={() => handleCopy(userData.uid)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Share this UID with the sender. Transaction will be auto-verified.
                </p>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-400 text-sm">✓ You can withdraw CMEME tokens anytime</p>
                </div>
                <button
                  onClick={() => {
                    setFundType(null)
                    setFundModalOpen(false)
                  }}
                  className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 space-y-3">
                  <p className="text-gray-400 text-sm">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-950 px-3 py-2 rounded-lg text-blue-400 font-mono text-xs break-all">
                      {userData.walletAddress}
                    </code>
                    <button
                      onClick={() => handleCopy(userData.walletAddress)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex-shrink-0"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-gray-200">Ethereum (ERC-20)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Min. Deposit:</span>
                      <span className="text-gray-200">10 USDC</span>
                    </div>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ USDC deposits cannot be withdrawn. Only CMEME withdrawals allowed.
                  </p>
                </div>
                <p className="text-gray-400 text-sm">Transaction will be auto-verified within 10 minutes.</p>
                <button
                  onClick={() => {
                    setFundType(null)
                    setFundModalOpen(false)
                  }}
                  className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-colors"
                >
                  Close
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter wallet address or UID"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount (CMEME)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <p className="text-xs text-gray-400">Available: {userData.totalBalance} CMEME</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ Only CMEME tokens can be sent. USDC transfers are not available.
                </p>
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all shadow-lg">
                Send Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}