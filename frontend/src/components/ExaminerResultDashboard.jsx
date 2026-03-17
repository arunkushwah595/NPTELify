// ExaminerResultsDashboard.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getMyQuizzes, getAttemptsForQuiz, downloadQuizReportPdf } from "../api/quizApi";

const C = {
  navy:"#1a3a6b",blue:"#2563eb",orange:"#f97316",green:"#16a34a",red:"#dc2626",purple:"#7c3aed",
  bg:"#f5f8ff",card:"#ffffff",altBg:"#eaf0fb",border:"#dce8fb",muted:"#7a8faf",body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

// Bar chart for score distribution
function ScoreDistBar({ scores }) {
  const buckets = [[0,40],[40,50],[50,60],[60,70],[70,80],[80,90],[90,100]];
  const counts  = buckets.map(([lo,hi]) => scores.filter(s=>s>=lo&&s<(hi===100?101:hi)).length);
  const maxC    = Math.max(...counts,1);
  const W=280,H=90,padL=28,padB=22,barW=28,gap=6;
  const sy = v => H-padB-(v/maxC)*(H-padB-8);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      {counts.map((c,i)=>{
        const x=padL+i*(barW+gap), y=sy(c), bH=H-padB-y;
        return (
          <g key={i}>
            <rect x={x} y={bH>0?y:H-padB} width={barW} height={bH>0?bH:1} rx={5} fill={C.blue} opacity={0.75+(i*0.03)}/>
            {c>0 && <text x={x+barW/2} y={y-4} textAnchor="middle" style={{ fontSize:8,fontWeight:700,fill:C.navy,fontFamily:C.font }}>{c}</text>}
            <text x={x+barW/2} y={H-4} textAnchor="middle" style={{ fontSize:8,fill:C.muted,fontFamily:C.font }}>{buckets[i][0]+"-"+buckets[i][1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Donut
function MiniDonut({ pct, color, size=70 }) {
  const r=28,circ=2*Math.PI*r,filled=(pct/100)*circ;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke={C.border} strokeWidth="9"/>
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={`${filled} ${circ-filled}`} strokeLinecap="round"
        style={{ transform:"rotate(-90deg)",transformOrigin:"35px 35px" }}/>
      <text x="35" y="39" textAnchor="middle" style={{ fontSize:12,fontWeight:900,fill:C.navy,fontFamily:C.font }}>{pct}%</text>
    </svg>
  );
}

function QuizResultCard({ q }) {
  const [open, setOpen] = useState(false);
  const subRate = Math.round((q.submitted/q.enrolled)*100);
  const col = SUBJ_COLORS[q.subject] || C.blue;
  return (
    <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:"hidden",boxShadow:"0 2px 12px #1a3a6b08" }}>
      {/* Card header */}
      <div style={{ padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
            <span style={{ padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:`${col}12`,color:col }}>{q.subject}</span>
            <span style={{ fontSize:11,color:C.muted }}>{q.date}</span>
          </div>
          <div style={{ fontSize:14,fontWeight:800,color:C.navy }}>{q.title}</div>
        </div>
        <button type="button" onClick={()=>setOpen(!open)}
          style={{ padding:"7px 16px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bg,color:C.body,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:C.font,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.body;}}>
          {open?"Hide Charts ▲":"View Charts ▼"}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.border}` }}>
        {[
          { label:"Enrolled",        value:q.enrolled,         color:C.navy },
          { label:"Submitted",       value:`${q.submitted} (${subRate}%)`, color:C.blue },
          { label:"Avg Score",       value:`${q.avgScore}%`,   color:C.orange },
          { label:"Pass Rate",       value:`${q.passRate}%`,   color:C.green },
        ].map((s,i)=>(
          <div key={i} style={{ padding:"12px 16px",borderRight:i<3?`1px solid ${C.border}`:"none",textAlign:"center" }}>
            <div style={{ fontSize:18,fontWeight:900,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11,color:C.muted,marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expanded charts */}
      {open && (
        <div style={{ padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
          {/* Score distribution bar */}
          <div>
            <div style={{ fontSize:12,fontWeight:800,color:C.navy,marginBottom:12 }}>Score Distribution</div>
            <ScoreDistBar scores={q.scores}/>
          </div>
          {/* Submission donut */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <div style={{ fontSize:12,fontWeight:800,color:C.navy,marginBottom:12,alignSelf:"flex-start" }}>Submission Rate</div>
            <MiniDonut pct={subRate} color={C.blue} size={90}/>
            <div style={{ fontSize:11,color:C.muted,marginTop:6 }}>{q.submitted} of {q.enrolled} submitted</div>
          </div>
          {/* Pass/fail donut */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <div style={{ fontSize:12,fontWeight:800,color:C.navy,marginBottom:12,alignSelf:"flex-start" }}>Pass Rate</div>
            <MiniDonut pct={q.passRate} color={C.green} size={90}/>
            <div style={{ display:"flex",gap:14,marginTop:8 }}>
              <span style={{ fontSize:11,color:C.green,fontWeight:700 }}>✓ Pass {q.passRate}%</span>
              <span style={{ fontSize:11,color:C.red,fontWeight:700 }}>✗ Fail {100-q.passRate}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExaminerResultDashboard() {
  const [searchParams] = useSearchParams();
  const [quizzes,    setQuizzes]    = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [attempts,   setAttempts]   = useState([]);
  const [loadingQ,   setLoadingQ]   = useState(true);
  const [loadingA,   setLoadingA]   = useState(false);
  const [errorQ,     setErrorQ]     = useState(null);
  const [errorA,     setErrorA]     = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    getMyQuizzes()
      .then(data => {
        setQuizzes(data);
        const quizIdFromParam = searchParams.get("quizId");
        if (quizIdFromParam) {
          setSelectedId(Number(quizIdFromParam));
        } else if (data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoadingQ(false);
      })
      .catch(e  => { setErrorQ(e.message); setLoadingQ(false); });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) { setAttempts([]); return; }
    setLoadingA(true);
    setErrorA(null);
    getAttemptsForQuiz(selectedId)
      .then(data => { setAttempts(data); setLoadingA(false); })
      .catch(e  => { setErrorA(e.message); setLoadingA(false); });
  }, [selectedId]);

  const handleDownloadPdf = async () => {
    if (!selectedId) return;
    setDownloadingId(selectedId);
    try {
      await downloadQuizReportPdf(selectedId);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download PDF: " + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const totalSubmitted = attempts.length;
  const avgPct = attempts.length > 0
    ? Math.round(attempts.reduce((a, at) => a + at.percentage, 0) / attempts.length)
    : 0;
  const passCount = attempts.filter(a => a.percentage >= 60).length;
  const passRate  = attempts.length > 0 ? Math.round((passCount / attempts.length) * 100) : 0;

  const selectedQuiz = quizzes.find(q => q.id === selectedId);

  // Score distribution buckets for bar chart
  const buckets    = [[0,40],[40,50],[50,60],[60,70],[70,80],[80,90],[90,100]];
  const buckCounts = buckets.map(([lo,hi]) =>
    attempts.filter(a => a.percentage >= lo && a.percentage < (hi === 100 ? 101 : hi)).length
  );
  const maxB = Math.max(...buckCounts, 1);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,fontFamily:C.font }}>

      {/* Quiz selector */}
      <div style={{ background:C.card,borderRadius:16,border:`1.5px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <span style={{ fontSize:13,fontWeight:700,color:C.navy,whiteSpace:"nowrap" }}>Select Quiz:</span>
        {loadingQ ? (
          <span style={{ fontSize:13,color:C.muted }}>Loading quizzes…</span>
        ) : errorQ ? (
          <span style={{ fontSize:13,color:C.red }}>{errorQ}</span>
        ) : quizzes.length === 0 ? (
          <span style={{ fontSize:13,color:C.muted }}>No quizzes found. Create one first.</span>
        ) : (
          <>
            <select value={selectedId ?? ""} onChange={e => setSelectedId(Number(e.target.value))}
              style={{ padding:"9px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bg,color:C.navy,fontSize:13,fontFamily:C.font,outline:"none",flex:1,maxWidth:440 }}>
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title} — {q.subject}</option>
              ))}
            </select>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingId === selectedId || !selectedId}
              style={{ padding:"9px 16px",borderRadius:10,background:downloadingId===selectedId?"#e5e7eb":C.green,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:downloadingId===selectedId?"not-allowed":"pointer",fontFamily:C.font,display:"flex",alignItems:"center",gap:6,opacity:downloadingId===selectedId?0.6:1,transition:"all 0.15s",whiteSpace:"nowrap" }}>
              {downloadingId === selectedId ? "⏳ Generating..." : "📥 Download PDF"}
            </button>
          </>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
        {[
          { icon:"📋", label:"Quiz",            value:selectedQuiz?.title ?? "—",   color:C.blue   },
          { icon:"📩", label:"Total Submitted",  value:totalSubmitted,               color:C.green  },
          { icon:"📊", label:"Avg Score",        value:totalSubmitted ? `${avgPct}%` : "—", color:C.orange },
          { icon:"✅", label:"Pass Rate (≥60%)", value:totalSubmitted ? `${passRate}%` : "—", color:"#9333ea" },
        ].map(s=>(
          <div key={s.label} style={{ background:C.card,borderRadius:16,padding:"18px 20px",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:`${s.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:s.label==="Quiz"?13:22,fontWeight:900,color:s.color,lineHeight:1.2 }}>{s.value}</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loadingA ? (
        <div style={{ padding:"40px",textAlign:"center",color:C.muted,fontSize:14 }}>Loading results…</div>
      ) : errorA ? (
        <div style={{ padding:"16px",borderRadius:12,background:"#fef2f2",border:`1px solid #fca5a5`,color:"#991b1b",fontSize:13 }}>{errorA}</div>
      ) : attempts.length === 0 ? (
        <div style={{ padding:"40px",textAlign:"center",color:C.muted,fontSize:14 }}>No attempts found for this quiz.</div>
      ) : (
        <>
          {/* Charts row */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>

            {/* Score distribution */}
            <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"22px 24px" }}>
              <div style={{ fontSize:13,fontWeight:800,color:C.navy,marginBottom:16 }}>Score Distribution</div>
              <div style={{ display:"flex",alignItems:"flex-end",gap:6 }}>
                {buckCounts.map((c,i) => {
                  const barH = Math.round((c / maxB) * 100);
                  return (
                    <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:C.navy }}>{c > 0 ? c : ""}</span>
                      <div style={{ width:"100%",borderRadius:"4px 4px 0 0",background:C.blue,opacity:0.75+i*0.04,height:barH > 0 ? `${barH}px` : "3px",minHeight:3 }}/>
                      <span style={{ fontSize:9,color:C.muted,textAlign:"center" }}>{buckets[i][0]}-{buckets[i][1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pass/Fail donut */}
            <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"22px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div style={{ fontSize:13,fontWeight:800,color:C.navy,alignSelf:"flex-start" }}>Pass / Fail Rate</div>
              {(() => {
                const r=40,circ=2*Math.PI*r,filled=(passRate/100)*circ;
                return (
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="14"/>
                    <circle cx="60" cy="60" r={r} fill="none" stroke={C.green} strokeWidth="14"
                      strokeDasharray={`${filled} ${circ-filled}`} strokeLinecap="round"
                      style={{ transform:"rotate(-90deg)",transformOrigin:"60px 60px" }}/>
                    <text x="60" y="57" textAnchor="middle" style={{ fontSize:18,fontWeight:900,fill:C.navy,fontFamily:C.font }}>{passRate}%</text>
                    <text x="60" y="72" textAnchor="middle" style={{ fontSize:10,fill:C.muted,fontFamily:C.font }}>Pass Rate</text>
                  </svg>
                );
              })()}
              <div style={{ display:"flex",gap:20 }}>
                <span style={{ fontSize:12,color:C.green,fontWeight:700 }}>✓ Pass: {passCount}</span>
                <span style={{ fontSize:12,color:C.red,fontWeight:700 }}>✗ Fail: {attempts.length-passCount}</span>
              </div>
            </div>
          </div>

          {/* Attempts table */}
          <div style={{ background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:"hidden" }}>
            <div style={{ padding:"16px 20px",borderBottom:`1.5px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.navy }}>
              Candidate Attempts ({attempts.length})
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.altBg }}>
                    {["#","Score","Percentage","Status","Submitted"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:C.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...attempts].sort((a,b)=>b.percentage-a.percentage).map((a,i)=>{
                    const pass = a.percentage >= 60;
                    const date = a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-IN",{ day:"2-digit",month:"short",year:"numeric" }) : "—";
                    return (
                      <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?C.card:C.bg }}>
                        <td style={{ padding:"12px 16px",fontSize:13,color:C.muted,fontWeight:700 }}>{i+1}</td>
                        <td style={{ padding:"12px 16px",fontSize:13,fontWeight:700,color:C.navy }}>{a.score}/{a.totalQuestions}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{ width:80,height:6,borderRadius:999,background:C.border,overflow:"hidden" }}>
                              <div style={{ width:`${a.percentage}%`,height:"100%",borderRadius:999,background:pass?C.green:C.red }}/>
                            </div>
                            <span style={{ fontSize:12,fontWeight:700,color:pass?C.green:C.red }}>{a.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:pass?"#f0fdf4":"#fef2f2",color:pass?C.green:C.red }}>{pass?"Pass":"Fail"}</span>
                        </td>
                        <td style={{ padding:"12px 16px",fontSize:12,color:C.muted }}>{date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}