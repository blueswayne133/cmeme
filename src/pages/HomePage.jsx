import React from "react"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-white">
      {/* Hero Section */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          MyToken
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Start mining crypto rewards daily. Join thousands of miners earning MTK tokens.
        </p>
      </div>

      {/* Main CTA Card */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto bg-gray-900 rounded-3xl p-8 border border-gray-800">
          {/* Coin Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-4">
            Start Mining Today
          </h2>
          
          <p className="text-gray-400 text-center mb-8 leading-relaxed">
            Claim 50 MTK tokens every 24 hours. Build your streak and maximize your earnings.
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
          <h2 className="text-2xl font-bold text-center mb-8">
            Platform Stats
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                1,247
              </div>
              <div className="text-gray-400 text-sm">
                Active Miners
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                ₿50K
              </div>
              <div className="text-gray-400 text-sm">
                Total Mined
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-400 text-sm">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="px-4 pb-12">
        <p className="text-center text-gray-400 text-lg">
          Secure • Decentralized • Profitable
        </p>
      </div>
    </div>
  );
};

export default HomePage;