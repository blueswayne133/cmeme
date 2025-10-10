import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Users, DollarSign, Coins, Copy, Check } from "lucide-react"
import api from "../../../utils/api"

const ReferralsPage = () => {
  const [referralData, setReferralData] = useState({
    total_referrals: 0,
    referral_usdc_balance: 0,
    can_claim_referral_usdc: false,
    referrals: {
      data: [],
      current_page: 1,
      last_page: 1
    }
  })
  const [loading, setLoading] = useState(true)
  const [claimLoading, setClaimLoading] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const handleClaimRewards = async () => {
    try {
      setClaimLoading(true)
      const response = await api.post('/referrals/claim')
      await fetchReferralStats()
      if (refetchUserData) await refetchUserData()
      alert(response.data.message || 'USDC rewards claimed successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to claim rewards')
    } finally {
      setClaimLoading(false)
    }
  }

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userData?.referral_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const canClaim = referralData.can_claim_referral_usdc && referralData.referral_usdc_balance > 0
  const showClaimButton = referralData.referral_usdc_balance > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ==== Top Balances Row ==== */}
      <div className="grid grid-cols-2 gap-4">
        {/* USDC Balance */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <DollarSign className="text-blue-400" size={20} />
                Referral USDC Balance
              </p>
              <h2 className="text-3xl font-bold text-gray-100 mt-2">
                ${Number(referralData.referral_usdc_balance || 0).toFixed(2)}
              </h2>
            </div>

            {/* Claim Button (always visible) */}
            <button
              onClick={handleClaimRewards}
              disabled={!canClaim || claimLoading}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                canClaim && !claimLoading
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {claimLoading ? 'Claiming...' : canClaim ? 'Claim' : 'Claim'}
            </button>
          </div>
        </div>

        {/* Token Info */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Coins className="text-yellow-400" size={20} />
                CMEME Balance
              </p>
              <h2 className="text-3xl font-bold text-gray-100 mt-2">
                {userData?.referral_token_balance || userData?.totalBalance || '0.00'}
                <span className="text-xl font-semibold text-yellow-400"> MTK</span>
              </h2>
            </div>
         
          </div>
        </div>
      </div>

      {/* ==== Total Referrals ==== */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 flex flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Users className="text-purple-400" size={24} />
          <div>
            <p className="text-gray-400 text-sm">Total Referrals</p>
            <h2 className="text-3xl font-bold text-gray-100">
              {referralData.total_referrals}
            </h2>
          </div>
        </div>
        <div className={`text-sm px-4 py-2 rounded-lg border ${
          referralData.can_claim_referral_usdc
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          {referralData.can_claim_referral_usdc
            ? '✅ Eligible to claim USDC rewards'
            : '⏳ Awaiting claim approval'}
        </div>
      </div>

      {/* ==== Referral Code ==== */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Your Referral Code</h3>
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-700 w-full text-center">
            <code className="text-yellow-400 font-mono text-lg font-bold">
              {userData?.referral_code || 'Loading...'}
            </code>
          </div>
          <button
            onClick={handleCopyReferralCode}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all w-auto flex items-center justify-center gap-2"
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
          Share this code to earn <span className="text-blue-400">0.1 USDC</span> and <span className="text-yellow-400">0.5 CMEME</span> per referral!
        </p>
      </div>

      {/* ==== Referrals Table ==== */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Your Referrals</h3>

        {referralData.referrals.data.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 font-medium px-4">
              <span>Username</span>
              <span>Email</span>
              <span>Joined</span>
            </div>

            {referralData.referrals.data.map((ref) => (
              <div key={ref.id} className="grid grid-cols-4 gap-3 bg-gray-900/30 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition">
                <span className="text-gray-200 font-medium">{ref.username}</span>
                <span className="text-gray-300 text-sm">{ref.email}</span>
                <span className="text-gray-400 text-sm">{formatDate(ref.created_at)}</span>
              </div>
            ))}

            {/* Pagination */}
            {referralData.referrals.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {Array.from({ length: referralData.referrals.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchReferralStats(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
            <Users size={64} className="text-gray-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-300 mb-2">No Referrals Yet</h4>
            <p className="text-gray-400 max-w-md mx-auto">
              Share your referral code with friends to start earning rewards!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralsPage
