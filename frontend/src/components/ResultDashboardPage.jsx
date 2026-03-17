import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyAttempts, downloadAttemptPdf } from "../api/quizApi";

const C = {
  navy: "#1a3a6b", blue: "#2563eb", orange: "#f97316",
  bg: "#f5f8ff", card: "#ffffff", altBg: "#eaf0fb",
  border: "#dce8fb", muted: "#7a8faf", body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

const PALETTE = [C.blue, C.orange, "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#be185d"];

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
      <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
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

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:C.navy, margin:0 }}>
            {quizId && attempts.length > 0 ? `📋 ${attempts[0].quizTitle}` : "Results Dashboard"}
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
          { label:"Best Score",    value:`${bestScore}%`, color:"#16a34a", icon:"🏆" },
          { label:"Average Score", value:`${avgScore}%`,  color:C.blue,    icon:"📊" },
          { label:"Total Quizzes", value:attempts.length, color:C.navy,    icon:"📝" },
          { label:"Pass Rate",     value:`${passRate}%`,  color:C.orange,  icon:"✅" },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card, borderRadius:16, padding:"18px 20px", border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
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
          <DonutChart data={donutData} avgPct={avgScore}/>
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
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
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
        <div style={{ padding:"16px 20px", borderBottom:`1.5px solid ${C.border}`, fontSize:14, fontWeight:800, color:C.navy }}>
          📋 Results from {monthYearString} {selectedMonthAttempts.length > 0 ? `(${selectedMonthAttempts.length})` : "(No data)"}
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
                            style={{ fontSize:11, fontWeight:700, color:downloadingId === r.id ? C.muted : "#16a34a", background:"none", border:`1px solid ${downloadingId === r.id ? C.border : "#16a34a"}`, borderRadius:8, padding:"4px 10px", cursor:downloadingId === r.id ? "not-allowed" : "pointer", opacity:downloadingId === r.id ? 0.6 : 1 }}
                          >{downloadingId === r.id ? "⏳" : "📥"} PDF</button>
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
