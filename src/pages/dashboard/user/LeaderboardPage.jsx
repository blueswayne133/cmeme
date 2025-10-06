import { Trophy } from "lucide-react"

const LeaderboardPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Trophy size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">Leaderboard</h2>
      <p className="text-gray-400 max-w-md">See top miners and rankings</p>
    </div>
  )
}

export default LeaderboardPage