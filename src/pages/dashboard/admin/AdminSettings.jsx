// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from "react";
import { Save, Mail, Shield, Globe, DollarSign, Users, Bell, Cpu, TestTube, Database } from "lucide-react";
import api from "../../../utils/api";

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (type) => {
    try {
      const response = await api.post('/admin/settings/email-test');
      setTestResults(prev => ({
        ...prev,
        [type]: { success: true, message: 'Test completed successfully' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [type]: { success: false, message: error.response?.data?.message || 'Test failed' }
      }));
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400">Configure platform settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'system', label: 'System', icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'email' && <EmailSettings settings={settings} updateSetting={updateSetting} onTest={handleTest} testResults={testResults} />}
        {activeTab === 'security' && <SecuritySettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'payments' && <PaymentSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'users' && <UserSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'system' && <SystemSettings settings={settings} updateSetting={updateSetting} />}
      </div>
    </div>
  );
};

// General Settings Tab
const GeneralSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Platform Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
          <input
            type="text"
            value={settings.general?.platform_name || ''}
            onChange={(e) => updateSetting('general', 'platform_name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="CMEME Platform"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform URL</label>
          <input
            type="url"
            value={settings.general?.platform_url || ''}
            onChange={(e) => updateSetting('general', 'platform_url', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="https://cmeme.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
          <input
            type="email"
            value={settings.general?.support_email || ''}
            onChange={(e) => updateSetting('general', 'support_email', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="support@cmeme.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
          <select
            value={settings.general?.timezone || 'UTC'}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Mining Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Daily Mining Reward (CMEME)</label>
          <input
            type="number"
            step="0.0001"
            value={settings.mining?.daily_reward || 1}
            onChange={(e) => updateSetting('mining', 'daily_reward', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mining Cooldown (hours)</label>
          <input
            type="number"
            value={settings.mining?.cooldown_hours || 24}
            onChange={(e) => updateSetting('mining', 'cooldown_hours', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// Email Settings Tab
const EmailSettings = ({ settings, updateSetting, onTest, testResults }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">SMTP Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
          <input
            type="text"
            value={settings.email?.smtp_host || ''}
            onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
          <input
            type="number"
            value={settings.email?.smtp_port || 587}
            onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
          <input
            type="text"
            value={settings.email?.smtp_username || ''}
            onChange={(e) => updateSetting('email', 'smtp_username', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="your-email@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Password</label>
          <input
            type="password"
            value={settings.email?.smtp_password || ''}
            onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">From Address</label>
          <input
            type="email"
            value={settings.email?.from_address || ''}
            onChange={(e) => updateSetting('email', 'from_address', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="noreply@cmeme.com"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => onTest('email')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <TestTube size={16} />
          Test Email Configuration
        </button>
        {testResults.email && (
          <div className={`mt-2 p-3 rounded-lg ${
            testResults.email.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {testResults.email.message}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Security Settings Tab
const SecuritySettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
      <div className="space-y-4">
        <ToggleSetting
          label="Enable 2FA for Users"
          description="Allow users to enable two-factor authentication"
          checked={settings.security?.enable_2fa || true}
          onChange={(checked) => updateSetting('security', 'enable_2fa', checked)}
        />
        <ToggleSetting
          label="Require KYC for Withdrawals"
          description="Users must complete KYC to withdraw funds"
          checked={settings.security?.require_kyc_for_withdrawal || true}
          onChange={(checked) => updateSetting('security', 'require_kyc_for_withdrawal', checked)}
        />
        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
          <div>
            <p className="text-white font-medium">Login Attempts Limit</p>
            <p className="text-gray-400 text-sm">Maximum failed login attempts before lockout</p>
          </div>
          <input
            type="number"
            value={settings.security?.max_login_attempts || 5}
            onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// Payment Settings Tab
const PaymentSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Withdrawal (USDC)</label>
          <input
            type="number"
            step="0.01"
            value={settings.payments?.min_withdrawal_usdc || 5}
            onChange={(e) => updateSetting('payments', 'min_withdrawal_usdc', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal Fee (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.payments?.withdrawal_fee_percent || 1.5}
            onChange={(e) => updateSetting('payments', 'withdrawal_fee_percent', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Referral System</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Referral Bonus (%)</label>
          <input
            type="number"
            step="0.1"
            value={settings.referral?.bonus_percent || 10}
            onChange={(e) => updateSetting('referral', 'bonus_percent', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// User Settings Tab
const UserSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Registration & Verification</h3>
      <div className="space-y-4">
        <ToggleSetting
          label="Allow New Registrations"
          description="Allow new users to create accounts"
          checked={settings.users?.allow_registrations || true}
          onChange={(checked) => updateSetting('users', 'allow_registrations', checked)}
        />
        <ToggleSetting
          label="Require Email Verification"
          description="Users must verify email before using platform"
          checked={settings.users?.require_email_verification || true}
          onChange={(checked) => updateSetting('users', 'require_email_verification', checked)}
        />
      </div>
    </div>
  </div>
);

// Notification Settings Tab
const NotificationSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Admin Notifications</h3>
      <div className="space-y-4">
        <ToggleSetting
          label="KYC Submissions"
          description="Notify admins when new KYC is submitted"
          checked={settings.notifications?.kyc_submissions || true}
          onChange={(checked) => updateSetting('notifications', 'kyc_submissions', checked)}
        />
        <ToggleSetting
          label="Large Withdrawals"
          description="Notify for withdrawals above threshold"
          checked={settings.notifications?.large_withdrawals || true}
          onChange={(checked) => updateSetting('notifications', 'large_withdrawals', checked)}
        />
      </div>
    </div>
  </div>
);

// System Settings Tab
const SystemSettings = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Maintenance Mode</h3>
      <div className="space-y-4">
        <ToggleSetting
          label="Enable Maintenance Mode"
          description="Take the platform offline for maintenance"
          checked={settings.system?.maintenance_mode || false}
          onChange={(checked) => updateSetting('system', 'maintenance_mode', checked)}
        />
        {settings.system?.maintenance_mode && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maintenance Message</label>
            <textarea
              value={settings.system?.maintenance_message || ''}
              onChange={(e) => updateSetting('system', 'maintenance_message', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Platform is currently under maintenance..."
            />
          </div>
        )}
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Database</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
          <div>
            <p className="text-white font-medium">Auto Backup</p>
            <p className="text-gray-400 text-sm">Automatically backup database daily</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.system?.auto_backup || true}
              onChange={(e) => updateSetting('system', 'auto_backup', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
          <div>
            <p className="text-white font-medium">Keep Logs (days)</p>
            <p className="text-gray-400 text-sm">How long to keep system logs</p>
          </div>
          <input
            type="number"
            value={settings.system?.keep_logs_days || 30}
            onChange={(e) => updateSetting('system', 'keep_logs_days', parseInt(e.target.value))}
            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// Reusable Toggle Component
const ToggleSetting = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
    <div>
      <p className="text-white font-medium">{label}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

export default AdminSettings;