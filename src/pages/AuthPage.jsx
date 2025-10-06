// pages/AuthPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, signupSchema } from "../utils/validationSchemas";
import api from "../utils/api.js";
import { getUserFromLocalStorage } from "../utils/localStorage";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = getUserFromLocalStorage();
    const token = localStorage.getItem('authToken');
    if (user && token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(activeTab === "login" ? loginSchema : signupSchema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      
      if (activeTab === "login") {
        response = await api.post('/login', {
          login: data.login,
          password: data.password
        });
        setSuccess("Login successful! Redirecting...");
      } else {
        response = await api.post('/register', {
          username: data.username,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword,
          firstname: data.firstname,
          lastname: data.lastname,
          referral_code: data.referralCode || null
        });
        setSuccess("Registration successful! Redirecting...");
      }

      console.log('API Response:', response.data);

      

      // Handle both response structures for compatibility
      const responseData = response.data.data ;
      
      if (!responseData) {
        throw new Error('Invalid response structure from server');
      }

      const user = responseData.user;
      const token = responseData.token;

      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Add a small delay to show success message
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'An error occurred during authentication';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
            <h1 className="text-3xl font-bold text-white">MyToken</h1>
          </div>
          <p className="text-gray-300 text-base">Start your mining journey today</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">Welcome</h2>

          {/* Tabs */}
          <div className="flex bg-[#1a1a2e] rounded-lg mb-6">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-2.5 font-medium transition-all rounded-lg ${
                activeTab === "login"
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2.5 font-medium transition-all rounded-lg ${
                activeTab === "register"
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {activeTab === "login" && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    {...register("login")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    placeholder="Enter your email or username"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </>
            )}

            {activeTab === "register" && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register("firstname")}
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
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    placeholder="Enter your last name"
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-red-400 text-sm">{errors.lastname.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    {...register("username")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    placeholder="Choose a username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-red-400 text-sm">{errors.username.message}</p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition pr-12"
                    placeholder="Create a password"
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
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    placeholder="Enter referral code if any"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}