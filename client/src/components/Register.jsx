import { useState } from 'react';
import { register, verifyOtp } from '../api';
import { useToast } from './Toast';

export default function Register({ onAuthSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(name, email, password);
      if (data.requiresOtp) {
        setTempToken(data.tempToken);
        setShowOtp(true);
        if (data.otpDemoFallback) {
          toast(`Demo Mode OTP: ${data.otpDemoFallback}`, 'info');
        } else {
          toast('OTP sent to your email!', 'success');
        }
      } else {
        localStorage.setItem('armor_token', data.token);
        localStorage.setItem('armor_user', JSON.stringify(data.user));
        toast('Account created successfully!', 'success');
        onAuthSuccess(data.user);
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await verifyOtp(tempToken, otp);
      localStorage.setItem('armor_token', data.token);
      localStorage.setItem('armor_user', JSON.stringify(data.user));
      toast('Verification complete! Account created.', 'success');
      onAuthSuccess(data.user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card glass-panel animate-fade-in">
      <h2>{!showOtp ? 'Create Account' : '2-Step Verification'}</h2>
      <p className="auth-subtitle">
        {!showOtp 
          ? 'Join Armor Financial AI' 
          : 'Enter the 6-digit OTP sent to your email'}
      </p>
      
      {!showOtp ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Siddhant Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="auth-form">
           <div className="input-group">
            <label>Secure OTP</label>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying...' : 'Complete Account Setup'}
          </button>
        </form>
      )}
      
      <p className="auth-footer">
        {!showOtp ? (
          <>Already have an account? <span onClick={onSwitchToLogin} className="auth-link">Login</span></>
        ) : (
          <span onClick={() => setShowOtp(false)} className="auth-link">← Back to Registration</span>
        )}
      </p>
    </div>
  );
}
