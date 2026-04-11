import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../api/authApi";

const C = {
  navy: "#1a3a6b",
  blue: "#2563eb",
  orange: "#f97316",
  bg: "#f5f8ff",
  card: "#ffffff",
  altBg: "#eaf0fb",
  border: "#dce8fb",
  muted: "#7a8faf",
  body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─── Logo ─── */
function Logo({ onClick }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:9, background:"none", border:"none", cursor:"pointer", padding:0 }}>
      <img
        src="/logo_half.png"
        alt="logo"
        style={{ width:36, height:36, objectFit:"contain" }}
      />
      <span style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.5px" }}>
        <span style={{ color:"#1a3a6b" }}>NPTEL</span><span style={{ color:"#f97316" }}>ify</span>
      </span>
    </button>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  const [hovHelp, setHovHelp] = useState(false);
  return (
    <nav style={{ position:"sticky", top:0, zIndex:50, background:C.card, borderBottom:`1.5px solid ${C.border}`, fontFamily:C.font }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo onClick={() => navigate("/home")} />
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <button
            onClick={() => navigate("/help")}
            onMouseEnter={() => setHovHelp(true)}
            onMouseLeave={() => setHovHelp(false)}
            style={{ padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background: hovHelp ? "#e56c0a" : C.orange, border:"none", cursor:"pointer", transition:"background 0.18s", fontFamily:C.font }}
          >
            Help
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:C.muted, fontWeight:500 }}>Already have an account?</span>
            <button
              onClick={() => navigate("/login")}
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              style={{ padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700, color: hov ? "#fff" : C.blue, background: hov ? C.blue : "transparent", border:`1.5px solid ${C.blue}`, cursor:"pointer", transition:"all 0.18s", fontFamily:C.font }}>
              Log In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Google Button ─── */
// COMMENTED OUT: Google authentication
// function GoogleBtn() {
//   const [hov, setHov] = useState(false);
//   return (
//     <button
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"12px 16px", borderRadius:12, border:`1.5px solid ${hov ? C.blue : C.border}`, background:C.bg, color:C.navy, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:18, transition:"border-color 0.18s", fontFamily:C.font }}>
//       <svg viewBox="0 0 24 24" style={{ width:20, height:20 }}>
//         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//       </svg>
//       Sign up with Google
//     </button>
//   );
// }

/* ─── Divider ─── */
function Divider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
      <div style={{ flex:1, height:1, background:C.border }} />
      <span style={{ fontSize:12, fontWeight:600, color:C.muted, whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}

/* ─── Text / Email Input ─── */
function TextInput({ label, name, type="text", placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:13, fontWeight:700, color:C.navy }}>{label}</label>
      <input
        name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ padding:"12px 16px", borderRadius:12, border:`1.5px solid ${focused ? C.blue : C.border}`, background:C.bg, color:C.navy, fontSize:14, fontFamily:C.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.18s" }}
      />
    </div>
  );
}

/* ─── Password Input ─── */
function PasswordInput({ label, name, placeholder, value, onChange, show, setShow, borderColor }) {
  const [focused, setFocused] = useState(false);
  const finalBorder = focused ? C.blue : (borderColor || C.border);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {label && <label style={{ fontSize:13, fontWeight:700, color:C.navy }}>{label}</label>}
      <div style={{ position:"relative" }}>
        <input
          name={name} type={show ? "text" : "password"} placeholder={placeholder}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:"100%", padding:"12px 44px 12px 16px", borderRadius:12, border:`1.5px solid ${finalBorder}`, background:C.bg, color:C.navy, fontSize:14, fontFamily:C.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.18s" }}
        />
        <button type="button" onClick={() => setShow(!show)}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex", alignItems:"center", padding:0 }}>
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}>
              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Strength Bar ─── */
function StrengthBar({ password }) {
  if (!password.length) return null;
  const strength = password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const colors = ["", "#f97316", "#f59e0b", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Strong"];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
      <div style={{ display:"flex", gap:4, flex:1 }}>
        {[1,2,3].map(n => (
          <div key={n} style={{ flex:1, height:6, borderRadius:999, background: strength >= n ? colors[strength] : C.border, transition:"background 0.2s" }} />
        ))}
      </div>
      <span style={{ fontSize:11, fontWeight:700, color: colors[strength], minWidth:30 }}>{labels[strength]}</span>
    </div>
  );
}

const ROLES = [
  {
    id: "candidate",
    label: "Candidate",
    desc: "I'm preparing for NPTEL exams",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:22, height:22 }}>
        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    ),
  },
  {
    id: "examiner",
    label: "Examiner",
    desc: "I'm creating & managing quizzes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:22, height:22 }}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
];

function RoleSelector({ value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:13, fontWeight:700, color:C.navy }}>I am a…</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {ROLES.map(role => {
          const selected = value === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              style={{
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:8, padding:"16px 12px", borderRadius:14,
                border:`2px solid ${selected ? C.blue : C.border}`,
                background: selected ? "#eaf0fb" : C.bg,
                color: selected ? C.blue : C.body,
                cursor:"pointer", transition:"all 0.18s", textAlign:"center",
                boxShadow: selected ? `0 0 0 3px ${C.blue}18` : "none",
                position:"relative",
              }}>
              {/* Icon circle */}
              <div style={{
                width:44, height:44, borderRadius:"50%",
                background: selected ? C.blue : C.border,
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                transition:"background 0.18s",
              }}>
                {role.icon}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color: selected ? C.blue : C.navy, lineHeight:1.2 }}>{role.label}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2, lineHeight:1.4 }}>{role.desc}</div>
              </div>
              {/* Checkmark badge */}
              {selected && (
                <div style={{ position:"absolute", top:8, right:8, width:18, height:18, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width:10, height:10 }}>
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Error Box ─── */
function ErrorBox({ msg }) {
  return (
    <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:600, color:"#c2410c", background:"#fff3ee", border:`1.5px solid #f9731640` }}>
      {msg}
    </div>
  );
}

/* ─── Checkbox ─── */
function Checkbox({ checked, onChange }) {
  return (
    <div onClick={onChange}
      style={{ width:18, height:18, borderRadius:6, border:`2px solid ${checked ? C.blue : C.border}`, background: checked ? C.blue : "#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, marginTop:1, transition:"all 0.15s" }}>
      {checked && (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width:11, height:11 }}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      )}
    </div>
  );
}

/* ─── Trust Badges ─── */
function TrustBadges({ items, checkColor }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:18, flexWrap:"wrap" }}>
      {items.map(t => (
        <span key={t} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600, color:C.muted }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={checkColor} strokeWidth="2.5" style={{ width:13, height:13 }}>
            <path d="M5 13l4 4L19 7"/>
          </svg>
          {t}
        </span>
      ))}
    </div>
  );
}

/* ─── Submit Button ─── */
function SubmitButton({ loading, bg, hoverBg, loadingBg, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", fontFamily:C.font, fontSize:14, fontWeight:800, color:"#fff", cursor: loading ? "not-allowed" : "pointer", background: loading ? loadingBg : hov ? hoverBg : bg, display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.18s", boxShadow:`0 4px 18px ${bg}30`, marginTop:4 }}>
      {loading && (
        <svg style={{ width:16, height:16, animation:"spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
        </svg>
      )}
      {children}
    </button>
  );
}


export default function SignupPage() {
  const [form, setForm]     = useState({ name:"", email:"", password:"", confirm:"", role : "" });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handle = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) { setErr("Please fill in all fields."); return; }
    if (!form.role) { setErr("Please select a role."); return; }
    if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!agreed) { setErr("Please accept the terms to continue."); return; }
    setLoading(true);
    setErr("");
    try {
      const data = await registerApi(form.name, form.email, form.password, form.role);
      auth.login(data);
      navigate(data.role === "examiner" ? "/examiner" : "/candidate/dashboard");
    } catch (error) {
      setErr(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const mismatch = form.confirm && form.confirm !== form.password;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.navy, fontFamily:C.font }}>
      <Navbar />

      {/* Page body */}
      <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px", position:"relative", overflow:"hidden" }}>

        {/* Bg blobs */}
        <div style={{ position:"absolute", top:-100, right:-100, width:440, height:440, borderRadius:"50%", background:C.altBg, opacity:0.7, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"#fde8d4", opacity:0.6, pointerEvents:"none" }} />

        {/* Dot grid */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.15, pointerEvents:"none" }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={C.blue} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div style={{ position:"relative", width:"100%", maxWidth:440 }}>

          {/* ── Card ── */}
          <div style={{ background:C.card, borderRadius:28, padding:"40px 36px", border:`1.5px solid ${C.border}`, boxShadow:"0 8px 40px #2563eb12" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"#fff3ee", marginBottom:14 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" style={{ width:26, height:26 }}>
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:C.navy, letterSpacing:"-0.5px" }}>Start for free</h1>
              <p style={{ margin:"6px 0 0", fontSize:14, color:C.muted }}>Join 50,000+ NPTEL learners today</p>
            </div>

            {/* <GoogleBtn /> */}
            {/* <Divider label="or create an account" /> */}

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {err && <ErrorBox msg={err} />}

              <TextInput label="Full name"      name="name"  type="text"  placeholder="Priya Sharma"      value={form.name}  onChange={handle} />
              <TextInput label="Email address"  name="email" type="email" placeholder="you@example.com"   value={form.email} onChange={handle} />

               {/* Role selection */}
              <RoleSelector value={form.role} onChange={role => { setForm(p => ({ ...p, role })); setErr(""); }} />

              {/* Password with strength */}
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                <PasswordInput
                  label="Password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handle} show={show} setShow={setShow}
                />
                <StrengthBar password={form.password} />
              </div>

              {/* Confirm password */}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <PasswordInput
                  label="Confirm password" name="confirm" placeholder="Re-enter password"
                  value={form.confirm} onChange={handle} show={show} setShow={setShow}
                  borderColor={mismatch ? C.orange : undefined}
                />
                {mismatch && (
                  <span style={{ fontSize:12, fontWeight:600, color:C.orange, marginTop:2 }}>Passwords don't match</span>
                )}
              </div>

              {/* Terms */}
              <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
                <Checkbox checked={agreed} onChange={() => setAgreed(!agreed)} />
                <span style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                  I agree to the{" "}
                  <a href="#" style={{ color:C.blue, fontWeight:700, textDecoration:"none" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color:C.blue, fontWeight:700, textDecoration:"none" }}>Privacy Policy</a>
                </span>
              </label>

              <SubmitButton loading={loading} bg={C.orange} hoverBg="#e56c0a" loadingBg="#fbbd93">
                {loading ? "Creating account…" : "Create Free Account"}
              </SubmitButton>
            </form>

            {/* Switch to login */}
            <p style={{ textAlign:"center", fontSize:13, color:C.muted, marginTop:20, marginBottom:0 }}>
              Already have an account?{" "}
              <button onClick={() => navigate("/login")}
                style={{ color:C.blue, background:"none", border:"none", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:C.font, padding:0 }}>
                Sign in
              </button>
            </p>
          </div>

          <TrustBadges items={["No credit card", "Free forever", "2-min setup"]} checkColor={C.orange} />
        </div>
      </div>
    </div>
  );
}