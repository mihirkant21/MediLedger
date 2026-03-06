import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { GoogleLogin } from '@react-oauth/google'
import { User, Mail, Lock, AlertCircle, Phone, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, verifyOTP, googleLogin: contextGoogleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      setLoading(true)

      try {
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
        toast.success('OTP sent to your email!')
        setStep(2) // Move to OTP step
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
        toast.error('Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      // Step 2: verify OTP
      if (!otp) {
        setError('Please enter the OTP sent to your email')
        return
      }

      setLoading(true)
      try {
        await verifyOTP(formData.email, otp)
        toast.success('Registration successful!')
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'OTP verification failed. Please try again.')
        toast.error('Verification failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      await contextGoogleLogin(credentialResponse.credential)
      toast.success('Google Registration successful!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Google Registration failed. Please try again.')
      toast.error('Google Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E030B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full relative z-10 animate-slide-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-surfaceHover p-4 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.15)] mb-4 border border-border relative group">
            <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-2xl group-hover:bg-primary-500/30 transition-colors duration-500"></div>
            <div className="h-12 w-12 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-xl flex items-center justify-center relative z-10">
              <svg className="h-8 w-8 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-text-main">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="mt-2 text-text-muted">
            {step === 1
              ? 'Join MediLedger and secure your medical records'
              : `We've sent a 6-digit code to ${formData.email}`}
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-border relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none before:rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-main mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <User className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-12 bg-surfaceHover/50"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Mail className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-12 bg-surfaceHover/50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-main mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Phone className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-12 bg-surfaceHover/50"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-main mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-12 bg-surfaceHover/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-main mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                      <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-12 bg-surfaceHover/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <label htmlFor="otp" className="block text-sm font-medium text-text-main mb-2">
                  Verification Code (OTP)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                    <Key className="h-5 w-5 text-text-muted group-focus-within:text-primary-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field pl-12 bg-surfaceHover/50 text-center text-xl tracking-widest font-mono font-bold"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : step === 1 ? (
                'Continue to Verification'
              ) : (
                'Verify & Create Account'
              )}
            </button>
          </form>

          {step === 1 && (
            <div className="mt-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-text-muted rounded-full border border-border">Or continue with</span>
                </div>
              </div>

              <div className="mt-8 flex justify-center hover:scale-105 transition-transform duration-300">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google Registration Failed')
                    toast.error('Google Registration Failed')
                  }}
                  useOneTap
                  text="signup_with"
                />
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-text-muted rounded-full border border-border">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-text-muted animate-fade-in" style={{ animationDelay: '0.4s' }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Register
