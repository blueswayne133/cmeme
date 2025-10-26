// pages/AuthPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ReCAPTCHA from "react-google-recaptcha";
import { loginSchema, signupSchema, forgotPasswordSchema } from "../utils/validationSchemas";
import api from "../utils/api.js";
import { getUserFromLocalStorage, storeDeviceId, getDeviceId } from "../utils/localStorage";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFactorType, setTwoFactorType] = useState("email");
  const [resendLoading, setResendLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationUserId, setVerificationUserId] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef();
  
  const navigate = useNavigate();

  // Generate or get device ID
  const getOrCreateDeviceId = () => {
    let deviceId = getDeviceId();
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      storeDeviceId(deviceId);
    }
    return deviceId;
  };

  // Redirect if already logged in
  useEffect(() => {
    const user = getUserFromLocalStorage();
    const token = localStorage.getItem('authToken');
    if (user && token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(
      forgotPasswordMode 
        ? forgotPasswordSchema 
        : activeTab === "login" 
          ? loginSchema 
          : signupSchema
    ),
    mode: "onChange"
  });

  // Watch form values to retain data
  const formValues = watch();

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const onRecaptchaError = () => {
    showToast("reCAPTCHA verification failed. Please try again.", "error");
    setRecaptchaToken("");
  };

  const resetRecaptcha = () => {
    setRecaptchaToken("");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  // Toast notification system
  const showToast = (message, type = 'info') => {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    });

    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
      type === 'error' 
        ? 'bg-red-500/20 border-red-500 text-red-400' 
        : type === 'success'
        ? 'bg-green-500/20 border-green-500 text-green-400'
        : 'bg-blue-500/20 border-blue-500 text-blue-400'
    }`;
    toast.style.transform = 'translateX(100%)';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-center gap-3';
    
    // Add icon based on type
    const iconSvg = document.createElement('div');
    if (type === 'success') {
      iconSvg.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      `;
    } else if (type === 'error') {
      iconSvg.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      `;
    } else {
      iconSvg.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      `;
    }
    
    const textDiv = document.createElement('div');
    textDiv.textContent = message;
    
    messageDiv.appendChild(iconSvg);
    messageDiv.appendChild(textDiv);
    toast.appendChild(messageDiv);
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  const onSubmit = async (data) => {
    // Check reCAPTCHA for both login and register
    if (!recaptchaToken && !forgotPasswordMode && !resetPasswordMode) {
      showToast("Please complete the reCAPTCHA verification", "error");
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (forgotPasswordMode) {
        // Handle forgot password
        response = await api.post('/forgot-password', {
          email: data.email
        });
        showToast("Password reset link sent to your email", "success");
        setForgotPasswordMode(false);
        reset();
        resetRecaptcha();
        return;
      }

      if (resetPasswordMode) {
        // Handle password reset
        response = await api.post('/reset-password', {
          token: resetToken,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword
        });
        showToast("Password reset successfully! You can now login.", "success");
        setResetPasswordMode(false);
        reset();
        resetRecaptcha();
        return;
      }

      const deviceId = getOrCreateDeviceId();

      if (activeTab === "login") {
        response = await api.post('/login', {
          login: data.login,
          password: data.password,
          device_id: deviceId,
          recaptcha_token: recaptchaToken
        });

        // Check if email verification is required
        if (response.data.status === 'email_verification_required') {
          setEmailVerificationRequired(true);
          setVerificationEmail(response.data.data.email);
          setVerificationUserId(response.data.data.user_id);
          showToast("Please verify your email address to login", "info");
          setLoading(false);
          resetRecaptcha();
          return;
        }

        // Check if 2FA is required
        if (response.data.status === '2fa_required') {
          setTwoFactorRequired(true);
          setTwoFactorData(response.data.data);
          showToast("Two-factor authentication required", "info");
          setLoading(false);
          resetRecaptcha();
          return;
        }

        // Check if device verification is required
        if (response.data.status === 'device_verification_required') {
          setTwoFactorRequired(true);
          setTwoFactorData({
            ...response.data.data,
            is_device_verification: true
          });
          setTwoFactorType('email');
          showToast("Device verification required. Check your email for verification code.", "info");
          setLoading(false);
          resetRecaptcha();
          return;
        }

        showToast("Login successful! Redirecting...", "success");
        
        const responseData = response.data.data;
        const user = responseData.user;
        const token = responseData.token;

        if (!token) {
          throw new Error('No token received from server');
        }
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);

      } else {
        // Registration
        response = await api.post('/register', {
          username: data.username,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
          firstname: data.firstname,
          lastname: data.lastname,
          referral_code: data.referralCode || null,
          recaptcha_token: recaptchaToken
        });

        if (response.data.status === 'success') {
          setEmailVerificationRequired(true);
          setVerificationEmail(data.email);
          setVerificationUserId(response.data.data.user_id);
          showToast("Registration successful! Please verify your email.", "success");
          // Don't reset form here to retain data if user needs to go back
        }
      }

    } catch (err) {
      console.error('Auth error:', err);
      
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        
        showToast(`Validation failed: ${errorMessages}`, "error");
      } else if (err.response?.data?.message) {
        showToast(err.response.data.message, "error");
      } else {
        showToast(err.message || 'An error occurred during authentication', "error");
      }
    } finally {
      setLoading(false);
      resetRecaptcha();
    }
  };

  const handleEmailVerification = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      showToast("Please enter a valid 6-digit code", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify-email', {
        email: verificationEmail,
        code: verificationCode
      });

      const responseData = response.data.data;
      const user = responseData.user;
      const token = responseData.token;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      showToast("Email verified successfully! Redirecting...", "success");
      
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);

    } catch (err) {
      console.error('Email verification error:', err);
      if (err.response?.data?.message) {
        showToast(err.response.data.message, "error");
      } else {
        showToast("Invalid verification code", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    setResendLoading(true);
    try {
      await api.post('/resend-verification', {
        email: verificationEmail
      });
      showToast("Verification code sent successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to resend code", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const handleTwoFactorVerification = async () => {
    if (!verificationCode.trim()) {
      showToast("Please enter verification code", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        login: twoFactorData.login,
        code: verificationCode,
        type: twoFactorType,
        user_id: twoFactorData.user_id
      };

      // Add device ID for device verification
      if (twoFactorData.is_device_verification) {
        payload.device_id = getOrCreateDeviceId();
      }

      const response = await api.post('/verify-2fa', payload);

      const responseData = response.data.data;
      const user = responseData.user;
      const token = responseData.token;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      showToast("Login successful! Redirecting...", "success");
      
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);

    } catch (err) {
      console.error('2FA verification error:', err);
      if (err.response?.data?.message) {
        showToast(err.response.data.message, "error");
      } else {
        showToast("Invalid verification code", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const payload = {
        login: twoFactorData.login,
        type: twoFactorType,
        user_id: twoFactorData.user_id
      };

      // Add device ID for device verification resend
      if (twoFactorData.is_device_verification) {
        payload.device_id = getOrCreateDeviceId();
      }

      await api.post('/resend-2fa', payload);
      showToast("Verification code sent successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to resend code", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setTwoFactorRequired(false);
    setForgotPasswordMode(false);
    setResetPasswordMode(false);
    setEmailVerificationSent(false);
    setEmailVerificationRequired(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
    resetRecaptcha();
  };

  const handleForgotPassword = () => {
    setForgotPasswordMode(true);
    setTwoFactorRequired(false);
    setEmailVerificationSent(false);
    setEmailVerificationRequired(false);
    reset();
    resetRecaptcha();
  };

  const handleBackToLogin = () => {
    setForgotPasswordMode(false);
    setResetPasswordMode(false);
    setTwoFactorRequired(false);
    setEmailVerificationSent(false);
    setEmailVerificationRequired(false);
    reset();
    resetRecaptcha();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Check if we're in password reset mode from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      setResetPasswordMode(true);
      setResetToken(token);
      setValue('email', email);
    }
  }, [setValue]);

  // Email Verification Required Page
  if (emailVerificationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b014d] via-[#4a0976] to-[#5a1d85] p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.259 8.259 0 0 1 12 20.25Z" />
                <path d="M11 7h2v6h-2Zm0 8h2v2h-2Z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">CMEME TOKEN</h1>
            </div>
            <p className="text-gray-300 text-base">Email Verification Required</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-400 text-center mb-6">
              We've sent a 6-digit verification code to <strong>{verificationEmail}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition text-center text-xl tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleEmailVerification}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50 mb-3"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              onClick={handleResendVerificationCode}
              disabled={resendLoading}
              className="w-full py-2 text-gray-400 hover:text-white transition text-sm disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>

            <button
              onClick={() => {
                setEmailVerificationRequired(false);
                setVerificationCode("");
              }}
              className="w-full py-2 text-gray-400 hover:text-white transition text-sm mt-2"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2FA Verification Form
  if (twoFactorRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b014d] via-[#4a0976] to-[#5a1d85] p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.259 8.259 0 0 1 12 20.25Z" />
                <path d="M11 7h2v6h-2Zm0 8h2v2h-2Z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">CMEME TOKEN</h1>
            </div>
            <p className="text-gray-300 text-base">
              {twoFactorData.is_device_verification ? 'Device Verification' : 'Two-Factor Authentication'}
            </p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              {twoFactorData.is_device_verification ? 'Verify New Device' : 'Verify Your Identity'}
            </h2>
            <p className="text-gray-400 text-center mb-6">
              {twoFactorData.is_device_verification 
                ? 'Enter the verification code sent to your email to authorize this device'
                : `Enter the verification code sent to your ${twoFactorType}`
              }
            </p>

            {/* 2FA Method Selection */}
            {!twoFactorData.is_device_verification && twoFactorData?.available_methods?.length > 1 && (
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Verification Method
                </label>
                <select
                  value={twoFactorType}
                  onChange={(e) => setTwoFactorType(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition"
                >
                  {twoFactorData.available_methods.map(method => (
                    <option key={method} value={method}>
                      {method === 'email' ? 'Email' : 
                       method === 'sms' ? 'SMS' : 
                       method === 'authenticator' ? 'Authenticator App' : method}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition text-center text-xl tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleTwoFactorVerification}
              disabled={loading || verificationCode.length < 6}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50 mb-3"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="w-full py-2 text-gray-400 hover:text-white transition text-sm disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>

            <button
              onClick={() => setTwoFactorRequired(false)}
              className="w-full py-2 text-gray-400 hover:text-white transition text-sm mt-2"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b014d] via-[#4a0976] to-[#5a1d85] p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.259 8.259 0 0 1 12 20.25Z" />
                <path d="M11 7h2v6h-2Zm0 8h2v2h-2Z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">CMEME TOKEN</h1>
            </div>
            <p className="text-gray-300 text-base">Reset Your Password</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Forgot Password
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50"
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-2 text-gray-400 hover:text-white transition text-sm"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password Form
  if (resetPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b014d] via-[#4a0976] to-[#5a1d85] p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.259 8.259 0 0 1 12 20.25Z" />
                <path d="M11 7h2v6h-2Zm0 8h2v2h-2Z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">CMEME TOKEN</h1>
            </div>
            <p className="text-gray-300 text-base">Set New Password</p>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Reset Password
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                  readOnly
                />
                {errors.email && (
                  <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83M15.828 15.828l3.83-3.83" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83M15.828 15.828l3.83-3.83" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-2 text-gray-400 hover:text-white transition text-sm"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b014d] via-[#4a0976] to-[#5a1d85] p-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md">
        {/* Logo + Subtitle */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.262 10.262 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.259 8.259 0 0 1 12 20.25Z" />
              <path d="M11 7h2v6h-2Zm0 8h2v2h-2Z" />
            </svg>
            <h1 className="text-3xl font-bold text-white">CMEME TOKEN</h1>
          </div>
          <p className="text-gray-300 text-base">Start your mining journey today</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 rounded-xl border border-white/10">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === "login"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === "register"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Login Form */}
              {activeTab === "login" && (
                <>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      {...register("login")}
                      defaultValue={formValues.login || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Enter your username or email"
                    />
                    {errors.login && (
                      <p className="mt-1 text-red-400 text-sm">{errors.login.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-white text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      defaultValue={formValues.password || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83M15.828 15.828l3.83-3.83" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-gray-400 hover:text-white transition text-sm"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              )}

              {/* Register Form */}
              {activeTab === "register" && (
                <>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      {...register("username")}
                      defaultValue={formValues.username || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Choose a username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-red-400 text-sm">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      defaultValue={formValues.email || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...register("firstname")}
                      defaultValue={formValues.firstname || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Enter your first name"
                    />
                    {errors.firstname && (
                      <p className="mt-1 text-red-400 text-sm">{errors.firstname.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register("lastname")}
                      defaultValue={formValues.lastname || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Enter your last name"
                    />
                    {errors.lastname && (
                      <p className="mt-1 text-red-400 text-sm">{errors.lastname.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-white text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      defaultValue={formValues.password || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83M15.828 15.828l3.83-3.83" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-white text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      defaultValue={formValues.confirmPassword || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83M15.828 15.828l3.83-3.83" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("referralCode")}
                      defaultValue={formValues.referralCode || ""}
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      placeholder="Enter referral code if any"
                    />
                    {errors.referralCode && (
                      <p className="mt-1 text-red-400 text-sm">{errors.referralCode.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* reCAPTCHA */}
              {!forgotPasswordMode && !resetPasswordMode && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY}
                    onChange={onRecaptchaChange}
                    onErrored={onRecaptchaError}
                    theme="dark"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50"
              >
                {loading
                  ? activeTab === "login"
                    ? "Logging in..."
                    : "Creating Account..."
                  : activeTab === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}