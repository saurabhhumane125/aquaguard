import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ShieldCheck, Droplets } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authAPI.sendOTP(identifier, type);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(identifier, otp);
      login(response.data.user, response.data.token);
      
      // Redirect based on role
      if (response.data.user.role === 'AUTHORITY' || response.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-8 text-center text-white">
          <Droplets className="w-12 h-12 mx-auto mb-4 text-primary-100" />
          <h1 className="text-3xl font-bold mb-2">AquaGuard</h1>
          <p className="text-primary-100">Smart Water Leak Management</p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'email' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  onClick={() => setType('email')}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'phone' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  onClick={() => setType('phone')}
                >
                  Phone SMS
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {type === 'email' ? <Mail size={20} /> : <Phone size={20} />}
                  </div>
                  <input
                    type={type === 'email' ? 'email' : 'tel'}
                    className="input pl-10 h-12"
                    placeholder={type === 'email' ? 'you@example.com' : '9876543210'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier}
                className="w-full btn-primary h-12 flex items-center justify-center space-x-2 text-lg disabled:opacity-50"
              >
                <span>{loading ? 'Sending...' : 'Get OTP'}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Enter OTP</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a code to <span className="font-medium text-gray-900">{identifier}</span>
                </p>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-primary-600 text-sm mt-2 hover:underline"
                >
                  Change {type}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  className="input h-14 text-center text-3xl tracking-[1em] font-mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary h-12 text-lg disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-center text-gray-500 text-sm max-w-sm">
        By continuing, you agree to AquaGuard's <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
      </p>
    </div>
  );
};

export default Login;
