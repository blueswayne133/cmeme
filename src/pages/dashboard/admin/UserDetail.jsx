import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Shield, 
  Wallet, 
  Award, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit3,
  Save,
  X,
  RefreshCw,
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  Plus,
  Trash2,
  LogIn,
  ChevronRight,
  DollarSign,
  BarChart3
} from "lucide-react";
import api from "../../../utils/api";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addBalanceModal, setAddBalanceModal] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setRefreshing(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.data.user);
      setStats(response.data.data.stats || {});
      setEditForm(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/users/${id}`, editForm);
      setUser(editForm);
      setEditMode(false);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setEditMode(false);
  };

  const handleAddBalance = async (formData) => {
    try {
      const requestData = {
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        type: formData.type,
        note: formData.note || 'Admin balance adjustment'
      };

      console.log('Sending balance update request:', {
        userId: user.id,
        data: requestData
      });

      const response = await api.post(`/admin/users/${user.id}/balance`, requestData);
      
      console.log('Balance update response:', response.data);
      
      setAddBalanceModal(false);
      fetchUserDetail(); // Refresh user data
      alert('Balance updated successfully!');
    } catch (error) {
      console.error('Error adding balance:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update balance';
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">User not found</p>
        <button 
          onClick={() => navigate('/admin/users')}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">User Details</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage user account and permissions</p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchUserDetail}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex-1 sm:flex-none text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* Add Balance Button */}
          <button
            onClick={() => setAddBalanceModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex-1 sm:flex-none text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Balance</span>
          </button>
          
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex-1 sm:flex-none text-sm"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2 flex-1 sm:flex-none">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex-1 text-sm"
              >
                <X size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex-1 text-sm"
              >
                <Save size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* User Info Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">
                    {user.username}
                    {user.is_verified && (
                      <CheckCircle className="inline ml-2 text-green-400" size={18} />
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                    {user.kyc_status === 'verified' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        KYC Verified
                      </span>
                    )}
                    {user.two_factor_enabled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        2FA Enabled
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <p className="text-gray-500 text-sm">UID: {user.uid}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-white">{user.email}</span>
                    {user.email_verified_at && (
                      <CheckCircle size={14} className="text-green-400" />
                    )}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-white">{user.phone}</span>
                      {user.phone_verified && (
                        <CheckCircle size={14} className="text-green-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Security</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-white">2FA: {user.two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-white">Last Login: {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Account</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-white">Joined: {formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity size={16} className="text-gray-400" />
                    <span className="text-white">Logins: {user.login_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Edit User Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.is_verified || false}
                        onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">Verified Account</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.phone_verified || false}
                        onChange={(e) => setEditForm({ ...editForm, phone_verified: e.target.checked })}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">Phone Verified</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.two_factor_enabled || false}
                        onChange={(e) => setEditForm({ ...editForm, two_factor_enabled: e.target.checked })}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">2FA Enabled</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Balances Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Balances</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-xs sm:text-sm font-medium">CMEME Tokens</p>
                    <p className="text-white text-lg sm:text-xl font-bold font-mono">
                      {formatBalance(user.token_balance)}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Wallet className="text-blue-400" size={18} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-xs sm:text-sm font-medium">USDC Balance</p>
                    <p className="text-white text-lg sm:text-xl font-bold font-mono">
                      {formatBalance(user.usdc_balance)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CreditCard className="text-green-400" size={18} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-xs sm:text-sm font-medium">Referral USDC</p>
                    <p className="text-white text-lg sm:text-xl font-bold font-mono">
                      {formatBalance(user.referral_usdc_balance)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="text-purple-400" size={18} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-xs sm:text-sm font-medium">Referral Tokens</p>
                    <p className="text-white text-lg sm:text-xl font-bold font-mono">
                      {formatBalance(user.referral_token_balance)}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Award className="text-orange-400" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/admin/users/${user.id}/transactions`)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} />
                  <span>View Transactions</span>
                </div>
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={() => navigate(`/admin/users/${user.id}/trades`)}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl text-green-400 hover:text-green-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} />
                  <span>View Trades</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Earnings</span>
                <span className="text-white font-medium">
                  ${formatBalance(stats.total_earnings || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Transactions</span>
                <span className="text-white font-medium">{stats.total_transactions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Completed Trades</span>
                <span className="text-white font-medium">{stats.completed_trades || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Tasks Completed</span>
                <span className="text-white font-medium">{stats.tasks_completed || 0}</span>
              </div>
            </div>
          </div>

          {/* Referral Info */}
          {user.referral_code && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Referral Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Referral Code</p>
                  <p className="text-white font-mono text-lg">{user.referral_code}</p>
                </div>
                {user.referred_by && (
                  <div>
                    <p className="text-gray-400 text-sm">Referred By</p>
                    <p className="text-white">{user.referrer?.username || 'Unknown'}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm">Total Referrals</p>
                  <p className="text-white text-xl font-bold">{user.referrals?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* KYC Status */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">KYC Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.kyc_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                  user.kyc_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  user.kyc_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {user.kyc_status || 'Not Submitted'}
                </span>
              </div>
              {user.kyc_verified_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Verified At</span>
                  <span className="text-white text-sm">{formatDate(user.kyc_verified_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Balance Modal */}
      {addBalanceModal && (
        <AddBalanceModal
          user={user}
          onClose={() => setAddBalanceModal(false)}
          onSubmit={handleAddBalance}
        />
      )}
    </div>
  );
};

// Add Balance Modal Component for UserDetail
const AddBalanceModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'token',
    type: 'add',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {formData.type === 'add' ? 'Add' : 'Subtract'} Balance
        </h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          Adjust {formData.currency === 'token' ? 'CMEME Token' : 'USDC'} balance for {user?.username}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="token">CMEME Token</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Operation</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Amount</label>
            <input
              type="number"
              step="0.000001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              placeholder={`Enter ${formData.currency === 'token' ? 'CMEME' : 'USDC'} amount`}
              min="0.000001"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Note (Optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm resize-none"
              placeholder="Reason for this adjustment..."
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm"
            >
              {formData.type === 'add' ? 'Add' : 'Subtract'} Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail;