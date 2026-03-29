import { useState, useEffect } from "react";
import ResultsDashboardPage from "../components/ResultDashboardPage";
import ProgressDashboardPage from "../components/ProgressDashboardPage";
import SolutionDashboardPage from "../components/SolutionDashboardPage";
import MainDashboardPage from "../components/MainDashboardPage";
import NotificationCenter from "../components/NotificationCenter";
import ProfileDropdown from "../components/ProfileDropdown";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const C = {
  navy: "#1a3a6b", blue: "#2563eb", orange: "#f97316", red: "#dc2626",
  bg: "#f5f8ff", card: "#ffffff", altBg: "#eaf0fb",
  border: "#dce8fb", muted: "#7a8faf", body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

const getProfileIcon = (type) => {
  const icons = {
    profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>,
    moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    help: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
    info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  };
  return icons[type] || icons.profile;
};

const NAV = [
  {
    id: "main", label: "Main Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18,height:18 }}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: "results", label: "Results Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18,height:18 }}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  },
  {
    id: "progress", label: "Progress Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18,height:18 }}><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>,
  },
  {
    id: "solutions", label: "Solution Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18,height:18 }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
];

function Logo({ onClick }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <img
                src="/logo_half.png"
                alt="logo"
                style={{
                    width: 36,
                    height: 36,
                    objectFit: "contain"
                }}
                />
            <span style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.5px" }}>
              <span style={{ color:"#1a3a6b" }}>NPTEL</span><span style={{ color:"#f97316" }}>ify</span>
            </span>
          </div>
    </button>
  );
}

function Sidebar({ active, onSelect, auth, navigate }) {
  const [hovId, setHovId] = useState(null);
  const userName = auth?.user?.name || "User";
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <aside style={{ width:238, background:C.card, borderRight:`1.5px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, fontFamily:C.font }}>
      {/* Logo + avatar */}
      <div style={{ padding:"20px 20px 16px", borderBottom:`1.5px solid ${C.border}` }}>
        <Logo onClick={() => navigate("/candidate/dashboard")} />
        <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg, ${C.blue}, ${C.blue}dd)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow: `0 3px 12px ${C.blue}44, inset 0 1px 2px rgba(255,255,255,0.4)`, position:"relative" }}>
            <span style={{ fontSize:18, fontWeight:900, color:"white", letterSpacing:"-0.5px" }}>{getInitials(userName)}</span>
            <div style={{ position:"absolute", bottom:-2, right:-2, width:14, height:14, borderRadius:"50%", background:"#10b981", border:`2px solid white`, boxShadow:"0 2px 4px rgba(0,0,0,0.2)" }}></div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>{userName}</div>
            <div style={{ fontSize:11, color:C.muted }}>Candidate</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ padding:"12px", flex:1, display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontSize:10, fontWeight:800, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"6px 14px 4px" }}>Menu</div>
        {NAV.map(item => {
          const isActive = active === item.id;
          const isHov    = hovId === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              onMouseEnter={() => setHovId(item.id)}
              onMouseLeave={() => setHovId(null)}
              style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 14px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", width:"100%", fontFamily:C.font, fontSize:13, fontWeight: isActive ? 700 : 500, transition:"all 0.15s",
                background: isActive ? C.altBg : isHov ? "#f8faff" : "transparent",
                color: isActive ? C.blue : isHov ? C.navy : C.body,
                borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
              }}>
              <span style={{ color: isActive ? C.blue : isHov ? C.navy : C.muted, flexShrink:0 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
      {/* Logout */}
      <div style={{ padding:"14px 20px", borderTop:`2px solid ${C.border}` }}>
        <button
            onClick={() => { auth.logout(); navigate("/login"); }}
            style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 900,
            color: C.red
            }}
        >
            <div
            style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.red}
                strokeWidth="2"
                style={{ width: 14, height: 14 }}
            >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            </div>

            <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ activePage, userName, onLogout, navigate, showCalendar, onToggleCalendar }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const titles = { main:"Main Dashboard", results:"Results Dashboard", progress:"Progress Dashboard", solutions:"Solution Dashboard" };
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) + ", " +
    now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/candidate/profile");
    setProfileOpen(false);
  };

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    // Apply theme to document
    if (newMode) {
      document.body.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      document.body.style.filter = "none";
    }
  };

  return (
    <header style={{ height:60, background:C.card, borderBottom:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0, fontFamily:C.font }}>
      <div>
        <span style={{ fontSize:15, fontWeight:800, color:C.navy }}>{titles[activePage]}</span>
        <span style={{ fontSize:12, color:C.muted, marginLeft:14 }}>{dateStr}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button
          onClick={onToggleCalendar}
          style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            width:36,
            height:36,
            border:"none",
            background:"transparent",
            cursor:"pointer",
            borderRadius:8,
            transition:"all 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = C.altBg}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          title={showCalendar ? "Hide Calendar" : "Show Calendar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" style={{ width:20, height:20 }}>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{ width:1, height:24, background:C.border }}></div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <NotificationCenter/>
          <ProfileDropdown C={C} userName={userName} userRole="Candidate" />
        </div>
      </div>
      
    </header>
  );
}

function CalendarPanel() {
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const now   = new Date();
  const year  = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const today = now.getDate();
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS   = ["M","T","W","T","F","S","S"];

  // Month navigation handlers
  const goToPreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  // Days in month, first day offset (Mon=0)
  const dim    = new Date(year, month+1, 0).getDate();
  const first  = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells  = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const isCurrentMonth = (now.getFullYear() === year && now.getMonth() === month);

  // Fetch upcoming and past quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [upcomingData, pastData] = await Promise.all([
          fetch(`/api/quizzes/upcoming/all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }).then(r => r.json()),
          fetch(`/api/quizzes/past/all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }).then(r => r.json())
        ]);
        
        setUpcomingQuizzes(upcomingData || []);
        setPastQuizzes(pastData || []);
      } catch (e) {
        console.error("Failed to fetch quizzes:", e);
        setUpcomingQuizzes([]);
        setPastQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const allQuizzes = showPast ? pastQuizzes : upcomingQuizzes;

  const quizDatesThisMonth = allQuizzes
    .filter(q => {
      const qDate = new Date(q.scheduledDateTime);
      return qDate.getFullYear() === year && qDate.getMonth() === month;
    })
    .map(q => new Date(q.scheduledDateTime).getDate());

  const getQuizzesForDate = (day) => {
    return allQuizzes.filter(q => {
      const qDate = new Date(q.scheduledDateTime);
      return qDate.getDate() === day && qDate.getMonth() === month && qDate.getFullYear() === year;
    });
  };

  const examDates = [...new Set(quizDatesThisMonth)];
  const colorMap = [C.blue, C.orange, "#16a34a", "#dc2626", "#9333ea", "#06b6d4"];

  return (
    <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:12, fontFamily:C.font }}>
      {/* Calendar */}
      <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px 14px" }}>
        {/* Month Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, gap:8 }}>
          <button onClick={goToPreviousMonth} style={{ padding:"4px 8px", fontSize:11, fontWeight:700, borderRadius:6, border:`1px solid ${C.border}`, background:C.bg, color:C.navy, cursor:"pointer", transition:"all 0.2s" }}>←</button>
          <div style={{ display:"flex", justifyContent:"center", gap:6, flex:1 }}>
            <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>{MONTHS[month]}</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>{year}</span>
          </div>
          <button onClick={goToNextMonth} style={{ padding:"4px 8px", fontSize:11, fontWeight:700, borderRadius:6, border:`1px solid ${C.border}`, background:C.bg, color:C.navy, cursor:"pointer", transition:"all 0.2s" }}>→</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:6 }}>
          {DAYS.map((d,i) => <div key={i} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:C.muted, padding:"3px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((d,i) => {
            if (!d) return <div key={i}/>;
            const isToday = isCurrentMonth && d === today;
            const isExam  = examDates.includes(d);
            const markerColor = showPast ? "#9ca3af" : C.orange;
            return (
              <div key={i} onClick={() => isExam && setSelectedDate(d)}
                style={{ textAlign:"center", padding:"4px 0", borderRadius:6, fontSize:11, fontWeight:isToday?900:isExam?700:400,
                  background: isToday ? C.blue : isExam ? `rgba(107, 114, 128, 0.1)` : "transparent",
                  color: isToday ? "#fff" : isExam ? markerColor : C.body,
                  cursor: isExam ? "pointer" : "default", 
                  position:"relative", border: selectedDate === d ? `2px solid ${markerColor}` : "none"
                }}>
                {d}
                {isExam && !isToday && <div style={{ width:4, height:4, borderRadius:"50%", background:markerColor, margin:"0 auto", marginTop:1 }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle Past/Upcoming */}
      <div style={{ display:"flex", gap:6, background:C.bg, borderRadius:10, padding:4 }}>
        <button onClick={() => { setShowPast(false); setSelectedDate(null); }}
          style={{ flex:1, padding:"6px 10px", borderRadius:8, border:"none", background:!showPast?C.blue:"transparent", color:!showPast?"#fff":C.body, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>
          Upcoming
        </button>
        <button onClick={() => { setShowPast(true); setSelectedDate(null); }}
          style={{ flex:1, padding:"6px 10px", borderRadius:8, border:"none", background:showPast?C.blue:"transparent", color:showPast?"#fff":C.body, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>
          Past
        </button>
      </div>

      {/* Quizzes list */}
      <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:"14px" }}>
        <div style={{ fontSize:12, fontWeight:800, color:C.navy, marginBottom:10 }}>
          {selectedDate ? `${showPast?"Past":"Upcoming"} on ${selectedDate} ${MONTHS[month]}` : (showPast?"Past Quizzes":"Upcoming Exams")}
        </div>
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} 
            style={{ fontSize:10, color:C.blue, background:"none", border:"none", cursor:"pointer", marginBottom:8, fontWeight:600 }}>
            ← Back to all
          </button>
        )}
        <div style={{ maxHeight:230, overflowY:"auto" }}>
          {loading ? (
            <div style={{ fontSize:11, color:C.muted, padding:"8px" }}>Loading...</div>
          ) : (
            (selectedDate ? getQuizzesForDate(selectedDate) : allQuizzes.filter(q => {
              const qDate = new Date(q.scheduledDateTime);
              return qDate.getFullYear() === year && qDate.getMonth() === month;
            }).slice(0, 5)).map((q, i) => {
              const qDate = new Date(q.scheduledDateTime);
              const dateStr = qDate.toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });
              const timeStr = qDate.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
              const color = showPast ? "#9ca3af" : colorMap[i % colorMap.length];
              return (
                <div key={q.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, padding:"8px 10px", borderRadius:10, background:showPast?C.altBg:C.bg, border:`1px solid ${C.border}` }}>
                  <div style={{ width:4, height:50, borderRadius:2, background:color, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:showPast?C.muted:C.navy, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{q.title}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:C.blue, marginBottom:2 }}>{dateStr}</div>
                    <div style={{ fontSize:9, color:C.muted }}>⏰ {timeStr}</div>
                  </div>
                </div>
              );
            })
          )}
          {!loading && allQuizzes.filter(q => {
            const qDate = new Date(q.scheduledDateTime);
            return qDate.getFullYear() === year && qDate.getMonth() === month;
          }).length === 0 && (
            <div style={{ fontSize:11, color:C.muted, padding:"8px", textAlign:"center" }}>No {showPast?"past":"upcoming"} quizzes</div>
          )}
        </div>
      </div>

    </div>
  );
}

const PAGES = {
  main:      <MainDashboardPage/>,
  results:   <ResultsDashboardPage/>,
  progress:  <ProgressDashboardPage/>,
  solutions: <SolutionDashboardPage/>,
};

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = { user, logout };
  const [showCalendar, setShowCalendar] = useState(true);

  const pathToPage = {
    "/candidate/dashboard": "main",
    "/candidate/results":   "results",
    "/candidate/progress":  "progress",
    "/candidate/solutions": "solutions",
  };
  const active = pathToPage[location.pathname] || "main";

  const handleSelect = (id) => {
    if (id === "main") navigate("/candidate/dashboard");
    else navigate(`/candidate/${id}`);
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:C.font, overflow:"hidden" }}>
      <Sidebar active={active} onSelect={handleSelect} auth={auth} navigate={navigate}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <Topbar activePage={active} userName={user?.name || "User"} onLogout={logout} navigate={navigate} showCalendar={showCalendar} onToggleCalendar={() => setShowCalendar(!showCalendar)}/>
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          <main style={{ flex:1, overflow:"auto", padding:"24px 28px" }}>
            {PAGES[active]}
          </main>
        
          {showCalendar && (
            <div style={{ padding:"20px 16px 20px 0", overflowY:"auto", flexShrink:0 }}>
              <CalendarPanel/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
