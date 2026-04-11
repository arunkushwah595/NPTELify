import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../api/authApi";

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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => navigate("/help")}
            onMouseEnter={() => setHovHelp(true)}
            onMouseLeave={() => setHovHelp(false)}
            style={{ padding:"8px 18px", fontSize:13, fontWeight:700, borderRadius:10, cursor:"pointer", transition:"all .18s", border:"1.5px solid #2563eb", background: hovHelp ? "#2563eb" : "transparent", color: hovHelp ? "#fff" : "#2563eb", fontFamily:C.font }}
          >
            Help
          </button>
          <button
            onClick={() => navigate("/signup")}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{ padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background: hov ? "#e56c0a" : C.orange, border:"none", cursor:"pointer", transition:"background 0.18s" }}>
            Sign Up Free
          </button>
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
//       Continue with Google
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

/* ─── Input ─── */
function Input({ label, name, type, placeholder, value, onChange, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:13, fontWeight:700, color:C.navy }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input
          name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ width:"100%", padding: right ? "12px 44px 12px 16px" : "12px 16px", borderRadius:12, border:`1.5px solid ${focused ? C.blue : C.border}`, background:C.bg, color:C.navy, fontSize:14, fontFamily:C.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.18s" }}
        />
        {right}
      </div>
    </div>
  );
}

/* ─── Password Toggle Eye ─── */
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
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


export default function LoginPage() {
  const [form, setForm]   = useState({ email:"", password:"" });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  // Redirect after successful login
  useEffect(() => {
    if (justLoggedIn && auth.user) {
      const dashboardPath = auth.user.role === "examiner" ? "/examiner/dashboard" : "/candidate/dashboard";
      navigate(dashboardPath, { replace: true });
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, auth.user, navigate]);

  // If logged in user visits login page (via back button or direct URL), redirect to dashboard
  useEffect(() => {
    if (auth.user && !justLoggedIn && !loading) {
      // Always go to the user's respective dashboard when they visit login page while logged in
      navigate(auth.user.role === "examiner" ? "/examiner/dashboard" : "/candidate/dashboard", { replace: true });
    }
  }, [auth.user, navigate, justLoggedIn, loading]);

  const handle = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErr("Please fill in all fields."); return; }
    setLoading(true);
    setErr("");
    try {
      const data = await loginApi(form.email, form.password);
      // Clear the lastPage before login
      sessionStorage.removeItem("lastPage");
      // Update auth context
      auth.login(data);
      // Set flag to trigger post-login navigation
      setJustLoggedIn(true);
    } catch (error) {
      setErr(error.message || "Invalid email or password");
      setLoading(false);
    }
  };

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
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:C.altBg, marginBottom:14 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width:26, height:26 }}>
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:C.navy, letterSpacing:"-0.5px" }}>Welcome back</h1>
              <p style={{ margin:"6px 0 0", fontSize:14, color:C.muted }}>Sign in to continue your NPTEL prep</p>
            </div>

            {/* <GoogleBtn /> */}
            {/* <Divider label="or sign in with email" /> */}

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {err && <ErrorBox msg={err} />}

              <Input label="Email address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />

              {/* Password with forgot link */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <label style={{ fontSize:13, fontWeight:700, color:C.navy }}>Password</label>
                  <a href="#" style={{ fontSize:12, fontWeight:600, color:C.blue, textDecoration:"none" }}>Forgot password?</a>
                </div>
                <div style={{ position:"relative" }}>
                  <input
                    name="password" type={show ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={handle}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border}
                    style={{ width:"100%", padding:"12px 44px 12px 16px", borderRadius:12, border:`1.5px solid ${C.border}`, background:C.bg, color:C.navy, fontSize:14, fontFamily:C.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.18s" }}
                  />
                  <EyeToggle show={show} onToggle={() => setShow(!show)} />
                </div>
              </div>

              {/* Remember me */}
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="checkbox" style={{ width:15, height:15, accentColor:C.blue }} />
                <span style={{ fontSize:13, fontWeight:500, color:C.body }}>Remember me for 30 days</span>
              </label>

              <SubmitButton loading={loading} bg={C.blue} hoverBg="#1d53d4" loadingBg="#93b4f5">
                {loading ? "Signing in…" : "Sign In"}
              </SubmitButton>
            </form>

            {/* Switch to signup */}
            <p style={{ textAlign:"center", fontSize:13, color:C.muted, marginTop:20, marginBottom:0 }}>
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")}
                style={{ color:C.orange, background:"none", border:"none", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:C.font, padding:0 }}>
                Sign up free
              </button>
            </p>
          </div>

          <TrustBadges items={["50K+ learners", "Secure login", "Free forever"]} checkColor={C.blue} />
        </div>
      </div>
    </div>
  );
}