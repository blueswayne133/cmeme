import { useState, useEffect } from "react";
import { 
  Search, Filter, Plus, Edit, Trash2, Download, 
  ArrowUpDown, ChevronLeft, ChevronRight, X,
  CreditCard, TrendingUp, Users, BarChart3
} from "lucide-react";
import { toast } from "react-hot-toast";
import { transactionAPI } from "../../../utils/api";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    user_id: "",
    date_from: "",
    date_to: "",
    sort_field: "created_at",
    sort_direction: "desc"
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [transactionTypes, setTransactionTypes] = useState({});
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_transactions: 0,
    total_volume: 0,
    today_transactions: 0,
    today_volume: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    type: "",
    amount: "",
    description: "",
    metadata: {}
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchUsers();
  }, [filters, pagination.current_page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getTransactions({
        ...filters,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      
      // Handle API response structure
      const responseData = response.data.data || response.data;
      
      if (responseData && Array.isArray(responseData.data)) {
        // Laravel paginated response
        setTransactions(responseData.data);
        setPagination({
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          per_page: responseData.per_page || 15,
          total: responseData.total || 0
        });
      } else if (Array.isArray(responseData)) {
        // Simple array response
        setTransactions(responseData);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: responseData.length,
          total: responseData.length
        });
      } else {
        console.error('Unexpected API response structure:', responseData);
        setTransactions([]);
      }
      
      // Set transaction types from response
      if (response.data.types) {
        setTransactionTypes(response.data.types);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await transactionAPI.getTransactionStats();
      const statsData = response.data.data || response.data;
      
      setStats({
        total_transactions: statsData.total_transactions || 0,
        total_volume: statsData.total_volume || 0,
        today_transactions: statsData.today_transactions || 0,
        today_volume: statsData.today_volume || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await transactionAPI.getUsers({ per_page: 100 });
      const usersData = response.data.data || response.data;
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error('Unexpected users response structure:', usersData);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUsers([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort_field: field,
      sort_direction: prev.sort_field === field && prev.sort_direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      user_id: "",
      date_from: "",
      date_to: "",
      sort_field: "created_at",
      sort_direction: "desc"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionAPI.updateTransaction(editingTransaction.id, formData);
        toast.success("Transaction updated successfully");
      } else {
        await transactionAPI.createTransaction(formData);
        toast.success("Transaction created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Operation failed";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      user_id: transaction.user_id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      metadata: transaction.metadata || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await transactionAPI.deleteTransaction(transaction.id);
      toast.success("Transaction deleted successfully");
      fetchTransactions();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete transaction";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      type: "",
      amount: "",
      description: "",
      metadata: {}
    });
    setEditingTransaction(null);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const SortableHeader = ({ label, field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-semibold text-gray-300 hover:text-white transition-colors"
    >
      {children || label}
      <ArrowUpDown size={14} />
    </button>
  );

  // Safe transactions array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Transaction Management
        </h1>
        <p className="text-gray-400">
          Manage and monitor all platform transactions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total Transactions"
          value={stats.total_transactions?.toLocaleString() || '0'}
          icon={CreditCard}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Volume"
          value={`$${(stats.total_volume || 0).toLocaleString()}`}
          subtitle="All time"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Today's Transactions"
          value={(stats.today_transactions || 0).toLocaleString()}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <StatCard
          title="Today's Volume"
          value={`$${(stats.today_volume || 0).toLocaleString()}`}
          subtitle="24 hours"
          icon={Users}
          color="bg-cyan-500"
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions, users..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-white transition-colors"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {Object.entries(transactionTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User
                </label>
                <select
                  value={filters.user_id}
                  onChange={(e) => handleFilterChange("user_id", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange("date_from", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange("date_to", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-700 rounded-xl p-4 h-32"></div>
            ))
          ) : safeTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No transactions found
            </div>
          ) : (
            safeTransactions.map(transaction => (
              <div key={transaction.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-white">
                      {transaction.user?.username || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transactionTypes[transaction.type] || transaction.type}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </p>
                </div>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {transaction.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <SortableHeader label="ID" field="id">
                    Transaction
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader label="User" field="user_id">
                    User
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader label="Type" field="type">
                    Type
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader label="Amount" field="amount">
                    Amount
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  Description
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader label="Date" field="created_at">
                    Date
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                  </tr>
                ))
              ) : safeTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                safeTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">#{transaction.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {transaction.user?.username || 'N/A'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {transaction.user?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {transactionTypes[transaction.type] || transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 max-w-md truncate">
                        {transaction.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && safeTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} entries
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                disabled={pagination.current_page === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                disabled={pagination.current_page === pagination.last_page}
                className="flex items-center gap-1 px-3 py-2 bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User *
                </label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  {Object.entries(transactionTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="0.000000"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Enter transaction description..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  {editingTransaction ? 'Update' : 'Create'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;