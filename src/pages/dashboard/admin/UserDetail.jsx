// src/pages/admin/UserDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Shield, 
  Wallet, 
  Award, 
  Calendar, 
  Phone, 
  User,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Plus,
  LogIn,
  Trash2
} from "lucide-react";

import api from "../../../utils/api";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.data.user);
      setEditForm(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${id}`, editForm);
      setUser(editForm);
      setEditMode(false);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setEditMode(false);
  };

  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User size={64} className="mx-auto text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-6">The requested user could not be found.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400">{user.email}</p>
              {user.phone && (
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Phone size={14} />
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 lg:flex-none justify-center"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button
                onClick={() => {/* Implement send email */}}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex-1 lg:flex-none justify-center"
              >
                <Mail size={16} />
                Send Email
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex-1 lg:flex-none justify-center"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex-1 lg:flex-none justify-center"
              >
                <Save size={16} />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">CMEME Balance</p>
              <div className="flex items-center gap-2">
                <p className="text-white text-xl font-bold">
                  {showBalance ? formatBalance(user.token_balance) : '••••••'}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="text-blue-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">USDC Balance</p>
              <p className="text-white text-xl font-bold">
                ${showBalance ? formatBalance(user.usdc_balance) : '••••••'}
              </p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CreditCard className="text-green-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Mining Streak</p>
              <p className="text-white text-xl font-bold">{user.mining_streak || 0} days</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Award className="text-purple-400" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Referrals</p>
              <p className="text-white text-xl font-bold">{user.referral_count || 0}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="flex overflow-x-auto">
              {['overview', 'security', 'transactions', 'kyc', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User size={20} />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <InfoField 
                          label="Username" 
                          value={editMode ? (
                            <input
                              type="text"
                              value={editForm.username || ''}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                          ) : user.username}
                        />
                        <InfoField 
                          label="Email" 
                          value={editMode ? (
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                          ) : user.email}
                        />
                        <InfoField 
                          label="Phone" 
                          value={editMode ? (
                            <input
                              type="tel"
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                          ) : user.phone || 'Not provided'}
                        />
                        <InfoField label="UID" value={user.uid} />
                        <InfoField label="Joined Date" value={formatDate(user.created_at)} />
                        <InfoField label="Last Login" value={formatDate(user.last_login_at)} />
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield size={20} />
                        Account Status
                      </h3>
                      <div className="space-y-3">
                        <StatusField 
                          label="Email Verified" 
                          value={user.is_verified} 
                          editable={editMode}
                          onChange={(value) => setEditForm({...editForm, is_verified: value})}
                        />
                        <StatusField 
                          label="Phone Verified" 
                          value={user.phone_verified} 
                          editable={editMode}
                          onChange={(value) => setEditForm({...editForm, phone_verified: value})}
                        />
                        <StatusField 
                          label="2FA Enabled" 
                          value={user.two_factor_enabled} 
                          editable={editMode}
                          onChange={(value) => setEditForm({...editForm, two_factor_enabled: value})}
                        />
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-300">KYC Status</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.kyc_status === 'verified' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : user.kyc_status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {user.kyc_status || 'Not Submitted'}
                          </span>
                        </div>
                        {user.kyc_verified_at && (
                          <InfoField label="KYC Verified At" value={formatDate(user.kyc_verified_at)} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity size={20} />
                        Activity
                      </h3>
                      <div className="space-y-3">
                        <InfoField label="Total Logins" value={user.login_count || 0} />
                        <InfoField label="Last IP Address" value={user.last_login_ip || 'Unknown'} />
                        <InfoField label="Account Status" value={
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        } />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={20} />
                        Referral Info
                      </h3>
                      <div className="space-y-3">
                        <InfoField label="Referral Code" value={user.referral_code} />
                        <InfoField label="Total Referrals" value={user.referral_count || 0} />
                        <InfoField label="Referral Earnings" value={`$${formatBalance(user.referral_usdc_balance)} USDC`} />
                        <InfoField label="Referral Tokens" value={`${formatBalance(user.referral_token_balance)} CMEME`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                  <div className="space-y-4">
                    <SecurityItem 
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      status={user.two_factor_enabled ? 'enabled' : 'disabled'}
                      action={user.two_factor_enabled ? 'Disable' : 'Enable'}
                    />
                    <SecurityItem 
                      title="Phone Verification"
                      description="Verify your phone number for additional security"
                      status={user.phone_verified ? 'verified' : 'unverified'}
                      action={user.phone_verified ? 'Remove' : 'Verify'}
                    />
                    <SecurityItem 
                      title="Session Management"
                      description="View and manage active sessions"
                      status="active"
                      action="Manage"
                    />
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented similarly */}
              {activeTab !== 'overview' && activeTab !== 'security' && (
                <div className="text-center py-12">
                  <Settings size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                  </h3>
                  <p className="text-gray-400">
                    This section would display {activeTab} information for the user.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all duration-200">
                <Plus size={18} />
                <span>Add Balance</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-all duration-200">
                <Mail size={18} />
                <span>Send Email</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 transition-all duration-200">
                <Shield size={18} />
                <span>Verify Account</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 transition-all duration-200">
                <LogIn size={18} />
                <span>Login as User</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 transition-all duration-200">
                <Trash2 size={18} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="space-y-3">
              <StatItem label="Total Deposits" value="$0.00" />
              <StatItem label="Total Withdrawals" value="$0.00" />
              <StatItem label="Total Trades" value="0" />
              <StatItem label="Success Rate" value="0%" />
              <StatItem label="Avg. Session" value="0m" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <ActivityItem 
                action="Account Created"
                date={user.created_at}
                icon={<User size={14} />}
              />
              {user.last_login_at && (
                <ActivityItem 
                  action="Last Login"
                  date={user.last_login_at}
                  icon={<LogIn size={14} />}
                />
              )}
              {user.kyc_verified_at && (
                <ActivityItem 
                  action="KYC Verified"
                  date={user.kyc_verified_at}
                  icon={<CheckCircle size={14} />}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const InfoField = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
    <span className="text-gray-300">{label}</span>
    <span className="text-white font-medium text-right">{value}</span>
  </div>
);

const StatusField = ({ label, value, editable, onChange }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
    <span className="text-gray-300">{label}</span>
    {editable ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value === 'true')}
        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
      >
        <option value={true}>Verified</option>
        <option value={false}>Unverified</option>
      </select>
    ) : (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        value 
          ? 'bg-green-500/20 text-green-400'
          : 'bg-yellow-500/20 text-yellow-400'
      }`}>
        {value ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {value ? 'Verified' : 'Unverified'}
      </span>
    )}
  </div>
);

const SecurityItem = ({ title, description, status, action }) => (
  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600">
    <div>
      <h4 className="text-white font-medium">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'enabled' || status === 'verified'
          ? 'bg-green-500/20 text-green-400'
          : status === 'active'
          ? 'bg-blue-500/20 text-blue-400'
          : 'bg-gray-500/20 text-gray-400'
      }`}>
        {status}
      </span>
      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
        {action}
      </button>
    </div>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const ActivityItem = ({ action, date, icon }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="p-2 bg-blue-500/20 rounded-lg">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-white text-sm">{action}</p>
      <p className="text-gray-500 text-xs">{formatDate(date)}</p>
    </div>
  </div>
);

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default UserDetail;