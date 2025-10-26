import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import logo from "../assets/logo.jpg.png"

const HomePage = () => {
    const navigate = useNavigate()
    const [platformStats, setPlatformStats] = useState({
        active_miners: 0,
        total_mined: 0,
        total_usdc: 0,
        uptime: 99.9
    })
    const [loading, setLoading] = useState(true)

    // Fetch platform statistics
    useEffect(() => {
        const fetchPlatformStats = async () => {
            try {
                setLoading(true)
                const response = await api.get('/platform-statistics')
                if (response.data.status === 'success') {
                    setPlatformStats(response.data.data)
                }
            } catch (error) {
                console.error('Error fetching platform stats:', error)
                // Fallback to default values if API fails
                setPlatformStats({
                    active_miners: 1247,
                    total_mined: 50000,
                    total_usdc: 10000,
                    uptime: 99.9
                })
            } finally {
                setLoading(false)
            }
        }

        fetchPlatformStats()

        // Refresh stats every 5 minutes
        const interval = setInterval(fetchPlatformStats, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    // Format large numbers with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-white">
            {/* Hero Section */}
            <div className="px-4 pt-12 pb-8 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    CMEME Token
                </h1>
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Start mining crypto rewards daily. Join thousands of miners earning CMEME tokens.
                </p>
            </div>

            {/* Main CTA Card */}
            <div className="px-4 pb-8">
                <div className="max-w-lg mx-auto bg-gray-900 rounded-3xl p-8 border border-gray-800">
                    {/* Coin Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden">
                            <img
                                src={logo}
                                alt="CMEME TOKEN Logo"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center mb-4">
                        Start Mining Today
                    </h2>
                    
                    <p className="text-gray-400 text-center mb-8 leading-relaxed">
                        Claim 1 CMEME tokens every 24 hours. Build your streak and maximize your earnings.
                    </p>

                    <button 
                        onClick={() => navigate("/auth")}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg py-4 rounded-full hover:opacity-90 transition-opacity"
                    >
                        Start Mining Now
                    </button>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="px-4 pb-8">
                <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
                    {/* Referral System Card */}
                    <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">
                            Referral System
                        </h3>
                        <p className="text-gray-400 text-center text-sm">
                            Earn 10% from referrals
                        </p>
                    </div>

                    {/* Complete Tasks Card */}
                    <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 3v2H4v16h16V5h-3V3h-2v2H9V3H7zm0 4h10v10H7V7zm2 2v2h2V9H9zm4 0v2h2V9h-2zm-4 4v2h2v-2H9zm4 0v2h2v-2h-2z"/>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                <path d="M18 8l-7 7-4-4-1.5 1.5L11 18l8.5-8.5z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">
                            Complete Tasks
                        </h3>
                        <p className="text-gray-400 text-center text-sm">
                            Bonus rewards available
                        </p>
                    </div>

                    {/* Base Network Card */}
                    <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">
                            Base Network
                        </h3>
                        <p className="text-gray-400 text-center text-sm">
                            Connect your wallet
                        </p>
                    </div>

                    {/* Daily Rewards Card */}
                    <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                                24h
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">
                            Daily Rewards
                        </h3>
                        <p className="text-gray-400 text-center text-sm">
                            Consistent earnings
                        </p>
                    </div>
                </div>
            </div>

          
{/* Platform Stats */}
<div className="px-4 pb-8">
  <div className="max-w-2xl mx-auto bg-gray-900 rounded-3xl p-8 border border-gray-800">
    <h2 className="text-2xl font-bold text-center mb-8">Platform Stats</h2>

    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {/* Active Miners */}
        <div className="flex flex-col items-center break-words min-w-0">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2 truncate max-w-full">
            {formatNumber(platformStats.active_miners)}
          </div>
          <div className="text-gray-400 text-sm">Active Miners</div>
        </div>

        {/* Total Mined */}
        <div className="flex flex-col items-center break-words min-w-0">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2 truncate max-w-full">
            ₿{formatNumber(platformStats.total_mined)}
          </div>
          <div className="text-gray-400 text-sm">Total Mined</div>
        </div>

        {/* Uptime */}
        <div className="flex flex-col items-center break-words min-w-0">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2 truncate max-w-full">
            {platformStats.uptime}%
          </div>
          <div className="text-gray-400 text-sm">Uptime</div>
        </div>
      </div>
    )}
  </div>
</div>


            {/* Footer Tagline */}
            <div className="px-4 pb-12">
                <p className="text-center text-gray-400 text-lg">
                    Secure • Decentralized • Profitable
                </p>
            </div>
        </div>
    )
}

export default HomePage