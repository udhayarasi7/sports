import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';

export default function LoginSelection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('player');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(authStart());

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        // Strict Role Match Verification: check if signed up role matches selected mode role
        if (data.user.role !== selectedRole) {
          setFormError(`Invalid credentials for role: ${selectedRole.toUpperCase()}`);
          dispatch(authFailure(`Invalid credentials for role: ${selectedRole.toUpperCase()}`));
          return;
        }

        dispatch(authSuccess({ token: data.token, user: data.user }));
        if (data.user.status !== 'approved') {
          navigate('/status');
        } else {
          navigateToDashboard(data.user.role);
        }
      } else {
        setFormError(data.message || 'Login failed.');
        dispatch(authFailure(data.message));
      }
    } catch (err) {
      console.error('Login connection error:', err);
      setFormError('Failed to connect to authentication server. Please check backend connection.');
      dispatch(authFailure('Connection error'));
    }
  };

  const navigateToDashboard = (role) => {
    if (role === 'player') navigate('/player/dashboard');
    else if (role === 'coach') navigate('/coach/dashboard');
    else if (role === 'organizer') navigate('/organizer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/login/selection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logo/Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-black font-display tracking-tight text-white amber-glow">
            SPORTS HUB
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-2 font-bold">
            Elite Athletics Connection Network
          </p>
        </div>

        {/* Login Form Container */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Access Ecosystem</h2>

          {formError && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Role Pathway Selector */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
            {['player', 'coach', 'organizer'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  selectedRole === role
                    ? 'bg-white/10 text-white shadow'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                placeholder="name@sportshub.io"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold ml-1">Secure Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 mt-6"
            >
              <span>Authenticate Gateway</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-on-surface-variant">
              No account?{' '}
              <Link to="/register/selection" className="text-white hover:underline font-bold">
                Register New Credentials
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
