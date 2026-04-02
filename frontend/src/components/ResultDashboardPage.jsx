import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyAttempts, downloadAttemptPdf, getQuizById } from "../api/quizApi";

const C = {
  navy: "#1a3a6b", blue: "#2563eb", orange: "#f97316",
  bg: "#f5f8ff", card: "#ffffff", altBg: "#eaf0fb",
  border: "#dce8fb", muted: "#7a8faf", body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

const PALETTE = [C.blue, C.orange, "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#be185d"];

const getDashboardResultIcon = (type) => {
  const icons = {
    document: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M4 7v12a2 2 0 002 2h12a2 2 0 002-2V7M9 7h6M9 11h6M9 15h2M4 7h16M9 3h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"/></svg>,
    chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M3 3v18h18M3 18l4-5 4 3 5-7 5 3"/></svg>,
    checkmark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4l-8.97 9.97-4.22-3.604"/></svg>,
    trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M6 9H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2v-9a2 2 0 00-2-2h-2M6 5h12M9 5a3 3 0 016 0M9 5a3 3 0 011 2.83V9M15 5a3 3 0 00-1 2.83V9M12 12v3"/></svg>,
    download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return icons[type] || icons.document;
};

function DonutChart({ data, avgPct }) {
  const total = data.reduce((s,d) => s+d.value, 0) || 1;
  const r=70, cx=100, cy=100, sw=28, circ=2*Math.PI*r;
  let offset=0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((d,i) => {
          const dash=(d.value/total)*circ, gap=circ-dash;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} style={{ transform:"rotate(-90deg)", transformOrigin:"100px 100px" }}/>;
          offset+=dash; return el;
        })}
        <text x="100" y="96" textAnchor="middle" style={{ fontSize:22, fontWeight:900, fill:C.navy, fontFamily:C.font }}>{avgPct}%</text>
        <text x="100" y="112" textAnchor="middle" style={{ fontSize:11, fill:C.muted, fontFamily:C.font }}>Avg Score</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {data.map((d,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:C.body, flex:1 }}>{d.label}</span>
            <span style={{ fontSize:12, fontWeight:800, color:C.navy }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartSVG({ bars }) {
  const W=320,H=140,padL=28,padB=24,barW=34,gap=10,maxV=100;
  const sy = v => H-padB-(v/maxV)*(H-padB-10);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      {[0,25,50,75,100].map(v=>(
        <g key={v}>
          <line x1={padL} y1={sy(v)} x2={W} y2={sy(v)} stroke={C.border} strokeWidth="1" strokeDasharray="3 3"/>
          <text x={padL-4} y={sy(v)+4} textAnchor="end" style={{ fontSize:9, fill:C.muted, fontFamily:C.font }}>{v}</text>
        </g>
      ))}
      {bars.map((b,i)=>{
        const x=padL+i*(barW+gap), y=sy(b.score), bH=H-padB-y;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bH} rx={6} fill={C.blue} opacity={0.85}/>
            <text x={x+barW/2} y={y-5} textAnchor="middle" style={{ fontSize:9, fontWeight:700, fill:C.navy, fontFamily:C.font }}>{b.score}%</text>
            <text x={x+barW/2} y={H-6} textAnchor="middle" style={{ fontSize:9, fill:C.muted, fontFamily:C.font }}>{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ResultsDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // For month navigation
  const [downloadingId, setDownloadingId] = useState(null);
  const [quiz, setQuiz] = useState(null); // Store quiz data for end time validation
  const [quizEnded, setQuizEnded] = useState(false); // Track if quiz has ended

  // Check if quiz has ended
  useEffect(() => {
    if (!quizId) {
      setQuizEnded(true); // Show all attempts if no specific quiz
      return;
    }

    getQuizById(parseInt(quizId))
      .then(q => {
        setQuiz(q);
        const now = new Date();
        const scheduled = new Date(q.scheduledDateTime);

        // Determine end time based on scheduling mode
        let endTime;
        if (q.schedulingMode === "WINDOW" && q.windowEndDateTime) {
          endTime = new Date(q.windowEndDateTime);
        } else {
          endTime = new Date(scheduled.getTime() + q.durationMinutes * 60 * 1000);
        }

        // Quiz has ended if current time >= end time
        setQuizEnded(now >= endTime);
      })
      .catch(e => console.warn("Could not validate quiz end time:", e));
  }, [quizId]);

  useEffect(() => {
    getMyAttempts()
      .then(data => {
        // Filter by quizId if provided
        const filtered = quizId ? data.filter(a => a.quizId === parseInt(quizId)) : data;
        setAttempts(filtered);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [quizId]);

  // Inject spin animation
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('result-dashboard-spin-styles')) {
      const style = document.createElement('style');
      style.id = 'result-dashboard-spin-styles';
      style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  }, []);

  // Month navigation handlers
  const goToPreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const handleDownloadPdf = async (attemptId) => {
    setDownloadingId(attemptId);
    try {
      await downloadAttemptPdf(attemptId);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download PDF: " + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const monthYearString = selectedMonth.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) return <div style={{ padding:40, textAlign:"center", color:C.muted }}>Loading results…</div>;
  if (error)   return <div style={{ padding:40, textAlign:"center", color:"#dc2626" }}>Error: {error}</div>;
  if (attempts.length === 0) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:12, color:C.blue }}>{getDashboardResultIcon('document')}</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.navy }}>No quizzes attempted yet</div>
      <div style={{ fontSize:13, marginTop:6 }}>Complete a quiz to see your results here.</div>
    </div>
  );

  const percentages = attempts.map(a => a.percentage);
  const bestScore   = Math.round(Math.max(...percentages));
  const avgScore    = Math.round(percentages.reduce((s,p) => s+p, 0) / percentages.length);
  const passCount   = attempts.filter(a => a.percentage >= 60).length;
  const passRate    = Math.round((passCount / attempts.length) * 100);

  // Donut: subject-wise average score (as percentage of all subject attempts)
  const subjectMap = {};
  attempts.forEach(a => {
    if (!subjectMap[a.subject]) subjectMap[a.subject] = [];
    subjectMap[a.subject].push(a.percentage);
  });
  const subjectKeys = Object.keys(subjectMap);
  const donutData = subjectKeys.map((s, i) => {
    const avg = Math.round(subjectMap[s].reduce((x,p) => x+p, 0) / subjectMap[s].length);
    return { label: s, value: avg, color: PALETTE[i % PALETTE.length] };
  });

  // Bar chart: attempts for selected month
  const selectedMonthKey = selectedMonth.toLocaleString("default", { month: "short", year: "2-digit" });
  const selectedMonthAttempts = attempts.filter(a => {
    const d = new Date(a.submittedAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    return key === selectedMonthKey;
  });

  const sorted = [...selectedMonthAttempts].sort((a,b) => b.percentage - a.percentage);

  // If quiz ID is specified and quiz hasn't ended yet, show message
  if (quizId && quiz && !quizEnded) {
    const scheduled = new Date(quiz.scheduledDateTime);
    let endTime;
    if (quiz.schedulingMode === "WINDOW" && quiz.windowEndDateTime) {
      endTime = new Date(quiz.windowEndDateTime);
    } else {
      endTime = new Date(scheduled.getTime() + quiz.durationMinutes * 60 * 1000);
    }
    const timeRemaining = Math.ceil((endTime - new Date()) / 60000);
    
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"400px", fontFamily:C.font }}>
        <div style={{ background:C.card, borderRadius:20, border:`1.5px solid ${C.border}`, padding:"48px 40px", maxWidth:500, textAlign:"center", boxShadow:"0 4px 16px #1a3a6b12" }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"#fef3c7", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>⏳</div>
          <h2 style={{ fontSize:20, fontWeight:900, color:C.navy, margin:"0 0 8px" }}>Results Not Available Yet</h2>
          <p style={{ fontSize:13, color:C.body, lineHeight:1.6, margin:"0 0 20px" }}>
            The quiz is still ongoing. Results will be available after the quiz ends{quiz.schedulingMode === "WINDOW" ? " (when the window closes)" : ""}.
          </p>
          {timeRemaining > 0 && (
            <div style={{ padding:"12px 16px", borderRadius:12, background:C.altBg, border:`1px solid ${C.border}`, marginBottom:20 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Quiz ends in approximately</div>
              <div style={{ fontSize:16, fontWeight:900, color:C.orange }}>{timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}</div>
            </div>
          )}
          <button 
            onClick={() => navigate("/candidate/dashboard")}
            style={{ padding:"12px 32px", borderRadius:12, background:C.blue, color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:C.font }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:C.navy, margin:0, display:"flex", alignItems:"center", gap:10 }}>
            {quizId && attempts.length > 0 && <span style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}>{getDashboardResultIcon('document')}</span>}
            {quizId && attempts.length > 0 ? attempts[0].quizTitle : "Results Dashboard"}
          </h1>
          <p style={{ fontSize:13, color:C.muted, margin:"4px 0 0 0" }}>
            {quizId && attempts.length > 0 ? "Your detailed quiz result" : "Track your performance across all quizzes"}
          </p>
        </div>
        {quizId && (
          <button onClick={() => navigate(-1)} style={{ padding:"8px 16px", borderRadius:10, background:C.blue, color:"#fff", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:C.font }}>
            ← Back
          </button>
        )}
      </div>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Best Score",    value:`${bestScore}%`, color:"#16a34a", icon:"trophy" },
          { label:"Average Score", value:`${avgScore}%`,  color:C.blue,    icon:"chart" },
          { label:"Total Quizzes", value:attempts.length, color:C.navy,    icon:"document" },
          { label:"Pass Rate",     value:`${passRate}%`,  color:C.orange,  icon:"checkmark" },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card, borderRadius:16, padding:"18px 20px", border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:s.color }}>{getDashboardResultIcon(s.icon)}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div style={{ background:C.card, borderRadius:18, border:`1.5px solid ${C.border}`, padding:"22px 24px" }}>
          <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:18 }}>Score by Subject</div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:280 }}>
            <DonutChart data={donutData} avgPct={avgScore}/>
          </div>
        </div>
        <div style={{ background:C.card, borderRadius:18, border:`1.5px solid ${C.border}`, padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontSize:14, fontWeight:800, color:C.navy }}>📅 Monthly Attempts - {monthYearString}</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={goToPreviousMonth} style={{ padding:"6px 12px", borderRadius:8, background:C.altBg, border:`1.5px solid ${C.border}`, color:C.navy, fontWeight:700, cursor:"pointer", fontSize:18, fontFamily:C.font }}>
                ←
              </button>
              <span style={{ fontSize:12, fontWeight:700, color:C.muted, minWidth:80, textAlign:"center" }}>
                {selectedMonthAttempts.length} attempt{selectedMonthAttempts.length !== 1 ? "s" : ""}
              </span>
              <button onClick={goToNextMonth} style={{ padding:"6px 12px", borderRadius:8, background:C.altBg, border:`1.5px solid ${C.border}`, color:C.navy, fontWeight:700, cursor:"pointer", fontSize:18, fontFamily:C.font }}>
                →
              </button>
            </div>
          </div>
          {selectedMonthAttempts.length > 0 ? (
            <div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>Attempts in {monthYearString}:</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:240, overflowY:"auto", paddingRight:8 }}>
                  {selectedMonthAttempts.map(a => {
                    const pct = Math.round(a.percentage);
                    const pass = pct >= 60;
                    const date = new Date(a.submittedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
                    return (
                      <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, background:C.bg }}>
                        <span style={{ fontSize:11, fontWeight:700, color:C.muted, minWidth:50 }}>{date}</span>
                        <div style={{ flex:1, height:5, borderRadius:999, background:C.border, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", borderRadius:999, background:pass?"#16a34a":"#dc2626" }}/>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:pass?"#16a34a":"#dc2626", minWidth:50, textAlign:"right" }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color:C.muted, fontSize:13 }}>No attempts in {monthYearString}</div>
          )}
        </div>
      </div>
      {/* Table */}
      <div style={{ background:C.card, borderRadius:18, border:`1.5px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1.5px solid ${C.border}`, fontSize:14, fontWeight:800, color:C.navy, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}>{getDashboardResultIcon('document')}</span>
          Results from {monthYearString} {selectedMonthAttempts.length > 0 ? `(${selectedMonthAttempts.length})` : "(No data)"}
        </div>
        <div style={{ overflowX:"auto" }}>
          {sorted.length === 0 ? (
            <div style={{ padding:"20px", textAlign:"center", color:C.muted, fontSize:13 }}>
              No attempts in {monthYearString}. Try selecting a different month!
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.altBg }}>
                  {["Quiz","Subject","Score","Status","Date",""].map(h=>(
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r,i)=>{
                  const pct=Math.round(r.percentage), pass=pct>=60;
                  const date=new Date(r.submittedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
                  return (
                    <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.card:C.bg }}>
                      <td style={{ padding:"11px 14px", fontSize:13, color:C.navy, fontWeight:600 }}>{r.quizTitle}</td>
                      <td style={{ padding:"11px 14px", fontSize:12, color:C.body }}>{r.subject}</td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:70, height:6, borderRadius:999, background:C.border, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", borderRadius:999, background:pass?"#16a34a":"#dc2626" }}/>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:pass?"#16a34a":"#dc2626" }}>{r.score}/{r.totalQuestions} · {pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:pass?"#f0fdf4":"#fef2f2", color:pass?"#16a34a":"#dc2626" }}>{pass?"Pass":"Fail"}</span>
                      </td>
                      <td style={{ padding:"11px 14px", fontSize:12, color:C.muted }}>{date}</td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button
                            onClick={() => navigate("/candidate/solutions", { state:{ attemptId: r.id } })}
                            style={{ fontSize:11, fontWeight:700, color:C.blue, background:"none", border:`1px solid ${C.blue}`, borderRadius:8, padding:"4px 10px", cursor:"pointer" }}
                          >Review</button>
                          <button
                            onClick={() => handleDownloadPdf(r.id)}
                            disabled={downloadingId === r.id}
                            style={{ fontSize:11, fontWeight:700, color:downloadingId === r.id ? C.muted : "#16a34a", background:"none", border:`1px solid ${downloadingId === r.id ? C.border : "#16a34a"}`, borderRadius:8, padding:"4px 10px", cursor:downloadingId === r.id ? "not-allowed" : "pointer", opacity:downloadingId === r.id ? 0.6 : 1, display:"flex", alignItems:"center", gap:4 }}
                          >
                            {downloadingId === r.id ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:12, height:12, animation:'spin 0.6s linear infinite' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:12, height:12 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            )}
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
