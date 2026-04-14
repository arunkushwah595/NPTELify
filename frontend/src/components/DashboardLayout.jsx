// DashboardLayout.jsx — Shared header and sidebar for all examiner pages
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyUpcomingQuizzes, getMyPastQuizzes, getUpcomingQuizzes, getPastQuizzes } from "../api/quizApi";
import NotificationCenter from "./NotificationCenter";
import ProfileDropdown from "./ProfileDropdown";
import ExaminerSidebar from "./ExaminerSidebar";

// Add style for fadeIn animation
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const C = {
  navy:   "#1a3a6b",
  blue:   "#2563eb",
  orange: "#f97316",
  green:  "#16a34a",
  red:    "#dc2626",
  purple: "#7c3aed",
  bg:     "#f0f4f8",
  card:   "#ffffff",
  altBg:  "#eaf0fb",
  border: "#dce8fb",
  muted:  "#7a8faf",
  body:   "#4a6490",
  sidebar:"#ffffff",
  font:   "'DM Sans','Segoe UI',sans-serif",
};

const NAV = [
  { id:"main",           label:"Main Dashboard",       icon:"home" },
  { id:"create",         label:"Create Quiz",          icon:"pencil" },
  { id:"results",        label:"Results Dashboard",    icon:"chart" },
  { id:"progress",       label:"Progress Dashboard",   icon:"trending" },
  { id:"question-bank",  label:"Question Bank",        icon:"book" },
];

/* Icon SVG Renderer */
function getNavIcon(iconType, color = C.body) {
  const iconMap = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h3v-5h4v5h3a1 1 0 001-1v-9"/></svg>,
    pencil: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M17 3a2.828 2.828 0 115.656 0L5 21H3v-2L17 3z"/></svg>,
    chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M3 3v18h18M3 18l4-5 4 3 5-7 5 3"/></svg>,
    trending: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 7H20v10a2 2 0 01-2 2H6.5a2 2 0 01-2-2V4.5z"/></svg>
  };
  return iconMap[iconType] || iconMap.home;
}

function getProfileIcon(type) {
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
}

function CalendarPanel() {
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const role = localStorage.getItem("role");

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
  const first  = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-based
  const cells  = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const isCurrentMonth = (now.getFullYear() === year && now.getMonth() === month);

  // Fetch upcoming and past quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [upcomingData, pastData] = await Promise.all([
          role === "EXAMINER" ? getMyUpcomingQuizzes() : getUpcomingQuizzes(),
          role === "EXAMINER" ? getMyPastQuizzes() : getPastQuizzes()
        ]);
        
        setUpcomingQuizzes(Array.isArray(upcomingData) ? upcomingData : []);
        setPastQuizzes(Array.isArray(pastData) ? pastData : []);
      } catch (e) {
        console.error("[DashboardLayout] Failed to fetch quizzes:", e);
        setUpcomingQuizzes([]);
        setPastQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [role]);

  // Use either upcoming or past quizzes based on toggle
  const allQuizzes = showPast ? pastQuizzes : upcomingQuizzes;

  // Extract dates with quizzes for the selected month
  const quizDatesThisMonth = allQuizzes
    .filter(q => {
      const qDate = new Date(q.scheduledDateTime);
      return qDate.getFullYear() === year && qDate.getMonth() === month;
    })
    .map(q => new Date(q.scheduledDateTime).getDate());

  // Get quizzes for selected date in selected month
  const getQuizzesForDate = (day) => {
    return allQuizzes.filter(q => {
      const qDate = new Date(q.scheduledDateTime);
      return qDate.getDate() === day && qDate.getMonth() === month && qDate.getFullYear() === year;
    });
  };

  // Get unique dates with quizzes
  const examDates = [...new Set(quizDatesThisMonth)];

  // Color mapping for quizzes
  const colorMap = [C.blue, C.orange, C.green, C.red, "#9333ea", "#06b6d4"];

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

function Topbar({ pageTitle, userName, showCalendar, onToggleCalendar }) {
  return (
    <div style={{ height:52, background:C.card, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0, fontFamily:C.font }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:15, fontWeight:800, color:C.navy }}>{pageTitle}</span>
        {onToggleCalendar && (
          <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:"3px 10px", borderRadius:999, border:`1px solid ${C.border}` }}>
            {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) + ", " +
             new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}
          </span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {onToggleCalendar && (
          <button
            onClick={onToggleCalendar}
            title={showCalendar ? "Hide Calendar" : "Show Calendar"}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: showCalendar ? `linear-gradient(135deg, ${C.blue}, ${C.blue}dd)` : `linear-gradient(135deg, ${C.altBg}, ${C.bg})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: `2px solid ${showCalendar ? C.blue : C.border}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: showCalendar 
                ? `0 4px 12px ${C.blue}33, inset 0 1px 0 rgba(255,255,255,0.2)` 
                : `0 2px 8px rgba(0, 0, 0, 0.08)`,
              color: showCalendar ? "#fff" : C.blue,
            }}
            onMouseEnter={(e) => {
              if (!showCalendar) {
                e.currentTarget.style.boxShadow = `0 4px 16px ${C.blue}26, inset 0 1px 0 rgba(255,255,255,0.2)`;
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!showCalendar) {
                e.currentTarget.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.08)`;
                e.currentTarget.style.transform = "scale(1)";
              }
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18, height:18 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        )}
        <div style={{ width:1, height:24, background:C.border }}></div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <NotificationCenter/>
          <ProfileDropdown C={C} userName={userName} userRole="Examiner" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ pageTitle, children, disableCalendar = false, activeNav = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || "Examiner";
  const [showCalendar, setShowCalendar] = useState(() => {
    // Load from localStorage on initial mount
    const stored = localStorage.getItem("calendarVisible");
    return stored !== null ? JSON.parse(stored) : true;
  });

  // Persist to localStorage whenever showCalendar changes
  useEffect(() => {
    localStorage.setItem("calendarVisible", JSON.stringify(showCalendar));
  }, [showCalendar]);

  const handleSelect = (id) => {
    if (id === "main") navigate("/examiner");
    else navigate(`/examiner/${id}`);
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:C.font, overflow:"hidden" }}>
      <style>{styles}</style>
      <ExaminerSidebar active={activeNav} onSelect={handleSelect} userName={userName} onLogout={logout}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <Topbar pageTitle={pageTitle} userName={userName} showCalendar={showCalendar && !disableCalendar} onToggleCalendar={() => setShowCalendar(!showCalendar)}/>
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {/* Main scrollable area */}
          <main style={{ flex:1, overflow:"auto", padding:"20px 22px" }}>
            {children}
          </main>
          {/* Calendar panel */}
          {!disableCalendar && showCalendar && (
            <div style={{ padding:"20px 16px 20px 0", overflowY:"auto", flexShrink:0 }}>
              <CalendarPanel/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
