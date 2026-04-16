// ProfileDropdown.jsx - Shared profile dropdown component
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function getProfileIcon(type) {
  const icons = {
    profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>,
    moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    help: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  };
  return icons[type] || icons.profile;
}

export function ProfileDropdown({ C, userName, onLogoutCallback, userRole = "Examiner" }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditProfile = () => {
    navigate(userRole === "Candidate" ? "/candidate/profile" : "/examiner/profile");
    setProfileOpen(false);
  };

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    if (newMode) {
      document.body.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      document.body.style.filter = "none";
    }
  };

  const handleLogout = () => {
    logout();
    if (onLogoutCallback) onLogoutCallback();
    navigate("/login");
  };

  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 12px", borderRadius:10, transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", border:"none", background: profileOpen ? `${C.blue}08` : "transparent", boxShadow: profileOpen ? `0 4px 12px ${C.blue}26` : `0 2px 8px rgba(0, 0, 0, 0.04)` }}
        onMouseEnter={(e) => {
          if (!profileOpen) {
            e.currentTarget.style.background = `${C.blue}04`;
            e.currentTarget.style.boxShadow = `0 4px 12px ${C.blue}15`;
          }
        }}
        onMouseLeave={(e) => {
          if (!profileOpen) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.04)`;
          }
        }}
      >
        <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg, ${userRole === "Candidate" ? C.blue : C.orange}, ${userRole === "Candidate" ? C.blue : C.orange}dd)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow: `0 3px 12px ${userRole === "Candidate" ? C.blue : C.orange}44, inset 0 1px 2px rgba(255,255,255,0.4)`, position:"relative", overflow:"hidden" }}>
          <span style={{ fontSize:16, fontWeight:900, color:"white", letterSpacing:"-0.5px" }}>{getInitials(userName)}</span>
          <div style={{ position:"absolute", bottom:-2, right:-2, width:14, height:14, borderRadius:"50%", background:"#10b981", border:`2px solid white`, boxShadow:"0 2px 4px rgba(0,0,0,0.2)" }}></div>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>{userName}</div>
          <div style={{ fontSize:10, color:C.muted }}>{userRole}</div>
        </div>
      </button>

      {profileOpen && (
        <div style={{
          position:"absolute",
          top:"100%",
          right:0,
          marginTop:8,
          width:220,
          borderRadius:14,
          background:C.card,
          border:`1px solid ${C.border}`,
          boxShadow:"0 16px 48px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.04)",
          zIndex:1000,
          overflow:"hidden",
          animation:"fadeIn 0.2s ease-out"
        }}>
          <div style={{ padding:"14px 16px", background:`linear-gradient(135deg, ${C.navy}06, ${C.blue}03)`, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg, ${userRole === "Candidate" ? C.blue : C.orange}, ${userRole === "Candidate" ? C.blue : C.orange}dd)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow: `0 2px 8px ${userRole === "Candidate" ? C.blue : C.orange}44, inset 0 1px 2px rgba(255,255,255,0.4)`, position:"relative" }}>
              <span style={{ fontSize:14, fontWeight:900, color:"white", letterSpacing:"-0.5px" }}>{getInitials(userName)}</span>
              <div style={{ position:"absolute", bottom:-1, right:-1, width:12, height:12, borderRadius:"50%", background:"#10b981", border:`1.5px solid white` }}></div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:1 }}>{userName}</div>
              <div style={{ fontSize:10, color:C.muted }}>{userRole}</div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column" }}>
            <button
              onClick={handleEditProfile}
              style={{
                width:"100%",
                padding:"11px 16px",
                border:"none",
                background:"none",
                cursor:"pointer",
                fontSize:13,
                fontWeight:600,
                color:C.navy,
                textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                borderBottom:`1px solid ${C.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.altBg;
                e.currentTarget.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.paddingLeft = "16px";
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>{getProfileIcon('profile')} Edit Profile</div>
            </button>
            {/* Dark Mode Toggle - Disabled for now */}
            {/* 
            <button
              onClick={handleThemeToggle}
              style={{
                width:"100%",
                padding:"11px 16px",
                border:"none",
                background:"none",
                cursor:"pointer",
                fontSize:13,
                fontWeight:600,
                color:C.navy,
                textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                borderBottom:`1px solid ${C.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.altBg;
                e.currentTarget.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.paddingLeft = "16px";
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>{isDarkMode ? getProfileIcon('sun') : getProfileIcon('moon')} {isDarkMode ? "Light Mode" : "Dark Mode"}</div>
            </button>
            */}
            <button
              onClick={() => { navigate("/help"); setProfileOpen(false); }}
              style={{
                width:"100%",
                padding:"11px 16px",
                border:"none",
                background:"none",
                cursor:"pointer",
                fontSize:13,
                fontWeight:600,
                color:C.navy,
                textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                borderBottom:`1px solid ${C.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.altBg;
                e.currentTarget.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.paddingLeft = "16px";
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>{getProfileIcon('help')} Help & Support</div>
            </button>
            <button
              onClick={handleLogout}
              style={{
                width:"100%",
                padding:"11px 16px",
                border:"none",
                background:"none",
                cursor:"pointer",
                fontSize:13,
                fontWeight:700,
                color:C.red,
                textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${C.red}08`;
                e.currentTarget.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.paddingLeft = "16px";
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>{getProfileIcon('logout')} Logout</div>
            </button>
          </div>
        </div>
      )}

      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position:"fixed",
            top:0,
            left:0,
            right:0,
            bottom:0,
            zIndex:999,
          }}
        />
      )}
    </div>
  );
}

export default ProfileDropdown;
