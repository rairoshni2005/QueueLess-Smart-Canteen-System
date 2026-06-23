import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, Award, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    role: 'student',
  });
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    const { name, email, password, role, collegeId } = formData;

    if (!email || !password || (!isLogin && (!name || !collegeId || !role))) {
      setLocalError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role, collegeId);
      }
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-brand-50 via-white to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-2xl shadow-xl shadow-brand-500/25 mb-4">
            🍽️
          </span>
          <h2 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to QueueLess
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Log in to order & skip campus lines' : 'Create an account to start ordering'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setLocalError(''); }}
              className={`w-1/2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                isLogin ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setLocalError(''); }}
              className={`w-1/2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                !isLogin ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {!isLogin && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <User size={18} />
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Roshni Rai"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* College ID */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    College ID / Employee ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Award size={18} />
                    </span>
                    <input
                      name="collegeId"
                      type="text"
                      required
                      placeholder="e.g. STU-2026-105"
                      value={formData.collegeId}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Role Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <ShieldCheck size={18} />
                    </span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none bg-white appearance-none transition-colors"
                    >
                      <option value="student">Student / Campus Customer</option>
                      <option value="vendor">Cafeteria Vendor</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-200"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isLogin ? (
                'Log In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Alert Helper */}
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
          <p className="font-bold text-gray-600 mb-1">🎉 Instant Testing Accounts</p>
          <p>Student: <span className="font-mono text-brand-600">roshni@queueless.com</span> / <span className="font-mono text-brand-600">password123</span></p>
          <p className="mt-0.5">Vendor: <span className="font-mono text-brand-600">vendor@queueless.com</span> / <span className="font-mono text-brand-600">password123</span></p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
