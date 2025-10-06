import { Users } from "lucide-react"

const P2PTradePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Users size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">P2P Trading</h2>
      <p className="text-gray-400 max-w-md">Trade tokens directly with other users</p>
    </div>
  )
}

export default P2PTradePage