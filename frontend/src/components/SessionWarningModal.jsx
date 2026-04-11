import { useState, useEffect } from 'react';

const C = {
  navy: '#0f0a2e',
  blue: '#2563eb',
  green: '#10b981',
  red: '#dc2626',
  orange: '#f97316',
  muted: '#9ca3af',
  border: '#e5e7eb',
  light: '#fafafa',
  bg: '#ffffff',
};

export const SessionWarningModal = ({ isOpen, secondsRemaining, onStayLoggedIn, onLogout }) => {
  const [seconds, setSeconds] = useState(secondsRemaining || 120);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  if (!isOpen) return null;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: 12,
          padding: '32px',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        {/* Warning Icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.navy,
            margin: '0 0 12px 0',
          }}
        >
          Session Timeout Warning
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            margin: '0 0 20px 0',
            lineHeight: 1.5,
          }}
        >
          Your session will expire due to inactivity in:
        </p>

        {/* Countdown Timer */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: C.red,
            marginBottom: 24,
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}
        >
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        {/* Info Text */}
        <p
          style={{
            fontSize: 12,
            color: C.muted,
            margin: '0 0 24px 0',
          }}
        >
          Click "Stay Logged In" to continue, or you'll be automatically logged out.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
          }}
        >
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              background: '#f3f4f6',
              color: C.muted,
              border: `1px solid ${C.border}`,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.target.style.background = '#e5e7eb';
            }}
            onMouseOut={e => {
              e.target.style.background = '#f3f4f6';
            }}
          >
            Logout
          </button>
          <button
            onClick={onStayLoggedIn}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              background: C.green,
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.target.style.opacity = '0.9';
            }}
            onMouseOut={e => {
              e.target.style.opacity = '1';
            }}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
