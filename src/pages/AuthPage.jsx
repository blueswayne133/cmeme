"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    referralCode: "",
  })
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const recaptchaRef = useRef(null)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaExpired = () => {
    setRecaptchaToken("")
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken("")
    console.error("reCAPTCHA failed to load or encountered an error")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA verification")
      return
    }

    if (activeTab === "login") {
      console.log("Login submitted:", { 
        username: formData.username, 
        password: formData.password,
        recaptchaToken 
      })
      navigate("/dashboard")
    } else {
      console.log("Register submitted:", {
        ...formData,
        recaptchaToken
      })
      navigate("/dashboard")
    }

    // Reset reCAPTCHA after submission
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
    setRecaptchaToken("")
  }

  // Reset reCAPTCHA when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
    setRecaptchaToken("")
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
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-2.5 font-medium transition-all rounded-lg ${
                activeTab === "login"
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-2.5 font-medium transition-all rounded-lg ${
                activeTab === "register"
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "login" && (
              <>
                {/* Username */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    required
                  />
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center py-2">
                  <div
                    className="g-recaptcha"
                    data-sitekey="your-recaptcha-site-key"
                    data-callback={handleRecaptchaChange}
                    data-expired-callback={handleRecaptchaExpired}
                    data-error-callback={handleRecaptchaError}
                    ref={recaptchaRef}
                  ></div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!recaptchaToken}
                >
                  Login
                </button>
              </>
            )}

            {activeTab === "register" && (
              <>
                {/* Email */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                    required
                  />
                </div>

                {/* Referral Code */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Referral Code (Optional)</label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    placeholder="Enter referral code if you have one"
                    className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
                  />
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center py-2">
                  <div
                    className="g-recaptcha"
                    data-sitekey="your-recaptcha-site-key"
                    data-callback={handleRecaptchaChange}
                    data-expired-callback={handleRecaptchaExpired}
                    data-error-callback={handleRecaptchaError}
                    ref={recaptchaRef}
                  ></div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:opacity-90 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!recaptchaToken}
                >
                  Create Account
                </button>
              </>
            )}
          </form>

          {/* Demo Text */}
          <p className="text-center text-gray-300 mt-5 text-sm">
            Demo account: username=<span className="font-semibold">demo</span>, password=
            <span className="font-semibold">demo123</span>
          </p>
        </div>
      </div>

      {/* Load reCAPTCHA script */}
      <script
        src="https://www.google.com/recaptcha/api.js"
        async
        defer
      ></script>
    </div>
  )
}