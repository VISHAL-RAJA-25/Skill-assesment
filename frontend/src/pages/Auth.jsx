import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../ThemeContext';

export default function Auth() {
  const [screen, setScreen] = useState('role');
  const [role, setRole] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [newPass, setNewPass] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : '#fff';
  const text = isDark ? '#fff' : '#1a1a2e';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

  const inp = { padding: '12px 16px', borderRadius: 10, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const btnP = (col = '#667eea,#764ba2') => ({ padding: 13, borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(90deg,${col})`, color: '#fff', fontSize: 15, fontWeight: 600, width: '100%', opacity: loading ? 0.7 : 1 });
  const btnG = { padding: '8px 0', border: 'none', cursor: 'pointer', background: 'transparent', color: '#667eea', fontSize: 13, fontWeight: 500 };

  async function handleAuth(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, adminKey: role === 'admin' ? adminKey : undefined };
      const { data } = await api.post(endpoint, body);

      // Role mismatch checks
      if (role === 'admin' && !data.isAdmin) {
        setError('This account does not have admin privileges. Please use a valid admin key when registering.'); setLoading(false); return;
      }
      if (role === 'student' && data.isAdmin) {
        setError('This is an admin account. Please go back and select Admin role.'); setLoading(false); return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('streak', data.streak || 0);
      localStorage.setItem('maxStreak', data.maxStreak || 0);
      localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');
      navigate(data.isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  }

  async function handleForgot(e) {
    e.preventDefault(); setError(''); setInfo(''); setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setInfo('OTP sent! Check your email.'); setScreen('verify'); }
    catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  }

  async function handleVerify(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { const { data } = await api.post('/auth/verify-otp', { email, otp }); setResetToken(data.resetToken); setScreen('reset'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try { await api.post('/auth/reset-password', { resetToken, newPassword: newPass }); setScreen('success'); }
    catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  }

  const isAdminRole = role === 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, fontFamily: "'Segoe UI',sans-serif", position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><ThemeToggle /></div>

      <div style={{ background: cardBg, backdropFilter: 'blur(20px)', border: `1px solid ${border}`, borderRadius: 20, padding: '44px 40px', width: screen === 'role' ? 440 : 380, color: text }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 6 }}>⚡</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: text }}>SkillAssess</h1>
          <p style={{ fontSize: 13, color: muted, margin: 0 }}>Placement readiness platform</p>
        </div>

        {/* ── Role Picker ── */}
        {screen === 'role' && (
          <>
            <p style={{ textAlign: 'center', color: muted, fontSize: 14, marginBottom: 22 }}>Who are you? Select your role to continue.</p>
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              {[
                { id: 'student', emoji: '🎓', label: 'Student', sub: 'Practice skills, take tests & get job recommendations', col: '#667eea' },
                { id: 'admin', emoji: '🛡️', label: 'Admin / Faculty', sub: 'Manage questions, view all student results & analytics', col: '#ff6b6b' },
              ].map(r => (
                <div key={r.id}
                  style={{ flex: 1, border: `2px solid ${role === r.id ? r.col : border}`, borderRadius: 16, padding: '22px 14px', cursor: 'pointer', textAlign: 'center', background: role === r.id ? `${r.col}14` : 'transparent', transition: 'all 0.2s' }}
                  onClick={() => setRole(r.id)}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{r.emoji}</div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: text }}>{r.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: muted, lineHeight: 1.5 }}>{r.sub}</p>
                  {role === r.id && <div style={{ marginTop: 10, width: 20, height: 20, borderRadius: '50%', background: r.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', margin: '10px auto 0' }}>✓</div>}
                </div>
              ))}
            </div>
            <button style={{ ...btnP(isAdminRole ? '#ff6b6b,#ee0979' : '#667eea,#764ba2'), opacity: role ? 1 : 0.4, cursor: role ? 'pointer' : 'not-allowed' }}
              disabled={!role} onClick={() => role && setScreen('auth')}>
              Continue as {role === 'admin' ? 'Admin / Faculty' : role === 'student' ? 'Student' : '...'} →
            </button>
          </>
        )}

        {/* ── Login / Register ── */}
        {screen === 'auth' && (
          <>
            {/* Role badge + change */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, background: isAdminRole ? 'rgba(255,107,107,0.15)' : 'rgba(102,126,234,0.15)', color: isAdminRole ? '#ff6b6b' : '#667eea', fontWeight: 600 }}>
                {isAdminRole ? '🛡️ Admin / Faculty' : '🎓 Student'}
              </span>
              <button style={{ ...btnG, fontSize: 12, color: muted }} onClick={() => { setScreen('role'); setError(''); }}>← Change role</button>
            </div>

            {/* Tabs — students only */}
            {!isAdminRole && (
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 10, padding: 4, marginBottom: 18 }}>
                {['Login', 'Register'].map((tab, i) => {
                  const active = (i === 0) === isLogin;
                  return <button key={tab} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, background: active ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(102,126,234,0.15)') : 'transparent', color: active ? text : muted, transition: 'all 0.2s' }} onClick={() => { setIsLogin(i === 0); setError(''); }}>{tab}</button>;
                })}
              </div>
            )}

            {isAdminRole && (
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 10, padding: 4, marginBottom: 18 }}>
                {['Login', 'Register'].map((tab, i) => {
                  const active = (i === 0) === isLogin;
                  return <button key={tab} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, background: active ? 'rgba(255,107,107,0.2)' : 'transparent', color: active ? '#ff6b6b' : muted, transition: 'all 0.2s' }} onClick={() => { setIsLogin(i === 0); setError(''); }}>{tab}</button>;
                })}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={inp} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

              {/* Admin key field — only for admin registration */}
              {isAdminRole && !isLogin && (
                <div>
                  <input style={{ ...inp, borderColor: 'rgba(255,107,107,0.4)' }} type="password" placeholder="Admin Secret Key" value={adminKey} onChange={e => setAdminKey(e.target.value)} required />
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,107,107,0.7)' }}>🔐 Contact your faculty for the admin secret key</p>
                </div>
              )}

              {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>}

              <button style={btnP(isAdminRole ? '#ff6b6b,#ee0979' : '#667eea,#764ba2')} type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isAdminRole ? (isLogin ? 'Login as Admin →' : 'Register as Admin →') : (isLogin ? 'Login →' : 'Create Account →')}
              </button>

              {isLogin && (
                <div style={{ textAlign: 'center' }}>
                  <button type="button" style={btnG} onClick={() => { setScreen('forgot'); setError(''); }}>Forgot password?</button>
                </div>
              )}
            </form>
          </>
        )}

        {/* ── Forgot Password ── */}
        {screen === 'forgot' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, color: text }}>🔑 Forgot Password</h2>
            <p style={{ color: muted, fontSize: 13, marginBottom: 20 }}>Enter your registered email and we'll send a 6-digit OTP.</p>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={inp} type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
              {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>}
              {info && <p style={{ color: '#43e97b', fontSize: 13, margin: 0 }}>{info}</p>}
              <button style={btnP()} type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP →'}</button>
              <button type="button" style={btnG} onClick={() => { setScreen('auth'); setError(''); }}>← Back to Login</button>
            </form>
          </>
        )}

        {/* ── Verify OTP ── */}
        {screen === 'verify' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, color: text }}>📬 Enter OTP</h2>
            <p style={{ color: muted, fontSize: 13, marginBottom: 20 }}>We sent a 6-digit OTP to <strong style={{ color: text }}>{email}</strong>. Expires in 10 minutes.</p>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={{ ...inp, textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 10 }} type="text" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
              {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>}
              <button style={btnP()} type="submit" disabled={loading || otp.length < 6}>{loading ? 'Verifying...' : 'Verify OTP →'}</button>
              <button type="button" style={btnG} onClick={() => { setScreen('forgot'); setError(''); }}>← Resend OTP</button>
            </form>
          </>
        )}

        {/* ── Reset Password ── */}
        {screen === 'reset' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, color: text }}>🔒 New Password</h2>
            <p style={{ color: muted, fontSize: 13, marginBottom: 20 }}>Choose a strong password (min 6 characters).</p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={inp} type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
              {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>}
              <button style={btnP()} type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password →'}</button>
            </form>
          </>
        )}

        {/* ── Success ── */}
        {screen === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, color: text }}>Password Reset!</h2>
            <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>Password updated successfully. You can now log in.</p>
            <button style={btnP()} onClick={() => { setScreen('auth'); setIsLogin(true); setPassword(''); setNewPass(''); setOtp(''); }}>Go to Login →</button>
          </div>
        )}
      </div>
    </div>
  );
}