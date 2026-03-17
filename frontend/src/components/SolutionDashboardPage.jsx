import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAttemptDetail, getMyAttempts, downloadAttemptPdf } from "../api/quizApi";
const C = {
  navy: "#1a3a6b", blue: "#2563eb", orange: "#f97316",
  bg: "#f5f8ff", card: "#ffffff", altBg: "#eaf0fb",
  border: "#dce8fb", muted: "#7a8faf", body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
};

function QuestionCard({ q, idx }) {
  const [open, setOpen] = useState(false);
  const isOK = q.correct;
  return (
    <div style={{ background:C.card, borderRadius:16, border:`1.5px solid ${isOK?"#bbf7d0":"#fecaca"}`, overflow:"hidden", boxShadow:"0 2px 12px #1a3a6b08" }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:isOK?"#f0fdf4":"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13 }}>{isOK?"✓":"✗"}</div>
          <div>
            <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>Q{idx + 1}</span>
            <p style={{ margin:"2px 0 0", fontSize:13, fontWeight:700, color:C.navy, lineHeight:1.4 }}>{q.text}</p>
          </div>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ width:26, height:26, borderRadius:"50%", background:C.altBg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.navy, transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:12,height:12 }}><path d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
      {open && (
        <div style={{ padding:"12px 18px", display:"flex", flexDirection:"column", gap:7 }}>
          {q.options.map((opt,i)=>{
            const isRight=i===q.correctOption, isChosen=i===q.candidateAnswer;
            let bg=C.bg, bdr=C.border, tc=C.body;
            if(isRight){bg="#f0fdf4";bdr="#86efac";tc="#166534";}
            else if(isChosen&&!isRight){bg="#fef2f2";bdr="#fca5a5";tc="#991b1b";}
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:`1.5px solid ${bdr}`, background:bg }}>
                <div style={{ width:20, height:20, borderRadius:"50%", border:`1.5px solid ${bdr}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, fontWeight:800, color:tc }}>{String.fromCharCode(65+i)}</div>
                <span style={{ fontSize:13, color:tc, fontWeight:isRight||isChosen?700:400 }}>{opt}</span>
                {isRight && <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#16a34a" }}>✓ Correct</span>}
                {isChosen&&!isRight && <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#dc2626" }}>✗ Your answer</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SolutionDashboardPage() {
  const location = useLocation();
  const [attemptId, setAttemptId] = useState(location.state?.attemptId ?? null);
  const [detail, setDetail] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // If no attemptId in state, load the list of attempts for picking
  useEffect(() => {
    if (attemptId == null) {
      setListLoading(true);
      getMyAttempts()
        .then(data => { setAttempts(data); setListLoading(false); })
        .catch(e => { setError(e.message); setListLoading(false); });
    }
  }, []);

  // Load detail whenever attemptId is set
  useEffect(() => {
    if (attemptId == null) return;
    setLoading(true);
    setDetail(null);
    getAttemptDetail(attemptId)
      .then(data => { setDetail(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [attemptId]);

  const handleDownloadPdf = async () => {
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

  // — Picker screen —
  if (attemptId == null) {
    if (listLoading) return <div style={{ padding:40, textAlign:"center", color:C.muted }}>Loading attempts…</div>;
    if (error)       return <div style={{ padding:40, textAlign:"center", color:"#dc2626" }}>Error: {error}</div>;
    if (attempts.length === 0) return (
      <div style={{ padding:40, textAlign:"center", color:C.muted }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.navy }}>No attempts yet</div>
        <div style={{ fontSize:13, marginTop:6 }}>Take a quiz first to review solutions here.</div>
      </div>
    );
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:16, fontWeight:800, color:C.navy }}>Select an attempt to review</div>
        {[...attempts].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(a => {
          const pass = a.percentage >= 60;
          const date = new Date(a.submittedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
          return (
            <button key={a.id} onClick={() => setAttemptId(a.id)}
              style={{ background:C.card, borderRadius:14, border:`1.5px solid ${C.border}`, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", textAlign:"left", gap:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.navy }}>{a.quizTitle}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{a.subject} · {date}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:13, fontWeight:800, color:pass?"#16a34a":"#dc2626" }}>{Math.round(a.percentage)}%</span>
                <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:pass?"#f0fdf4":"#fef2f2", color:pass?"#16a34a":"#dc2626" }}>{pass?"Pass":"Fail"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ width:16, height:16 }}><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // — Loading detail —
  if (loading) return <div style={{ padding:40, textAlign:"center", color:C.muted }}>Loading solutions…</div>;
  if (error)   return <div style={{ padding:40, textAlign:"center", color:"#dc2626" }}>Error: {error}</div>;
  if (!detail) return null;

  const { quizTitle, subject, score, totalQuestions, percentage, submittedAt, questions } = detail;
  const pct = Math.round(percentage), pass = pct >= 60;
  const correctCount = questions.filter(q => q.correct).length;
  const r=52, circ=2*Math.PI*r, filled=(pct/100)*circ;
  const date = new Date(submittedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Back link */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <button onClick={() => { setAttemptId(null); setDetail(null); setError(null); }}
          style={{ background:"none", border:"none", color:C.blue, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:6 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:14,height:14 }}><path d="M15 18l-6-6 6-6"/></svg>
          All Attempts
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingId === attemptId}
          style={{ background:C.blue, color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:downloadingId === attemptId ? "not-allowed" : "pointer", opacity:downloadingId === attemptId ? 0.6 : 1, display:"flex", alignItems:"center", gap:6 }}
        >
          {downloadingId === attemptId ? "⏳" : "📥"} Download PDF
        </button>
      </div>
      {/* Result card */}
      <div style={{ background:C.card, borderRadius:20, border:`1.5px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ background:C.navy, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:60, width:120, height:120, borderRadius:"50%", background:C.orange, opacity:.1 }}/>
          <div style={{ position:"absolute", bottom:-30, left:200, width:100, height:100, borderRadius:"50%", background:C.blue, opacity:.18 }}/>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:11, color:"#a8c0e0", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Solution Review</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>{quizTitle}</div>
            <div style={{ fontSize:13, color:"#a8c0e0", marginTop:4 }}>{subject} · {totalQuestions} Questions · {date}</div>
          </div>
          <div style={{ position:"relative", display:"flex", alignItems:"center", gap:16 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10"/>
              <circle cx="55" cy="55" r={r} fill="none" stroke={pass?"#4ade80":"#f87171"} strokeWidth="10"
                strokeDasharray={`${filled} ${circ-filled}`} strokeLinecap="round"
                style={{ transform:"rotate(-90deg)", transformOrigin:"55px 55px" }}/>
              <text x="55" y="52" textAnchor="middle" style={{ fontSize:18, fontWeight:900, fill:"#fff", fontFamily:C.font }}>{pct}%</text>
              <text x="55" y="67" textAnchor="middle" style={{ fontSize:10, fill:"#a8c0e0", fontFamily:C.font }}>{pass?"Pass":"Fail"}</text>
            </svg>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Score",   value:`${score}/${totalQuestions}`, color:"#fff" },
                { label:"Correct", value:`${correctCount}/${totalQuestions}`, color:"#4ade80" },
                { label:"Result",  value:pass?"PASS":"FAIL",           color:pass?"#4ade80":"#f87171" },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ fontSize:10, color:"#a8c0e0", fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:14, fontWeight:900, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:`1.5px solid ${C.border}` }}>
          {[
            { label:"Total Questions", value:totalQuestions,                         color:C.navy },
            { label:"Correct",         value:correctCount,                           color:"#16a34a" },
            { label:"Wrong",           value:totalQuestions - correctCount,          color:"#dc2626" },
            { label:"Score",           value:`${score}/${totalQuestions}`,           color:C.blue },
          ].map((s,i)=>(
            <div key={i} style={{ padding:"14px 20px", borderRight:i<3?`1px solid ${C.border}`:"none", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Questions */}
      <div>
        <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:14 }}>
          Question-wise Solutions <span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>· click ▾ to see options</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {questions.map((q,i) => <QuestionCard key={i} q={q} idx={i}/>)}
        </div>
      </div>
    </div>
  );
}
