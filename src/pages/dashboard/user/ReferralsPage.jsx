import { Users } from "lucide-react"

const ReferralsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Users size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">Referrals</h2>
      <p className="text-gray-400 max-w-md">Invite friends and earn 10% commission</p>
    </div>
  )
}

export default ReferralsPage