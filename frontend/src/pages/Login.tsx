import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, ArrowRight, ShieldCheck, Mail, Phone, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = type === 'email' ? { email: identifier } : { phone: identifier };
      await authAPI.requestOTP(payload);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = type === 'email' ? { email: identifier, otp } : { phone: identifier, otp };
      const response = await authAPI.verifyOTP(payload);
      
      setToken(response.data.token);
      setUser(response.data.user);
      
      if (response.data.user.role === 'AUTHORITY') {
        navigate('/authority');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Dark Mode Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 blur-[130px] rounded-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* App Logo & Title */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.5)]"
          >
            <Droplets className="h-10 w-10 text-cyan-400" />
            <Activity className="h-6 w-6 text-blue-500 absolute bottom-2 right-2 animate-pulse" />
          </motion.div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300 mb-2">
            AquaGuard
          </h1>
          <p className="text-gray-400 font-medium">Smart City Water Leak Management</p>
        </div>

        {/* Glassmorphism Auth Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* subtle inner noise/glow if needed, but the backdrop-blur usually looks great alone */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-50" />
          
          <AnimatePresence mode="wait">
            {step === 'request' ? (
              <motion.form 
                key="request"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOTP}
                className="space-y-6"
              >
                <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/5">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      type === 'email' 
                        ? 'bg-blue-600 shadow-lg text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setType('email')}
                  >
                    <Mail className="inline h-4 w-4 mr-2" /> Email
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      type === 'phone' 
                        ? 'bg-blue-600 shadow-lg text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setType('phone')}
                  >
                    <Phone className="inline h-4 w-4 mr-2" /> Phone (SMS)
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2 ml-1">
                    {type === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                      {type === 'email' ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                    </div>
                    <input
                      type={type === 'email' ? 'email' : 'tel'}
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/5 text-white placeholder-gray-500 transition-all font-medium text-lg"
                      placeholder={type === 'email' ? 'you@example.com' : '+91 9999999999'}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <ShieldCheck className="h-4 w-4 mr-2" /> {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-base font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px]"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue Securely</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
                    <ShieldCheck className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Enter 6-Digit Code</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    We've sent a secure verification code to <br/>
                    <span className="font-semibold text-cyan-300">{identifier}</span>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
                    className="block w-full px-4 py-4 text-center tracking-[0.5em] font-mono text-2xl font-bold bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/5 text-white transition-all shadow-inner"
                    placeholder="••••••"
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <ShieldCheck className="h-4 w-4 mr-2" /> {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-base font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px]"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      <span>Authenticate</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm font-medium text-gray-500">
                  <button 
                    type="button" 
                    onClick={() => setStep('request')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Use a different account
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 mr-1.5 opacity-60" />
          Secured with End-to-End Encryption
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
