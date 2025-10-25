import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Copy, Check, Twitter, Lock, ShieldCheck, Send, User, Mail, Calendar, Smartphone, Key, QrCode, Eye, EyeOff, Download, X, Edit } from "lucide-react";
import api from "../../../utils/api";

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAuthenticatorModal, setShowAuthenticatorModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { userData, refetchUserData } = useOutletContext();

  // Form states
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authenticatorCode, setAuthenticatorCode] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA states
  const [authenticatorSecret, setAuthenticatorSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [step, setStep] = useState('phone'); // phone, verify, authenticator, etc.
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Avatar states
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("adventurer");

  // List of available DiceBear avatar styles
  const avatarStyles = [
    "adventurer",
    "adventurer-neutral",
    "bottts",
    "fun-emoji",
    "identicon",
    "micah",
    "pixel-art",
    "pixel-art-neutral",
    "rings",
    "shapes",
    "thumbs",
  ];

  // Generate avatar URL using DiceBear
  const generateAvatarUrl = (username, style) => {
    const seed = encodeURIComponent(username || "guest");
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/security/settings');
      setProfileData(response.data.data.user);
      setSecuritySettings(response.data.data.security_settings);
      setPhone(response.data.data.user.phone || '');
      // Set initial avatar
      if (response.data.data.user.avatar_url) {
        setSelectedAvatar(response.data.data.user.avatar_url);
      } else if (response.data.data.user.username) {
        const defaultUrl = generateAvatarUrl(response.data.data.user.username, "adventurer");
        setSelectedAvatar(defaultUrl);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModals = () => {
    setShowSecurityModal(false);
    setShowPasswordModal(false);
    setShowAuthenticatorModal(false);
    setShowAvatarModal(false);
    setStep('phone');
    setVerificationCode('');
    setAuthenticatorCode('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Avatar Modal Functions
  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setSelectedStyle(newStyle);
    const newUrl = generateAvatarUrl(displayData?.username, newStyle);
    setSelectedAvatar(newUrl);
  };

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const newUrl = generateAvatarUrl(randomSeed, selectedStyle);
    setSelectedAvatar(newUrl);
  };

  const handleSaveAvatar = async () => {
    try {
      await api.post("/user/update-avatar", { avatar_url: selectedAvatar });
      // Update local user data
      if (refetchUserData) {
        await refetchUserData();
      }
      setShowAvatarModal(false);
      showToast('Avatar updated successfully!', 'success');
    } catch (err) {
      console.error("Error saving avatar:", err);
      showToast('Failed to save avatar. Try again.', 'error');
    }
  };

  const openAvatarModal = () => {
    const initialUrl = displayData?.avatar_url || generateAvatarUrl(displayData?.username, selectedStyle);
    setSelectedAvatar(initialUrl);
    setShowAvatarModal(true);
  };

  const updatePhone = async () => {
    if (!phone) {
      showToast('Please enter a phone number', 'error');
      return;
    }

    try {
      await api.post('/security/update-phone', { phone });
      setStep('verify');
      showToast('Verification code sent to your phone', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update phone', 'error');
    }
  };

  const verifyPhone = async () => {
    if (!verificationCode) {
      showToast('Please enter verification code', 'error');
      return;
    }

    try {
      await api.post('/security/verify-phone', { code: verificationCode });
      resetModals();
      await fetchProfileData();
      showToast('Phone verified successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid verification code', 'error');
    }
  };

  const setupAuthenticator = async () => {
    try {
      const response = await api.post('/security/setup-authenticator');
      setAuthenticatorSecret(response.data.data.secret);
      setQrCodeUrl(response.data.data.qr_code_url);
      setStep('authenticator');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to setup authenticator', 'error');
    }
  };

  const verifyAuthenticator = async () => {
    if (!authenticatorCode) {
      showToast('Please enter authenticator code', 'error');
      return;
    }

    try {
      await api.post('/security/verify-authenticator', {
        code: authenticatorCode,
        secret: authenticatorSecret
      });
      resetModals();
      await fetchProfileData();
      showToast('Authenticator setup successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid authenticator code', 'error');
    }
  };

  const enable2FA = async (type) => {
    try {
      if (type === 'sms' && !profileData?.phone_verified) {
        setStep('phone');
        setShowSecurityModal(true);
        return;
      }

      if (type === 'authenticator') {
        setShowAuthenticatorModal(true);
        await setupAuthenticator();
        return;
      }

      const endpoint = type === 'email' ? '/security/enable-email-2fa' : '/security/enable-sms-2fa';
      await api.post(endpoint);
      setStep('verify');
      showToast(`Verification code sent to your ${type}`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || `Failed to enable ${type} 2FA`, 'error');
    }
  };

  const verify2FA = async (type) => {
    if (!verificationCode) {
      showToast('Please enter verification code', 'error');
      return;
    }

    try {
      const endpoint = type === 'email' ? '/security/verify-email-2fa' : '/security/verify-sms-2fa';
      await api.post(endpoint, { code: verificationCode });
      resetModals();
      await fetchProfileData();
      showToast(`${type.toUpperCase()} 2FA enabled successfully!`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid verification code', 'error');
    }
  };

  const disable2FA = async (type) => {
    if (!window.confirm(`Are you sure you want to disable ${type.toUpperCase()} 2FA?`)) {
      return;
    }

    try {
      await api.post('/security/disable-2fa', { type });
      await fetchProfileData();
      showToast(`${type.toUpperCase()} 2FA disabled successfully`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to disable 2FA', 'error');
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      await api.post('/security/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });

      resetModals();
      showToast('Password changed successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const generateBackupCodes = async () => {
    if (!window.confirm('This will generate new backup codes. Your old codes will no longer work. Continue?')) {
      return;
    }

    try {
      const response = await api.post('/security/generate-backup-codes');
      setShowBackupCodes(true);
      const backupCodes = response.data.data.backup_codes;
      const codesText = backupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup codes generated and downloaded!', 'success');
      await fetchProfileData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate backup codes', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const displayData = profileData || userData;

  const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors z-10"
        >
          <X size={20} className="text-gray-400" />
        </button>
        {children}
      </div>
    </div>
  );

  // Avatar Modal
  const AvatarModal = () => {
    if (!showAvatarModal) return null;

    return (
      <ModalWrapper onClose={resetModals}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Choose Your Avatar</h2>
          <p className="text-gray-400 text-sm mb-6">
            Customize your profile picture with different styles
          </p>

          <div className="space-y-6">
            {/* Avatar Style Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Avatar Style</label>
              <select
                value={selectedStyle}
                onChange={handleStyleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
              >
                {avatarStyles.map((style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Preview */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedAvatar}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
                />
              </div>
              <button
                onClick={handleRandomize}
                className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all"
              >
                🎲 Randomize Avatar
              </button>
            </div>

            <button
              onClick={handleSaveAvatar}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  };

  const SecurityModal = () => {
    if (!showSecurityModal) return null;

    return (
      <ModalWrapper onClose={resetModals}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">
            {step === 'phone' ? 'Add Phone Number' : 'Verify Code'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {step === 'phone' 
              ? 'Enter your phone number to receive verification codes via SMS'
              : 'Enter the 6-digit code sent to your phone'
            }
          </p>

          <div className="space-y-4">
            {step === 'phone' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                  />
                  <p className="text-gray-500 text-xs">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                <button
                  onClick={updatePhone}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Send Verification Code
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all text-center text-lg tracking-widest"
                  />
                </div>
                <button
                  onClick={verifyPhone}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Verify Code
                </button>
                <button
                  onClick={() => setStep('phone')}
                  className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all"
                >
                  Change Phone Number
                </button>
              </>
            )}
          </div>
        </div>
      </ModalWrapper>
    );
  };

  const PasswordModal = () => {
    if (!showPasswordModal) return null;

    return (
      <ModalWrapper onClose={resetModals}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Change Password</h2>
          <p className="text-gray-400 text-sm mb-6">
            Create a strong password with at least 8 characters
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all pr-12"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all pr-12"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all pr-12"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={changePassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Change Password
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  };

  const AuthenticatorModal = () => {
    if (!showAuthenticatorModal) return null;

    return (
      <ModalWrapper onClose={resetModals}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">
            {step === 'authenticator' ? 'Setup Authenticator App' : 'Verify Authenticator'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {step === 'authenticator' 
              ? 'Scan the QR code with your authenticator app'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>

          <div className="space-y-6">
            {step === 'authenticator' ? (
              <>
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">Can't scan the QR code? Enter this code manually:</p>
                    <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <code className="text-gray-100 font-mono text-sm">{authenticatorSecret}</code>
                      <button
                        onClick={() => handleCopy(authenticatorSecret)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors ml-2"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep('verify')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  I've Added the Account
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Authenticator Code</label>
                  <input
                    type="text"
                    value={authenticatorCode}
                    onChange={(e) => setAuthenticatorCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all text-center text-lg tracking-widest"
                  />
                </div>
                <button
                  onClick={verifyAuthenticator}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Verify & Activate
                </button>
                <button
                  onClick={() => setStep('authenticator')}
                  className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all"
                >
                  Back to QR Code
                </button>
              </>
            )}
          </div>
        </div>
      </ModalWrapper>
    );
  };

  const Toast = () => {
    if (!toast.show) return null;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[toast.type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform transition-transform duration-300 animate-in slide-in-from-right`}>
        <div className="flex items-center space-x-2">
          <Check size={20} />
          <span>{toast.message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Toast Notifications */}
      <Toast />

      {/* Profile Header */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div 
            onClick={openAvatarModal}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative"
          >
            {displayData?.avatar_url ? (
              <img
                src={displayData.avatar_url}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-900" />
            )}
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow">
              <Edit size={12} />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100">{displayData?.username}</h1>
            <p className="text-gray-400">{displayData?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                displayData?.two_factor_enabled 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {displayData?.two_factor_enabled ? '2FA Enabled' : '2FA Disabled'}
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium">
                Member
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSecurityModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Manage Security
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'profile'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Profile Information
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'security'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Security Settings
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
              <User size={24} />
              <span>Profile Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Username</label>
                <p className="text-gray-100 font-medium">{displayData?.username}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <p className="text-gray-100 font-medium">{displayData?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Phone Number</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-100 font-medium">
                    {displayData?.phone || 'Not set'}
                  </p>
                  {displayData?.phone_verified ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Verified</span>
                  ) : displayData?.phone ? (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Not Verified</span>
                  ) : null}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Member Since</label>
                <p className="text-gray-100 font-medium">
                  {new Date(displayData?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">Profile Avatar</label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    {displayData?.avatar_url ? (
                      <img
                        src={displayData.avatar_url}
                        alt="User Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-900" />
                    )}
                  </div>
                  <button
                    onClick={openAvatarModal}
                    className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-all"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
              <ShieldCheck size={24} />
              <span>Security Status</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-green-400" />
                  <div>
                    <p className="text-gray-100 font-medium">Email Verification</p>
                    <p className="text-gray-400 text-sm">Your email is verified</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <Smartphone size={20} className={displayData?.phone_verified ? "text-green-400" : "text-yellow-400"} />
                  <div>
                    <p className="text-gray-100 font-medium">Phone Verification</p>
                    <p className="text-gray-400 text-sm">
                      {displayData?.phone_verified ? 'Phone is verified' : displayData?.phone ? 'Phone not verified' : 'Phone not set'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  displayData?.phone_verified ? 'bg-green-400' : displayData?.phone ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock size={20} className={displayData?.two_factor_enabled ? "text-green-400" : "text-red-400"} />
                  <div>
                    <p className="text-gray-100 font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">
                      {displayData?.two_factor_enabled ? '2FA is enabled' : '2FA is disabled'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  displayData?.two_factor_enabled ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
            
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-400 mb-6">Add an extra layer of security to your account</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Authenticator App */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <QrCode size={24} className="text-yellow-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Authenticator App</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Use an authenticator app like Google Authenticator or Authy to generate verification codes.
                </p>
                {securitySettings?.authenticator_2fa_enabled ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm text-center">
                      Enabled
                    </div>
                    <button
                      onClick={() => disable2FA('authenticator')}
                      className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => enable2FA('authenticator')}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Email Verification */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail size={24} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Email Verification</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Receive verification codes via email when logging in from new devices.
                </p>
                {securitySettings?.email_2fa_enabled ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm text-center">
                      Enabled
                    </div>
                    <button
                      onClick={() => disable2FA('email')}
                      className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => enable2FA('email')}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* SMS Verification */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Smartphone size={24} className="text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-100">SMS Verification</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Receive verification codes via SMS to your registered phone number.
                </p>
                {securitySettings?.sms_2fa_enabled ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm text-center">
                      Enabled
                    </div>
                    <button
                      onClick={() => disable2FA('sms')}
                      className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => enable2FA('sms')}
                    disabled={!displayData?.phone}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                      displayData?.phone
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
                    }`}
                  >
                    {displayData?.phone ? 'Enable' : 'Add Phone First'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Backup Codes */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-100">Backup Codes</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Use these codes to access your account if you lose your 2FA device.
                </p>
              </div>
              <button
                onClick={generateBackupCodes}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Generate New Codes
              </button>
            </div>
            
            {displayData?.has_backup_codes && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <Key size={16} />
                  <span className="font-medium">Backup codes available</span>
                </div>
                <p className="text-yellow-400/80 text-sm">
                  You have backup codes generated. Make sure to save them in a secure place.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AvatarModal />
      <SecurityModal />
      <PasswordModal />
      <AuthenticatorModal />
    </div>
  );
};

export default ProfilePage;