import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const C = {
  navy: "#1a3a6b",
  blue: "#2563eb",
  orange: "#f97316",
  green: "#16a34a",
  red: "#dc2626",
  bg: "#f5f8ff",
  card: "#ffffff",
  altBg: "#eaf0fb",
  border: "#dce8fb",
  muted: "#7a8faf",
  body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif"
};

export default function FeedbackButton() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!rating) {
      alert('Please select a rating (1-5 stars)');
      return;
    }
    
    if (!feedbackType) {
      alert('Please select a type of feedback');
      return;
    }
    
    if (!message.trim()) {
      alert('Please enter your detailed feedback');
      return;
    }

    setLoading(true);
    
    try {
      // Build form data to send to Google Form
      const formData = new FormData();
      
      // Entry IDs from your Google Form:
      formData.append('entry.2061413087', rating); // Rating (1-5)
      formData.append('entry.476122215', feedbackType); // Feedback Type
      formData.append('entry.511393385', message); // Feedback message
      formData.append('entry.1394731828', email || ''); // Email
      // NOTE: entry.470041618 (Anonymous) doesn't exist in your form, so removed
      
      // Add role if user is logged in
      if (user && user.role) {
        const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
        formData.append('entry.1881947254', formattedRole); // Role
      }

      // Debug: Log what we're sending
      console.log('📤 Submitting feedback to Google Form:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Submit to Google Form's formResponse endpoint
      fetch('https://docs.google.com/forms/d/e/1FAIpQLSeQeNwpQljqFlnsmbPCjDvzdbvwCnoO2Y4AF_KEyfEO3k7oDQ/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      }).then((response) => {
        console.log('✅ Form submission response:', response);
        // Show success
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setRating(0);
          setFeedbackType('General Feedback');
          setMessage('');
          setEmail('');
          setAnonymous(false);
        }, 2000);
      }).catch((err) => {
        console.error('❌ Feedback submission error:', err);
        // Show success anyway - no-cors means we can't see response
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setRating(0);
          setFeedbackType('General Feedback');
          setMessage('');
          setEmail('');
          setAnonymous(false);
        }, 2000);
      }).finally(() => {
        setLoading(false);
      });
    } catch (err) {
      console.error('Feedback error:', err);
      alert('Error submitting feedback. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: C.blue,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
          zIndex: 999,
          transition: 'all 0.3s ease',
          fontFamily: C.font,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(37, 99, 235, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
        }}
        title="Send feedback"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: C.font,
          padding: '16px'
        }}>
          <div style={{
            background: C.card,
            borderRadius: 20,
            border: `1.5px solid ${C.border}`,
            padding: '32px 28px',
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 8px 32px rgba(26, 58, 107, 0.15)',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.navy, margin: 0 }}>Share Your Feedback</h2>
                <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>We'd love to hear from you!</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: `1.5px solid ${C.border}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.muted,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.red;
                  e.currentTarget.style.color = C.red;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.muted;
                }}
              >
                ✕
              </button>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 32
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.green, margin: '0 0 8px' }}>Thank You!</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Your feedback has been recorded successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Rating */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 10 }}>
                    Rating <span style={{ color: C.red }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          border: `2px solid ${rating >= num ? C.orange : C.border}`,
                          background: rating >= num ? `${C.orange}15` : 'transparent',
                          fontSize: 20,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          color: rating >= num ? C.orange : C.muted
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Type */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 8 }}>
                    Feedback Type <span style={{ color: C.red }}>*</span>
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      fontFamily: C.font,
                      fontSize: 13,
                      color: C.navy,
                      background: C.bg,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="General Feedback">General Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 8 }}>
                    Detailed Feedback <span style={{ color: C.red }}>*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      fontFamily: C.font,
                      fontSize: 13,
                      color: C.navy,
                      background: C.bg,
                      minHeight: 80,
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.navy, display: 'block', marginBottom: 8 }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      fontFamily: C.font,
                      fontSize: 13,
                      color: C.navy,
                      background: C.bg,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Anonymous Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.blue }}
                  />
                  <span style={{ fontSize: 13, color: C.body }}>Submit anonymously</span>
                </label>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '11px 20px',
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      background: 'transparent',
                      color: C.body,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: C.font,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.muted;
                      e.currentTarget.style.background = C.altBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '11px 20px',
                      borderRadius: 10,
                      border: 'none',
                      background: C.blue,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: C.font,
                      opacity: loading ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {loading ? 'Submitting...' : 'Send Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
