import { ArrowUpRight, ArrowDownLeft, Download, Users } from "lucide-react"

const TransactionHistory = () => {
  // Mock transaction history
  const transactionHistory = [
    { id: 1, type: "send", amount: 50, token: "CMEME", date: "2024-01-15", status: "Completed" },
    { id: 2, type: "receive", amount: 100, token: "CMEME", date: "2024-01-14", status: "Completed" },
    { id: 3, type: "fund", amount: 50, token: "USDC", date: "2024-01-13", status: "Completed" },
    { id: 4, type: "p2p", amount: 25, token: "CMEME", date: "2024-01-12", status: "Completed" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Transaction History</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="space-y-4">
          {transactionHistory.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'send' ? 'bg-red-500/20 text-red-400' :
                  transaction.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                  transaction.type === 'fund' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {transaction.type === 'send' ? <ArrowUpRight size={16} /> :
                   transaction.type === 'receive' ? <ArrowDownLeft size={16} /> :
                   transaction.type === 'fund' ? <Download size={16} /> :
                   <Users size={16} />}
                </div>
                <div>
                  <p className="font-medium text-gray-100 capitalize">
                    {transaction.type} {transaction.token}
                  </p>
                  <p className="text-sm text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'send' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.token}
                </p>
                <p className="text-sm text-gray-400">{transaction.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory