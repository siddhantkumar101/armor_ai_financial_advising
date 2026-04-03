import { useState } from 'react';
import { register } from '../api';
import { useToast } from './Toast';

export default function Register({ onAuthSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(name, email, password);
      localStorage.setItem('armor_token', data.token);
      localStorage.setItem('armor_user', JSON.stringify(data.user));
      toast('Account created successfully!', 'success');
      onAuthSuccess(data.user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card glass-panel animate-fade-in">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join Armor Financial AI</p>
      
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
      
      <p className="auth-footer">
        Already have an account? <span onClick={onSwitchToLogin} className="auth-link">Login</span>
      </p>
    </div>
  );
}
