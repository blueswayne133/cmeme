import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, Download, Users, Clock, Filter } from "lucide-react";
import api from "../../../utils/api";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { userData } = useOutletContext();

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // This endpoint needs to be created in your backend
      const response = await api.get('/transactions', {
        params: { filter }
      });
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data if API not ready
      setTransactions([
        { id: 1, type: "send", amount: 50, token: "CMEME", date: "2024-01-15", status: "completed", description: "Transfer to UID789012" },
        { id: 2, type: "receive", amount: 100, token: "CMEME", date: "2024-01-14", status: "completed", description: "Received from UID456789" },
        { id: 3, type: "fund", amount: 50, token: "USDC", date: "2024-01-13", status: "completed" },
        { id: 4, type: "p2p", amount: 25, token: "CMEME", date: "2024-01-12", status: "completed" },
        { id: 5, type: "deposit", amount: 100, token: "USDC", date: "2024-01-11", status: "pending", description: "USDC Deposit - Pending Approval" },
        { id: 6, type: "deposit", amount: 50, token: "USDC", date: "2024-01-10", status: "completed", description: "USDC Deposit - Approved" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send': return <ArrowUpRight size={16} />;
      case 'receive': return <ArrowDownLeft size={16} />;
      case 'fund': return <Download size={16} />;
      case 'p2p': return <Users size={16} />;
      case 'mining': return <Clock size={16} />;
      case 'deposit': return <Download size={16} />;
      default: return <Download size={16} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'send': return 'bg-red-500/20 text-red-400';
      case 'receive': return 'bg-green-500/20 text-green-400';
      case 'fund': return 'bg-blue-500/20 text-blue-400';
      case 'p2p': return 'bg-yellow-500/20 text-yellow-400';
      case 'mining': return 'bg-purple-500/20 text-purple-400';
      case 'deposit': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-100">Transaction History</h2>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Transaction History</h2>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          >
            <option value="all">All Transactions</option>
            <option value="send">Sent</option>
            <option value="receive">Received</option>
            <option value="fund">Funding</option>
            <option value="p2p">P2P Trading</option>
            <option value="mining">Mining</option>
            <option value="deposit">Deposits</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No transactions found</div>
            <div className="text-gray-500 text-sm">Your transaction history will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100 capitalize">
                      {transaction.type} {transaction.token}
                    </p>
                    <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'send' || transaction.type === 'withdrawal' 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {transaction.type === 'send' || transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount} {transaction.token}
                  </p>
                  <p className={`text-sm ${
                    transaction.status === 'completed' ? 'text-green-400' :
                    transaction.status === 'pending' ? 'text-yellow-400' :
                    transaction.status === 'failed' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;