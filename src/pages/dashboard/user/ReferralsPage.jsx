import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Users, DollarSign, Coins, Copy, Check, UserCheck, UserX, Sparkles } from "lucide-react"
import api from "../../../utils/api"

const ReferralsPage = () => {
  const [referralData, setReferralData] = useState({
    total_referrals: 0,
    verified_referrals: 0,
    pending_referrals: 0,
    total_usdc_earned: 0,
    total_cmeme_earned: 0,
    pending_usdc_balance: 0,
    referrals: {
      data: [],
      current_page: 1,
      last_page: 1,
      total: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [claimingUSDC, setClaimingUSDC] = useState(false)
  const { userData, refetchUserData } = useOutletContext()

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async (page = 1) => {
    try {
      setLoading(true)
      const response = await api.get(`/referrals/stats?page=${page}`)
      setReferralData(response.data.data)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userData?.referral_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClaimUSDC = async () => {
    if (!userData?.can_claim_referral_usdc) {
      alert('USDC claiming is currently disabled by admin')
      return
    }

    if (referralData.pending_usdc_balance <= 0) {
      alert('No USDC available to claim')
      return
    }

    try {
      setClaimingUSDC(true)
      const response = await api.post('/referrals/claim-usdc')
      
      alert(response.data.message)
      
      // Refresh data
      await fetchReferralStats()
      if (refetchUserData) await refetchUserData()
      
    } catch (error) {
      console.error('Error claiming USDC:', error)
      alert(error.response?.data?.message || 'Failed to claim USDC')
    } finally {
      setClaimingUSDC(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getReferralStatus = (referral) => {
    if (referral.kyc_status === 'verified' && referral.is_verified) {
      return { 
        status: 'verified', 
        label: 'KYC Verified', 
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30'
      }
    } else if (referral.kyc_status === 'pending') {
      return { 
        status: 'pending', 
        label: 'KYC Pending', 
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30'
      }
    } else if (referral.kyc_status === 'rejected') {
      return { 
        status: 'rejected', 
        label: 'KYC Rejected', 
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30'
      }
    } else {
      return { 
        status: 'not_submitted', 
        label: 'KYC Not Started', 
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30'
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ==== Total Earnings ==== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* USDC Earned */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-400" size={24} />
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Total USDC Earned</p>
              <h2 className="text-3xl font-bold text-gray-100">
                ${Number(referralData.total_usdc_earned || 0).toFixed(2)}
              </h2>
              <p className="text-green-400 text-xs mt-1">
                From {referralData.verified_referrals} verified referrals
              </p>
              
              {/* Claim USDC Button */}
              {referralData.pending_usdc_balance > 0 && (
                <div className="mt-3">
                  <button
                    onClick={handleClaimUSDC}
                    disabled={!userData?.can_claim_referral_usdc || claimingUSDC}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {claimingUSDC ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <DollarSign size={16} />
                        Claim ${Number(referralData.pending_usdc_balance || 0).toFixed(2)} USDC
                      </>
                    )}
                  </button>
                  {!userData?.can_claim_referral_usdc && (
                    <p className="text-yellow-400 text-xs mt-2 text-center">
                      USDC claiming is currently disabled by admin
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CMEME Earned */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <Coins className="text-yellow-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Total CMEME Earned</p>
              <h2 className="text-3xl font-bold text-gray-100">
                {Number(referralData.total_cmeme_earned || 0).toFixed(2)}
                <span className="text-xl font-semibold text-yellow-400"> CMEME</span>
              </h2>
              <p className="text-green-400 text-xs mt-1">
                From {referralData.verified_referrals} verified referrals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==== Referral Stats ==== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Referrals */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Total Referrals</p>
              <h2 className="text-3xl font-bold text-gray-100">
                {referralData.total_referrals}
              </h2>
            </div>
          </div>
        </div>

        {/* Verified Referrals */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Verified Referrals</p>
              <h2 className="text-3xl font-bold text-gray-100">
                {referralData.verified_referrals}
              </h2>
              <p className="text-green-400 text-xs mt-1">Rewards earned</p>
            </div>
          </div>
        </div>

        {/* Pending Referrals */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <UserX className="text-yellow-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Pending KYC</p>
              <h2 className="text-3xl font-bold text-gray-100">
                {referralData.pending_referrals}
              </h2>
              <p className="text-yellow-400 text-xs mt-1">Awaiting verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-green-400" size={24} />
          <div>
            <h3 className="text-green-400 font-semibold mb-1">Automatic Rewards</h3>
            <p className="text-green-300 text-sm">
              CMEME rewards are automatically added to your balance. USDC rewards require manual claiming when enabled by admin.
            </p>
          </div>
        </div>
      </div>

      {/* ==== Referral Code ==== */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Your Referral Code</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <code className="text-yellow-400 font-mono text-lg font-bold break-all">
              {userData?.referral_code || 'Loading...'}
            </code>
          </div>
          <button
            onClick={handleCopyReferralCode}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} /> Copied
              </>
            ) : (
              <>
                <Copy size={18} /> Copy
              </>
            )}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-3 text-center">
          Share this code to earn <span className="text-blue-400">0.1 USDC</span> and <span className="text-yellow-400">0.5 CMEME</span> per referral after they complete KYC!
        </p>
      </div>

      {/* ==== Referrals Table ==== */}
      <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6 border border-gray-700/50">
        <h3 className="text-base sm:text-lg font-bold text-gray-100 mb-4">Your Referrals</h3>

        {referralData.referrals.data.length > 0 ? (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-4 text-xs sm:text-sm text-gray-400 font-medium px-2 sm:px-4">
              <span>Username</span>
              <span>Joined</span>
              <span>KYC Status</span>
              <span>Reward Status</span>
            </div>

            {/* Table Items */}
            {referralData.referrals.data.map((ref) => {
              const status = getReferralStatus(ref);
              const isVerified = status.status === 'verified';
              
              return (
                <div
                  key={ref.id}
                  className={`grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 rounded-xl p-3 sm:p-4 border transition ${
                    isVerified 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-gray-900/30 border-gray-700/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:col-span-1">
                    <span className="text-gray-400 text-xs sm:hidden">Username</span>
                    <span className="text-gray-200 font-medium break-words">{ref.username}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:col-span-1">
                    <span className="text-gray-400 text-xs sm:hidden">Joined</span>
                    <span className="text-gray-400 text-sm">{formatDate(ref.created_at)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:col-span-1">
                    <span className="text-gray-400 text-xs sm:hidden">KYC Status</span>
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:col-span-1">
                    <span className="text-gray-400 text-xs sm:hidden">Reward Status</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isVerified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {isVerified ? (
                        <div className="flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>Rewards Added</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <UserX size={12} />
                          <span>Pending KYC</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {referralData.referrals.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {Array.from({ length: referralData.referrals.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchReferralStats(page)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                      page === referralData.referrals.current_page
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="text-gray-600 mx-auto mb-4 sm:size-16" />
            <h4 className="text-lg sm:text-xl font-bold text-gray-300 mb-2">No Referrals Yet</h4>
            <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto px-4">
              Share your referral code with friends to start earning rewards after they complete KYC verification!
            </p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <h4 className="text-blue-400 font-semibold mb-3">How Referral Rewards Work</h4>
        <ul className="text-blue-300 text-sm space-y-2">
          <li>• <strong className="text-blue-200">0.1 USDC + 0.5 CMEME</strong> per verified referral</li>
          <li>• <strong className="text-green-400">CMEME rewards</strong> are automatically added to your balance</li>
          <li>• <strong className="text-blue-400">USDC rewards</strong> require manual claiming when enabled by admin</li>
          <li>• Only verified referrals generate rewards</li>
          <li>• Check your main wallet balance to see earned rewards</li>
        </ul>
      </div>
    </div>
  )
}

export default ReferralsPage