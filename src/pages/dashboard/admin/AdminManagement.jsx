// src/pages/admin/AdminManagement.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Shield, UserCheck, UserX, Save, X, Key, Mail, User } from "lucide-react";
import api from "../../../utils/api";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_super_admin: false,
    permissions: [],
    status: true
  });
  const [changePasswordData, setChangePasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const availablePermissions = [
    'users.view',
    'users.manage',
    'kyc.verify',
    'tasks.manage',
    'settings.manage',
    'transactions.view',
    'transactions.manage',
    'deposits.approve',
    'withdrawals.approve',
    'reports.view'
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Error fetching admins: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAdmin) {
        // Update admin
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/admin/admins/${editingAdmin.id}`, payload);
        alert('Admin updated successfully!');
      } else {
        // Create new admin
        await api.post('/admin/admins', formData);
        alert('Admin created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      alert('Error saving admin: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/admins/${adminId}`);
      alert('Admin deleted successfully!');
      fetchAdmins();
    } catch (error) {
      alert('Error deleting admin: ' + error.response?.data?.message || error.message);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await api.post(`/admin/admins/${adminId}/toggle-status`);
      alert(`Admin ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchAdmins();
    } catch (error) {
      alert('Error updating admin status: ' + error.response?.data?.message || error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/change-password', changePasswordData);
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setChangePasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      alert('Error changing password: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      is_super_admin: false,
      permissions: [],
      status: true
    });
    setEditingAdmin(null);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      is_super_admin: admin.is_super_admin,
      permissions: admin.permissions || [],
      status: admin.status
    });
    setShowModal(true);
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const PermissionBadge = ({ permission }) => {
    const getPermissionColor = (perm) => {
      const colors = {
        'users.view': 'bg-blue-500',
        'users.manage': 'bg-blue-600',
        'kyc.verify': 'bg-green-500',
        'tasks.manage': 'bg-purple-500',
        'settings.manage': 'bg-yellow-500',
        'transactions.view': 'bg-indigo-500',
        'transactions.manage': 'bg-indigo-600',
        'deposits.approve': 'bg-teal-500',
        'withdrawals.approve': 'bg-orange-500',
        'reports.view': 'bg-pink-500'
      };
      return colors[perm] || 'bg-gray-500';
    };

    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${getPermissionColor(permission)}`}>
        {permission.replace('.', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage admin accounts and permissions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
            >
              <Key size={16} />
              Change Password
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <Plus size={16} />
              Add Admin
            </button>
          </div>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Admin Accounts</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Admin</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Role</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Permissions</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{admin.name}</p>
                        <p className="text-gray-400 text-sm">{admin.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.is_super_admin 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {admin.is_super_admin ? (
                          <span className="text-gray-400 text-sm">All permissions</span>
                        ) : (
                          admin.permissions?.slice(0, 3).map(permission => (
                            <PermissionBadge key={permission} permission={permission} />
                          ))
                        )}
                        {!admin.is_super_admin && admin.permissions?.length > 3 && (
                          <span className="text-gray-400 text-sm">
                            +{admin.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(admin.id, admin.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          admin.status
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {admin.status ? <UserCheck size={12} /> : <UserX size={12} />}
                        {admin.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        {!admin.is_super_admin && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter admin name"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter admin email"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Password {!editingAdmin && '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder={editingAdmin ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-gray-400">
                    <input
                      type="checkbox"
                      checked={formData.is_super_admin}
                      onChange={(e) => setFormData({...formData, is_super_admin: e.target.checked})}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    Super Admin
                  </label>

                  <label className="flex items-center gap-2 text-gray-400">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.checked})}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    Active
                  </label>
                </div>
              </div>

              {!formData.is_super_admin && (
                <div>
                  <label className="block text-gray-400 text-sm mb-3">Permissions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{permission.replace('.', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Current Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordData.current_password}
                  onChange={(e) => setChangePasswordData({...changePasswordData, current_password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">New Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordData.new_password}
                  onChange={(e) => setChangePasswordData({...changePasswordData, new_password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordData.new_password_confirmation}
                  onChange={(e) => setChangePasswordData({...changePasswordData, new_password_confirmation: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Key size={18} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;