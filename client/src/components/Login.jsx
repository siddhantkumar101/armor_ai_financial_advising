import { useState } from 'react';
import { login } from '../api';
import { useToast } from './Toast';

export default function Login({ onAuthSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('armor_token', data.token);
      localStorage.setItem('armor_user', JSON.stringify(data.user));
      toast('Welcome back!', 'success');
      onAuthSuccess(data.user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card glass-panel animate-fade-in">
      <h2>Login to Armor</h2>
      <p className="auth-subtitle">Access your financial intelligence dashboard</p>
      
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
      
      <p className="auth-footer">
        Don't have an account? <span onClick={onSwitchToRegister} className="auth-link">Register</span>
      </p>
    </div>
  );
}
