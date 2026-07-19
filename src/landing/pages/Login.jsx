import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Home, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import loginImg from '../../assets/login_illustration.png';
import { useLogin } from '../../hooks/useAuth';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // ── React Query mutation for login ──────────────────────────
  const { mutate: login, isPending, error, isError } = useLogin();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Trigger the login mutation with the form credentials
    login(formData);
  };

  // ── Parse server error message ───────────────────────────────
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.';

  // ── Parse field-level validation errors from server ──────────
  const serverErrors = error?.response?.data?.errors || [];
  const getFieldError = (field) =>
    serverErrors.find((e) => e.field === field)?.message;

  // ── Reusable error field message ──────────────────────────────
  const FieldError = ({ field }) => {
    const msg = getFieldError(field);
    if (!msg) return null;
    return <p className="text-red-500 text-xs font-medium mt-1 ml-2">{msg}</p>;
  };


  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex flex-col md:flex-row font-sans items-center justify-center p-4">
      
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl">
        {/* Left Side: Illustration */}
        <div className="w-full md:w-[45%] flex items-center justify-center p-4 md:p-8">
          <img 
            src={loginImg} 
            alt="Login Illustration" 
            className="w-full max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-[#1a2b4b] text-3xl font-black mb-2">Login</h1>
            <p className="text-gray-400 text-base font-medium">Enter your credentials to access your account</p>
          </div>

          {/* ── Server Error Banner ─────────────────────────── */}
          {isError && (
            <div className="mb-5 flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[#1a2b4b] font-bold block ml-1 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#145be9]" />
                <span>Email Address*</span>
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.com"
                required
                disabled={isPending}
                className="w-full bg-[#f0f4ff]/50 px-6 py-3 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium border border-transparent focus:border-blue-500/20 disabled:opacity-60"
              />
              <FieldError field="email" />
            </div>

            <div className="space-y-2">
              <label className="text-[#1a2b4b] font-bold block ml-1 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#145be9]" />
                <span>Password*</span>
              </label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="w-full bg-[#f0f4ff]/50 px-6 py-3 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 font-medium border border-transparent focus:border-blue-500/20 disabled:opacity-60"
              />
              <FieldError field="password" />
            </div>

            <div className="flex items-center justify-between px-2 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]" />
                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs text-[#145be9] font-bold hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#145be9] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isPending ? (
                  // Loading state with spinner
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium text-sm">
            Don't have an account? 
            <Link to="/register" className="text-[#145be9] font-bold ml-1 hover:underline">
              Create an account
            </Link>
          </p>

          <Link to="/" className="mt-6 flex items-center justify-center space-x-2 text-gray-400 hover:text-[#145be9] transition-colors font-bold text-xs uppercase tracking-widest">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  </div>
);
};

export default Login;
