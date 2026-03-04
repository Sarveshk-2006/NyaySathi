import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Github } from 'lucide-react';
import { auth } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { LOGO_URL } from '../../utils/mockData';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strengthData = getPasswordStrength();

  // Form validation
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (!isLogin && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    // In a real app, call a backend endpoint to send reset email
    alert(`Password reset link sent to ${forgotEmail}`);
    setShowForgotModal(false);
    setForgotEmail('');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      await signInWithPopup(auth, provider);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      await signInWithPopup(auth, provider);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'GitHub Sign-In failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes successPop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }

        .auth-container {
          animation: slideInUp 0.6s ease-out;
        }

        .left-panel {
          animation: slideInLeft 0.7s ease-out;
        }

        .right-panel {
          animation: slideInRight 0.7s ease-out;
        }

        .form-title {
          animation: fadeInUp 0.5s ease-out 0.1s both;
        }

        .form-subtitle {
          animation: fadeInUp 0.5s ease-out 0.2s both;
        }

        .form-group {
          animation: fadeInUp 0.5s ease-out both;
        }

        .form-group:nth-child(1) { animation-delay: 0.3s; }
        .form-group:nth-child(2) { animation-delay: 0.4s; }
        .form-group:nth-child(3) { animation-delay: 0.5s; }
        .form-group:nth-child(4) { animation-delay: 0.6s; }
        .form-group:nth-child(5) { animation-delay: 0.65s; }

        .submit-button {
          animation: fadeInUp 0.5s ease-out 0.75s both;
        }

        .toggle-link {
          animation: fadeInUp 0.5s ease-out 0.85s both;
        }

        .social-buttons {
          animation: fadeInUp 0.5s ease-out 0.8s both;
        }

        .auth-input {
          position: relative;
          overflow: hidden;
        }

        .auth-input::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .auth-input:focus::before {
          left: 100%;
        }

        .logo-container {
          animation: float 3s ease-in-out infinite;
        }

        .heading-text {
          animation: fadeInUp 0.5s ease-out 0.15s both;
        }

        .subheading-text {
          animation: fadeInUp 0.5s ease-out 0.25s both;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #1e293b, #f59e0b);
          transition: width 0.3s ease-out;
        }

        .input-wrapper:focus-within::after {
          width: 100%;
        }

        .input-wrapper.error input {
          animation: shake 0.4s ease-in-out;
        }

        .error-message {
          animation: slideInLeft 0.3s ease-out;
        }

        .button-glow:hover {
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.3), 0 0 20px rgba(251, 146, 60, 0.15);
        }

        .toggle-text:hover {
          transform: translateX(2px);
        }

        .success-overlay {
          animation: successPop 0.5s ease-out;
        }

        .confetti-piece {
          animation: confetti 2s ease-out forwards;
        }

        .modal-overlay {
          animation: fadeInUp 0.3s ease-out;
        }

        .password-strength-bar {
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="success-overlay">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl">
              ✓
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece fixed w-2 h-2 bg-green-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: `${(i - 4) * 30}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="modal-overlay bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-slate-500 mb-6">Enter your email to receive a password reset link</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="input-wrapper">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="auth-input w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all font-medium text-slate-800"
                  placeholder="your@email.com"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all"
                >
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-slate-100 auth-container">
        {/* Left Panel */}
        <div className="md:w-5/12 bg-slate-900 relative overflow-hidden p-12 text-white flex flex-col justify-between left-panel">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12 logo-container">
              <div className="bg-white/90 p-2 rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
                <img src={LOGO_URL} alt="Nyay Saathi logo" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">Nyay Saathi</h1>
            </div>
            <h2 className="text-4xl font-serif font-bold mb-6 leading-tight heading-text">Access Justice <br/>Anytime, Anywhere.</h2>
            <p className="text-slate-300 font-light text-lg subheading-text">Your personal legal intelligence platform.</p>
            
            {/* Features List */}
            <div className="mt-12 space-y-4 text-sm">
              <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <span>AI-powered legal guidance</span>
              </div>
              <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <span>Case outcome predictions</span>
              </div>
              <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <span>Connect with verified advocates</span>
              </div>
              <div className="flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <span>Learn legal rights instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-white right-panel overflow-y-auto max-h-[700px]">
          <div className="max-w-md mx-auto w-full">
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2 form-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
            <p className="text-slate-500 mb-8 text-base form-subtitle">{isLogin ? 'Access your legal assistance portal' : 'Start your legal empowerment journey'}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className={`space-y-2 form-group input-wrapper ${validationErrors.email ? 'error' : ''}`}>
                <label className="text-sm font-semibold text-slate-900 ml-1 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
                  }}
                  className="auth-input w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300"
                  placeholder="name@example.com"
                />
                {validationErrors.email && <p className="text-red-500 text-xs ml-1 error-message">{validationErrors.email}</p>}
              </div>

              {/* Password Field */}
              <div className={`space-y-2 form-group input-wrapper ${validationErrors.password ? 'error' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Password</label>
                  {!isLogin && password && (
                    <span className={`text-xs font-bold ${strengthData.color === 'bg-red-500' ? 'text-red-500' : strengthData.color === 'bg-yellow-500' ? 'text-yellow-500' : strengthData.color === 'bg-blue-500' ? 'text-blue-500' : 'text-green-500'}`}>
                      {strengthData.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                    }}
                    className="auth-input w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && <p className="text-red-500 text-xs ml-1 error-message">{validationErrors.password}</p>}

                {/* Password Strength Bar */}
                {!isLogin && password && (
                  <div className="mt-2 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < strengthData.score ? strengthData.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              {isLogin && (
                <div className="form-group flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 font-medium">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2 error-message form-group">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-lg button-glow group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                <div className="relative flex items-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>

              {/* Divider */}
              <div className="relative form-group">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="social-buttons grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 p-3 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 active:scale-95 disabled:opacity-70 transition-all font-medium text-slate-700 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="hidden sm:inline text-sm">Google</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 p-3 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 active:scale-95 disabled:opacity-70 transition-all font-medium text-slate-700 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Github className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm">GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {/* Toggle Login/Signup */}
              <div className="toggle-link text-center">
                <span className="text-slate-500 text-sm">{isLogin ? "New to Nyay Saathi? " : "Already have an account? "}</span>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setValidationErrors({});
                    setError(null);
                  }}
                  className="text-slate-900 font-bold hover:text-amber-600 transition-all duration-300 toggle-text inline-block hover:scale-105 text-sm"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </div>

              {/* Terms & Conditions */}
              {!isLogin && (
                <p className="text-xs text-slate-500 text-center form-group">
                  By creating an account, you agree to our{' '}
                  <button className="text-amber-600 hover:underline font-medium">Terms of Service</button> and{' '}
                  <button className="text-amber-600 hover:underline font-medium">Privacy Policy</button>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
