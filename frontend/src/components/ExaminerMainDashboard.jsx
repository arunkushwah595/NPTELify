// ExaminerMainDashboard.jsx
import { useState, useEffect } from "react";
import { getMyQuizzes, deleteQuiz, downloadQuizReportPdf } from "../api/quizApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { notificationStore } from "../utils/notificationStore";

// CSS for pulse animation
const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

const C = {
  navy:"#1a3a6b",blue:"#2563eb",orange:"#f97316",green:"#16a34a",red:"#dc2626",purple:"#7c3aed",
  bg:"#f5f8ff",card:"#ffffff",altBg:"#eaf0fb",border:"#dce8fb",muted:"#7a8faf",body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

const SUBJ_COLORS = {
  default: { bg:C.altBg, color:C.navy },
};
function subjectColor(subject) {
  const palette = [
    { bg:"#eaf0fb", color:C.blue },
    { bg:"#fff3ee", color:C.orange },
    { bg:"#f0fdf4", color:C.green },
    { bg:"#fdf4ff", color:"#9333ea" },
    { bg:"#fff7ed", color:"#ea580c" },
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function Badge({ subject }) {
  const s = subjectColor(subject);
  return <span style={{ padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:s.bg,color:s.color }}>{subject}</span>;
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:C.card,borderRadius:16,padding:"18px 20px",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:14,flex:1,minWidth:0 }}>
      <div style={{ width:44,height:44,borderRadius:12,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:24,fontWeight:900,color,lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{label}</div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onRefresh, quizType = "upcoming" }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const durationLabel = `${quiz.durationMinutes} min`;
  const qCount = quiz.questions?.length || 0;
  
  // Format scheduled date/time for display
  let dateStr = "—";
  let timeStr = "";
  if (quiz.scheduledDateTime) {
    const scheduled = new Date(quiz.scheduledDateTime);
    dateStr = scheduled.toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });
    timeStr = scheduled.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  }
  
  const attemptCount = quiz.attemptCount || 0;
  
  const handleEdit = () => {
    navigate(`/examiner/create?editId=${quiz.id}`);
  };
  
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteQuiz(quiz.id);
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
      setDeleting(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete quiz: " + (error.message || "Unknown error"));
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };
  
  const handleReview = () => {
    navigate(`/examiner/results?quizId=${quiz.id}`);
  };
  
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadQuizReportPdf(quiz.id);
      setDownloading(false);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF: " + (error.message || "Unknown error"));
      setDownloading(false);
    }
  };
  
  return (
    <>
      <div style={{ padding:"13px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.bg }}>
        <div style={{ display:"flex",justifyContent:"space-between",gap:8,marginBottom:7 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.navy,lineHeight:1.35 }}>{quiz.title}</div>
          <span style={{ padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:"#fff3ee",color:C.orange,whiteSpace:"nowrap",flexShrink:0 }}>{durationLabel}</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:10 }}>
          <Badge subject={quiz.subject} />
          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1 }}>
            <span style={{ fontSize:11,fontWeight:600,color:C.blue }}>{dateStr}</span>
            <span style={{ fontSize:10,color:C.muted }}>⏰ {timeStr}</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`,marginBottom:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <span style={{ fontSize:12,fontWeight:700,color:C.purple }}>👥 {attemptCount}</span>
              <span style={{ fontSize:10,color:C.muted }}>attempt{attemptCount !== 1 ? "s" : ""}</span>
            </div>
            <span style={{ fontSize:11,fontWeight:700,color:C.blue }}>📝 {qCount} Qs</span>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
          {quizType === "upcoming" && (
            <>
              <button onClick={handleEdit} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,border:"1.5px solid "+C.blue,background:"transparent",color:C.blue,cursor:"pointer",transition:"all 0.2s" }}>
                ✎ Edit
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,border:"1.5px solid "+C.red,background:"transparent",color:C.red,cursor:"pointer",transition:"all 0.2s" }}>
                🗑 Delete
              </button>
            </>
          )}
          {quizType === "past" && (
            <>
              <button onClick={handleReview} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,border:"1.5px solid "+C.blue,background:"transparent",color:C.blue,cursor:"pointer",transition:"all 0.2s" }}>
                📊 Review
              </button>
              <button onClick={handleDownloadPdf} disabled={downloading} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,border:"1.5px solid "+C.green,background:"transparent",color:C.green,cursor:downloading?"not-allowed":"pointer",transition:"all 0.2s",opacity:downloading?0.6:1 }}>
                {downloading ? "⏳ Generating..." : "📥 PDF"}
              </button>
            </>
          )}
          {quizType === "live" && (
            <div style={{ fontSize:12,color:C.muted,fontStyle:"italic" }}>Quiz in progress</div>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div style={{ background:C.card,borderRadius:16,padding:"24px",maxWidth:400,boxShadow:"0 10px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize:16,fontWeight:700,color:C.navy,marginBottom:8 }}>Delete Quiz?</div>
            <div style={{ fontSize:14,color:C.body,marginBottom:20 }}>
              Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"flex-end" }}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} style={{ padding:"8px 16px",fontSize:13,fontWeight:600,borderRadius:8,border:`1.5px solid ${C.border}`,background:C.bg,color:C.navy,cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding:"8px 16px",fontSize:13,fontWeight:600,borderRadius:8,border:`1.5px solid ${C.red}`,background:C.red,color:"white",cursor:"pointer",opacity:deleting?0.7:1 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",color:C.muted,fontSize:14 }}>
      Loading quizzes…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{ padding:"16px",borderRadius:12,background:"#fef2f2",border:`1.5px solid #fca5a5`,color:"#991b1b",fontSize:13 }}>
      {message}
    </div>
  );
}

export default function ExaminerMainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const loadQuizzes = () => {
    getMyQuizzes()
      .then(data => {
        setQuizzes(data);
        setLoading(false);

        // Check for quizzes that are live or have just ended and trigger notifications
        const now = new Date();
        data.forEach(quiz => {
          if (quiz.scheduledDateTime) {
            const scheduled = new Date(quiz.scheduledDateTime);
            const endTime = new Date(scheduled.getTime() + quiz.durationMinutes * 60 * 1000);
            const timeUntilStart = scheduled.getTime() - now.getTime();
            const timeUntilEnd = endTime.getTime() - now.getTime();
            const oneHour = 60 * 60 * 1000;

            // Notify if quiz just started (within first 5 minutes)
            if (scheduled <= now && now < endTime && timeUntilStart > -5 * 60 * 1000) {
              notificationStore.notifyQuizStartedExaminer(quiz.title);
            }
            // Notify if quiz is ending within the hour
            else if (timeUntilEnd <= oneHour && timeUntilEnd > 0) {
              // Notify at different thresholds can be added here
            }
          }
        });
      })
      .catch(e  => { setError(e.message); setLoading(false); });
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const totalQuestions = quizzes.reduce((a, q) => a + (q.questions?.length || 0), 0);
  
  // Categorize quizzes by scheduledDateTime and duration
  const now = new Date();
  const past = quizzes.filter(q => {
    if (!q.scheduledDateTime) return false;
    const scheduled = new Date(q.scheduledDateTime);
    const endTime = new Date(scheduled.getTime() + q.durationMinutes * 60 * 1000);
    return now >= endTime; // Quiz has ended
  });
  
  const live = quizzes.filter(q => {
    if (!q.scheduledDateTime) return false;
    const scheduled = new Date(q.scheduledDateTime);
    const endTime = new Date(scheduled.getTime() + q.durationMinutes * 60 * 1000);
    return scheduled <= now && now < endTime; // Quiz is currently active
  });
  
  const upcoming = quizzes.filter(q => {
    if (!q.scheduledDateTime) return false;
    const scheduled = new Date(q.scheduledDateTime);
    return scheduled > now; // Quiz hasn't started yet
  });

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,fontFamily:C.font }}>
      <style>{pulseStyle}</style>

      {/* Hero Banner */}
      <div style={{ borderRadius:18,padding:"24px 32px",background:C.navy,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-40,right:-40,width:220,height:220,borderRadius:"50%",background:C.orange,opacity:.1 }}/>
        <div style={{ position:"absolute",bottom:-50,left:180,width:160,height:160,borderRadius:"50%",background:C.blue,opacity:.15 }}/>
        <div style={{ position:"absolute",top:10,right:220,width:100,height:100,borderRadius:"50%",background:C.purple,opacity:.12 }}/>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:11,color:"#a8c0e0",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6 }}>Examiner Portal</div>
          <div style={{ fontSize:24,fontWeight:900,color:"#fff",marginBottom:4 }}>Welcome back, {user?.name || "Examiner"}! 🎓</div>
          <div style={{ fontSize:14,color:"#a8c0e0" }}>
            You have <span style={{ color:C.orange,fontWeight:700 }}>{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} created</span> in total.
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
        <StatCard icon="📋" label="Total Quizzes Created"  value={quizzes.length} color={C.blue} />
        <StatCard icon="📝" label="Total Questions"        value={totalQuestions}  color={C.purple} />
        <StatCard icon="⏳" label="Upcoming Quizzes"       value={upcoming.length}  color={C.green} />
        <StatCard icon="🔴" label="Past Quizzes"           value={past.length}     color={C.orange} />
      </div>

      {/* Three-column */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18 }}>

        {/* Upcoming */}
        <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"20px" }}>
          <div style={{ fontSize:14,fontWeight:800,color:C.navy,marginBottom:14,display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:C.green,display:"inline-block" }}/>
            ⏳ Upcoming Quizzes
          </div>
          {loading ? <LoadingState/> : error ? <ErrorState message={error}/> : upcoming.length === 0 ? (
            <div style={{ fontSize:13,color:C.muted,padding:"12px 0" }}>No upcoming quizzes scheduled.</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:10,maxHeight:420,overflowY:"auto" }}>
              {upcoming.map(q => <QuizCard key={q.id} quiz={q} onRefresh={loadQuizzes} quizType="upcoming"/>)}
            </div>
          )}
        </div>

        {/* Live */}
        <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"20px" }}>
          <div style={{ fontSize:14,fontWeight:800,color:C.navy,marginBottom:14,display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:"#dc2626",display:"inline-block",animation:"pulse 1s infinite" }}/>
            🔴 Live Quizzes
          </div>
          {loading ? <LoadingState/> : error ? <ErrorState message={error}/> : live.length === 0 ? (
            <div style={{ fontSize:13,color:C.muted,padding:"12px 0" }}>No live quizzes at the moment.</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:10,maxHeight:420,overflowY:"auto" }}>
              {live.map(q => <QuizCard key={q.id} quiz={q} onRefresh={loadQuizzes} quizType="live"/>)}
            </div>
          )}
        </div>

        {/* Past */}
        <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"20px" }}>
          <div style={{ fontSize:14,fontWeight:800,color:C.navy,marginBottom:14,display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:C.orange,display:"inline-block" }}/>
            🔙 Past Quizzes
          </div>
          {loading ? <LoadingState/> : error ? <ErrorState message={error}/> : past.length === 0 ? (
            <div style={{ fontSize:13,color:C.muted,padding:"12px 0" }}>No past quizzes yet.</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:10,maxHeight:420,overflowY:"auto" }}>
              {past.map(q => <QuizCard key={q.id} quiz={q} onRefresh={loadQuizzes} quizType="past"/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}