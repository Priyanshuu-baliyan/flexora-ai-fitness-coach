import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | FlexOra — AI Fitness Coach';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden gradient-dark">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-dark-card border border-dark-border text-text-secondary hover:text-text-primary hover:bg-dark-surface transition-all duration-200 shadow-lg cursor-pointer z-50"
        title="Toggle theme"
      >
        {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
      </button>

      {/* Decorative blurred circles */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-primary rounded-full blur-[160px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-secondary rounded-full blur-[140px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 glow-primary mx-auto">
            <span className="text-3xl font-black text-white leading-none select-none">F</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">FlexOra</h1>
          <p className="text-text-muted mt-1">AI Fitness Coach</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-text-primary">Welcome Back</h2>
            <p className="text-sm text-text-muted mt-1">Sign in to continue your fitness journey</p>
          </div>

          {/* Email */}
          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="email"
              placeholder="Email address"
              className="input-field input-icon-padding"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              className="input-field input-icon-padding !pr-12"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-light transition-colors font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
