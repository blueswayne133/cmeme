import { Wallet } from "lucide-react"

const WalletPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Wallet size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">Wallet</h2>
      <p className="text-gray-400 max-w-md">Manage your tokens and transactions</p>
    </div>
  )
}

export default WalletPage