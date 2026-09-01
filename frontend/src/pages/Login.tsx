import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CourtIllustration() {
  return (
    <svg viewBox="0 0 300 400" style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'block' }}>
      <rect x="40" y="20" width="220" height="360" rx="6" fill="none" stroke="var(--white)" strokeWidth="3" opacity="0.9" />
      <rect x="40" y="140" width="220" height="60" fill="var(--yellow)" opacity="0.14" />
      <rect x="40" y="200" width="220" height="60" fill="var(--yellow)" opacity="0.14" />
      <line x1="40" y1="200" x2="260" y2="200" stroke="var(--white)" strokeWidth="5" opacity="0.9" />
      <line x1="150" y1="20" x2="150" y2="140" stroke="var(--white)" strokeWidth="2" opacity="0.7" />
      <line x1="150" y1="260" x2="150" y2="380" stroke="var(--white)" strokeWidth="2" opacity="0.7" />
      <circle cx="250" cy="352" r="15" fill="var(--yellow)" />
      <circle cx="245" cy="347" r="1.6" fill="var(--green)" />
      <circle cx="255" cy="347" r="1.6" fill="var(--green)" />
      <circle cx="250" cy="356" r="1.6" fill="var(--green)" />
      <circle cx="243" cy="357" r="1.6" fill="var(--green)" />
      <circle cx="257" cy="357" r="1.6" fill="var(--green)" />
    </svg>
  );
}

export default function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const floated = focused || name.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a username'); return; }
    setLoading(true);
    setError('');
    try {
      await login(name);
      navigate('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split">
      <div className="login-art-panel">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: 'var(--white)', lineHeight: 1.05, textAlign: 'center' }}>
          BARN BOYS<br />SCOREBOOK
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 10, marginBottom: 24, textAlign: 'center' }}>
          Every game. Every score. One shared book.
        </div>
        <CourtIllustration />
      </div>

      <div className="login-form-panel">
        <div className="login-form-card fade-in">
          <div className="login-mobile-brand">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--charcoal)' }}>BARN BOYS SCOREBOOK</div>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--charcoal)' }}>Sign in</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6, marginBottom: 24 }}>
            New here? Just pick a username and we'll set up your account.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: 36 }}>
              <label style={{
                position: 'absolute', left: 0, pointerEvents: 'none',
                top: floated ? -18 : 8,
                fontSize: floated ? 12 : 18,
                color: floated ? 'var(--green)' : 'var(--gray-500)',
                fontWeight: floated ? 700 : 400,
                letterSpacing: floated ? 0.4 : 0,
                transition: 'all 0.18s ease',
              }}>Username</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
                style={{
                  width: '100%', border: 'none', borderBottom: `2px solid ${focused ? 'var(--yellow)' : 'var(--gray-300)'}`,
                  background: 'transparent', fontSize: 20, padding: '8px 0', outline: 'none',
                  fontFamily: 'var(--font-body)', color: 'var(--charcoal)', transition: 'border-color 0.18s ease',
                }}
              />
            </div>

            {error && (
              <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Enter app'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}