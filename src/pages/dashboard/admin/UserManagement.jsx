// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Mail, Shield, Trash2, User, Plus, Eye, LogIn } from "lucide-react";
import api from "../../../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [addBalanceModal, setAddBalanceModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.uid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && user.is_verified) ||
                         (filter === 'unverified' && !user.is_verified) ||
                         (filter === 'active' && user.is_active) ||
                         (filter === 'suspended' && !user.is_active);
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (action, user) => {
    try {
      switch (action) {
        case 'verify':
          await api.post(`/admin/users/${user.id}/verify`);
          break;
        case 'suspend':
          await api.post(`/admin/users/${user.id}/suspend`);
          break;
        case 'activate':
          await api.post(`/admin/users/${user.id}/activate`);
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
            await api.delete(`/admin/users/${user.id}`);
          }
          break;
        case 'view':
          navigate(`/admin/users/${user.id}`);
          return;
        case 'add_balance':
          setSelectedUser(user);
          setAddBalanceModal(true);
          return;
        case 'send_email':
          setSelectedUser(user);
          setEmailModal(true);
          return;
        case 'impersonate':
          if (confirm(`Login as ${user.username}? You will be redirected to their dashboard.`)) {
            await api.post(`/admin/users/${user.id}/impersonate`);
            // The API should return a token for the user
            window.open('/dashboard', '_blank');
          }
          return;
      }
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleAddBalance = async (formData) => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/add-balance`, formData);
      setAddBalanceModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert('Balance added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add balance');
    }
  };

  const handleSendEmail = async (formData) => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/send-email`, formData);
      setEmailModal(false);
      setSelectedUser(null);
      alert('Email sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage platform users and permissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAddBalanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Balance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by username, email, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">KYC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-500 text-xs">{user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{user.token_balance || 0} CMEME</p>
                      <p className="text-gray-400 text-sm">${user.usdc_balance || 0} USDC</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_verified 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.kyc_status === 'verified' 
                          ? 'bg-green-500/20 text-green-400'
                          : user.kyc_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.kyc_status || 'Not Submitted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAction('view', user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('impersonate', user)}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          title="Login as User"
                        >
                          <LogIn size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('add_balance', user)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Add Balance"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('send_email', user)}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(user.is_verified ? 'suspend' : 'verify', user)}
                          className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                          title={user.is_verified ? 'Suspend User' : 'Verify User'}
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete User"
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
      </div>

      {/* Add Balance Modal */}
      {addBalanceModal && (
        <AddBalanceModal
          user={selectedUser}
          onClose={() => {
            setAddBalanceModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleAddBalance}
        />
      )}

      {/* Send Email Modal */}
      {emailModal && (
        <SendEmailModal
          user={selectedUser}
          onClose={() => {
            setEmailModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSendEmail}
        />
      )}
    </div>
  );
};

// Add Balance Modal Component
const AddBalanceModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    currency: 'CMEME',
    amount: '',
    description: '',
    send_email: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add Balance</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Trash2 size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
            <input
              type="text"
              value={user?.username}
              disabled
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="CMEME">CMEME</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Reason for adding balance"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send_email"
              checked={formData.send_email}
              onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
              className="rounded border-gray-600 bg-gray-700"
            />
            <label htmlFor="send_email" className="text-sm text-gray-300">
              Send email notification to user
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send Email Modal Component
const SendEmailModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'notification'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Send Email</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Trash2 size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
            <input
              type="text"
              value={`${user?.username} <${user?.email}>`}
              disabled
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="notification">Notification</option>
              <option value="promotional">Promotional</option>
              <option value="security">Security Alert</option>
              <option value="system">System Update</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Email subject"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows="6"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              placeholder="Enter your message..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;