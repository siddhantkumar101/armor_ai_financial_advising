import { useState } from 'react';
import { login, verifyOtp } from '../api';
import { useToast } from './Toast';

export default function Login({ onAuthSuccess, onSwitchToRegister }) {
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
      const data = await login(email, password);
      if (data.requiresOtp) {
        setTempToken(data.tempToken);
        setShowOtp(true);
        toast('OTP generated! Check your terminal.', 'success');
      } else {
        localStorage.setItem('armor_token', data.token);
        localStorage.setItem('armor_user', JSON.stringify(data.user));
        toast('Welcome back!', 'success');
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
      toast('Verification complete! Welcome back.', 'success');
      onAuthSuccess(data.user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card glass-panel animate-fade-in">
      <h2>{!showOtp ? 'Login to Armor' : '2-Step Verification'}</h2>
      <p className="auth-subtitle">
        {!showOtp 
          ? 'Access your financial intelligence dashboard' 
          : 'Enter the 6-digit OTP sent to your terminal'}
      </p>
      
      {!showOtp ? (
        <form onSubmit={handleSubmit} className="auth-form">
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
            {loading ? 'Authenticating...' : 'Sign In'}
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
            {loading ? 'Verifying...' : 'Complete Login'}
          </button>
        </form>
      )}
      
      <p className="auth-footer">
        {!showOtp ? (
          <>Don't have an account? <span onClick={onSwitchToRegister} className="auth-link">Register</span></>
        ) : (
          <span onClick={() => setShowOtp(false)} className="auth-link">← Back to Login</span>
        )}
      </p>
    </div>
  );
}
