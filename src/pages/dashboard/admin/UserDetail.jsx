// src/pages/admin/UserDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Trash2, Plus, Eye, LogIn, Calendar, Wallet, Users, Award } from "lucide-react";
import api from "../../../utils/api";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <p className="text-gray-400">Manage user account and activities</p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-500 text-sm">UID: {user.uid}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.is_active ? 'Active' : 'Suspended'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.kyc_status === 'verified' ? 'bg-green-500/20 text-green-400' : 
                  user.kyc_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  KYC: {user.kyc_status || 'Not Submitted'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <LogIn size={16} className="inline mr-2" />
              Login as User
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Plus size={16} className="inline mr-2" />
              Add Balance
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {['overview', 'transactions', 'kyc', 'referrals', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'transactions' && <TransactionsTab userId={user.id} />}
        {activeTab === 'kyc' && <KycTab userId={user.id} />}
        {activeTab === 'referrals' && <ReferralsTab user={user} />}
        {activeTab === 'security' && <SecurityTab user={user} />}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">CMEME Balance</p>
          <p className="text-2xl font-bold text-white">{user.token_balance || 0}</p>
        </div>
        <Wallet className="text-yellow-400" size={24} />
      </div>
    </div>
    
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">USDC Balance</p>
          <p className="text-2xl font-bold text-white">${user.usdc_balance || 0}</p>
        </div>
        <Wallet className="text-blue-400" size={24} />
      </div>
    </div>
    
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Mining Streak</p>
          <p className="text-2xl font-bold text-white">{user.mining_streak || 0} days</p>
        </div>
        <Award className="text-green-400" size={24} />
      </div>
    </div>
    
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Referrals</p>
          <p className="text-2xl font-bold text-white">{user.referrals_count || 0}</p>
        </div>
        <Users className="text-purple-400" size={24} />
      </div>
    </div>

    {/* Additional Info */}
    <div className="md:col-span-2 lg:col-span-4 bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Registration Date</p>
          <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Last Login</p>
          <p className="text-white">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">KYC Verified</p>
          <p className="text-white">{user.kyc_verified_at ? new Date(user.kyc_verified_at).toLocaleDateString() : 'Not verified'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Referral Code</p>
          <p className="text-white font-mono">{user.referral_code}</p>
        </div>
      </div>
    </div>
  </div>
);

const TransactionsTab = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}/transactions`);
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">Loading...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">No transactions found</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-700/50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{tx.amount}</td>
                  <td className="px-6 py-4 text-gray-300">{tx.description}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KycTab = ({ userId }) => {
  const [kyc, setKyc] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKyc();
  }, [userId]);

  const fetchKyc = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}/kyc`);
      setKyc(response.data.data);
    } catch (error) {
      console.error('Error fetching KYC:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">KYC History</h3>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : kyc.length === 0 ? (
        <p className="text-gray-400">No KYC submissions found</p>
      ) : (
        <div className="space-y-4">
          {kyc.map((submission) => (
            <div key={submission.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{submission.document_type}</p>
                  <p className="text-gray-400 text-sm">Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</p>
                  <p className="text-gray-400 text-sm">Status: {submission.status}</p>
                  {submission.rejection_reason && (
                    <p className="text-red-400 text-sm">Reason: {submission.rejection_reason}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  submission.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                  submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {submission.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReferralsTab = ({ user }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Referral Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-gray-400 text-sm">Referral Code</p>
        <p className="text-white font-mono text-lg">{user.referral_code}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Total Referrals</p>
        <p className="text-white text-lg">{user.referrals_count || 0} users</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Referral Earnings (CMEME)</p>
        <p className="text-white text-lg">{user.referral_token_balance || 0}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Referral Earnings (USDC)</p>
        <p className="text-white text-lg">${user.referral_usdc_balance || 0}</p>
      </div>
    </div>
  </div>
);

const SecurityTab = ({ user }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
        <div>
          <p className="text-white font-medium">2FA Enabled</p>
          <p className="text-gray-400 text-sm">Two-factor authentication status</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.two_factor_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      
      <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
        <div>
          <p className="text-white font-medium">Phone Verified</p>
          <p className="text-gray-400 text-sm">Phone number verification status</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.phone_verified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {user.phone_verified ? 'Verified' : 'Not Verified'}
        </span>
      </div>
      
      <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
        <div>
          <p className="text-white font-medium">Last Password Change</p>
          <p className="text-gray-400 text-sm">When password was last updated</p>
        </div>
        <span className="text-gray-400 text-sm">
          {user.last_password_change ? new Date(user.last_password_change).toLocaleDateString() : 'Never'}
        </span>
      </div>
    </div>
  </div>
);

export default UserDetail;