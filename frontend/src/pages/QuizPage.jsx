// QuizPage.jsx — Full-screen quiz taking experience
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getQuizById, submitAttempt } from "../api/quizApi";

const C = {
  navy:"#1a3a6b", blue:"#2563eb", orange:"#f97316", green:"#16a34a", red:"#dc2626",
  bg:"#f5f8ff", card:"#ffffff", altBg:"#eaf0fb", border:"#dce8fb", muted:"#7a8faf", body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function QuizPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [quiz,     setQuiz]     = useState(null);
  const [answers,  setAnswers]  = useState([]);   // array of ints (null = not answered)
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result,   setResult]   = useState(null);  // AttemptResponse after submit
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    // Load tab switch count from sessionStorage on mount
    const stored = sessionStorage.getItem(`quiz_${id}_tabSwitches`);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());  // Set of question indices
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());  // Set of question indices
  const [showNavigator, setShowNavigator] = useState(true);  // Toggle navigator sidebar
  const pageLeftRef = useRef(false);

  useEffect(() => {
    getQuizById(id)
      .then(data => {
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setTimeLeft(data.durationMinutes * 60);
        setLoading(false);
        
        // Request fullscreen mode on quiz load
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      })
      .catch(e => { setError(e.message); setLoading(false); });
    
    // Cleanup: Exit fullscreen when quiz is unloaded
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [id]);

  const handleSubmit = useCallback(async (forced = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Send answers as-is (null for unanswered, null is ignored by backend scorer)
      const res = await submitAttempt(Number(id), answers);
      setResult(res);
    } catch (e) {
      alert(e.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }, [id, answers, submitting]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result, handleSubmit]);

  // Save tab switch count to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem(`quiz_${id}_tabSwitches`, tabSwitchCount);
  }, [id, tabSwitchCount]);

  // Clean up sessionStorage when quiz is submitted/completed
  useEffect(() => {
    if (result) {
      sessionStorage.removeItem(`quiz_${id}_tabSwitches`);
    }
  }, [id, result]);

  // Save marked for review to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`quiz_${id}_marked`, JSON.stringify(Array.from(markedForReview)));
  }, [id, markedForReview]);

  // Save bookmarked questions to sessionStorage (persist across sessions)
  useEffect(() => {
    localStorage.setItem(`quiz_${id}_bookmarks`, JSON.stringify(Array.from(bookmarkedQuestions)));
  }, [id, bookmarkedQuestions]);

  // Load marked and bookmarked from storage on mount
  useEffect(() => {
    const marked = sessionStorage.getItem(`quiz_${id}_marked`);
    const bookmarks = localStorage.getItem(`quiz_${id}_bookmarks`);
    
    if (marked) setMarkedForReview(new Set(JSON.parse(marked)));
    if (bookmarks) setBookmarkedQuestions(new Set(JSON.parse(bookmarks)));
  }, [id]);

  // Track browser back/forward navigation via location changes
  useEffect(() => {
    const quizPathRegex = new RegExp(`^/candidate/quiz/${id}$`);
    const isCurrentlyOnQuiz = quizPathRegex.test(location.pathname);

    // Mark if we're leaving the quiz page
    if (!isCurrentlyOnQuiz && pageLeftRef.current === false) {
      pageLeftRef.current = true;
    }

    // If we were away and now returning to this specific quiz page
    if (isCurrentlyOnQuiz && pageLeftRef.current === true) {
      pageLeftRef.current = false;
      
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      sessionStorage.setItem(`quiz_${id}_tabSwitches`, newCount);

      if (newCount === 1) {
        setShowTabWarning(true);
      } else if (newCount === 3) {
        setShowTabWarning(true);
      } else if (newCount > 3) {
        handleSubmit(true);
      } else {
        setShowTabWarning(true);
      }
    }
  }, [location.pathname, id, tabSwitchCount, handleSubmit]);

  // Block browser navigation and prevent leaving during quiz
  useEffect(() => {
    if (!quiz || result) return; // Only block while quiz is active
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "⚠️ You cannot leave the quiz. Your answers will be lost.";
      return "⚠️ You cannot leave the quiz. Your answers will be lost.";
    };
    
    const handlePopstate = (e) => {
      e.preventDefault();
      alert("❌ You cannot go back during a quiz. Please complete your attempt.");
      window.history.forward();
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopstate);
    
    // Disable browser back button
    window.history.pushState(null, null, window.location.href);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [quiz, result]);

  // Tab switch and navigation detection
  useEffect(() => {
    let pageLeftViaNavigation = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pageLeftViaNavigation = true;
      } else if (pageLeftViaNavigation) {
        // Page became visible after being hidden
        pageLeftViaNavigation = false;
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        sessionStorage.setItem(`quiz_${id}_tabSwitches`, newCount);

        if (newCount === 3) {
          setShowTabWarning(true);
        } else if (newCount > 3) {
          handleSubmit(true);
        } else {
          setShowTabWarning(true);
        }
      }
    };

    // Also detect leaving page entirely
    const handleBeforeUnload = () => {
      pageLeftViaNavigation = true;
    };

    // When page regains focus after beforeunload
    const handleFocus = () => {
      if (pageLeftViaNavigation) {
        pageLeftViaNavigation = false;
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        sessionStorage.setItem(`quiz_${id}_tabSwitches`, newCount);

        if (newCount === 3) {
          setShowTabWarning(true);
        } else if (newCount > 3) {
          handleSubmit(true);
        } else {
          setShowTabWarning(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id, tabSwitchCount, handleSubmit]);

  // Block copy, paste, cut, select all, right-click, and developer tools
  useEffect(() => {
    const blockActions = (e) => {
      // Block keyboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+Shift+I, F12
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
      }
      // Block right-click context menu
      if (e.button === 2) e.preventDefault();
    };

    const blockContextMenu = (e) => e.preventDefault();

    document.addEventListener("keydown", blockActions);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("paste", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("keydown", blockActions);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", (e) => e.preventDefault());
      document.removeEventListener("paste", (e) => e.preventDefault());
      document.removeEventListener("cut", (e) => e.preventDefault());
    };
  }, []);

  const answeredCount = answers.filter(a => a !== null).length;
  const totalQ        = quiz?.questions?.length || 0;

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    const pass = result.percentage >= 60;
    const r = 52, circ = 2 * Math.PI * r, filled = (result.percentage / 100) * circ;
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:C.font, padding:20 }}>
        <div style={{ background:C.card, borderRadius:20, maxWidth:480, width:"100%", overflow:"hidden", boxShadow:"0 8px 40px #1a3a6b18" }}>
          {/* Banner */}
          <div style={{ background:C.navy, padding:"32px 32px 28px", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-20, right:40, width:120, height:120, borderRadius:"50%", background:C.orange, opacity:.1 }}/>
            <div style={{ position:"absolute", bottom:-30, left:30, width:100, height:100, borderRadius:"50%", background:C.blue, opacity:.15 }}/>
            <div style={{ position:"relative" }}>
              <div style={{ fontSize:11, color:"#a8c0e0", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Quiz Complete</div>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin:"0 auto 10px", display:"block" }}>
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10"/>
                <circle cx="60" cy="60" r={r} fill="none" stroke={pass?"#4ade80":"#f87171"} strokeWidth="10"
                  strokeDasharray={`${filled} ${circ-filled}`} strokeLinecap="round"
                  style={{ transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}/>
                <text x="60" y="56" textAnchor="middle" style={{ fontSize:20, fontWeight:900, fill:"#fff", fontFamily:C.font }}>{result.percentage.toFixed(0)}%</text>
                <text x="60" y="72" textAnchor="middle" style={{ fontSize:11, fill:"#a8c0e0", fontFamily:C.font }}>{pass?"PASS":"FAIL"}</text>
              </svg>
              <div style={{ fontSize:22, fontWeight:900, color:pass?"#4ade80":"#f87171" }}>{pass?"Congratulations!":"Better luck next time"}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:`1.5px solid ${C.border}` }}>
            {[
              { label:"Score",    value:`${result.score}/${result.totalQuestions}`, color:C.navy },
              { label:"Correct",  value:result.score,       color:C.green },
              { label:"Wrong",    value:result.totalQuestions - result.score, color:C.red },
            ].map((s,i)=>(
              <div key={i} style={{ padding:"18px 16px", borderRight:i<2?`1px solid ${C.border}`:"none", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:12 }}>
            <button onClick={() => navigate("/candidate/solutions", { state:{ attemptId: result.id } })}
              style={{ padding:"12px", borderRadius:12, background:C.blue, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:C.font }}>
              View Solutions
            </button>
            <button onClick={() => navigate("/candidate/dashboard")}
              style={{ padding:"12px", borderRadius:12, background:C.altBg, color:C.navy, border:`1.5px solid ${C.border}`, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:C.font }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / Error ────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:C.font, color:C.muted, fontSize:15 }}>
        Loading quiz…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:C.font }}>
        <div style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:16, padding:"32px 36px", color:"#991b1b", maxWidth:400, textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:12 }}>⚠️</div>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>Failed to load quiz</div>
          <div style={{ fontSize:13 }}>{error}</div>
          <button onClick={() => navigate("/candidate/dashboard")}
            style={{ marginTop:20, padding:"10px 24px", borderRadius:10, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontFamily:C.font }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz UI ────────────────────────────────────────────────
  const timerColor = timeLeft < 60 ? C.red : timeLeft < 5 * 60 ? C.orange : C.green;

  // Tab switch warning modal
  const TabWarningModal = () => (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div style={{ background:C.card, borderRadius:16, maxWidth:400, width:"90%", padding:"32px 28px", boxShadow:"0 16px 48px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
          <div style={{ fontSize:18, fontWeight:900, color:C.navy, marginBottom:8 }}>
            {tabSwitchCount >= 3 ? "Final Warning!" : `Tab Switch Detected (${tabSwitchCount}/3)`}
          </div>
          <div style={{ fontSize:14, color:C.body, lineHeight:1.6 }}>
            {tabSwitchCount >= 3 
              ? "You've switched tabs 3 times. Any further attempt will automatically submit your quiz!"
              : `You switched tabs ${tabSwitchCount} time${tabSwitchCount > 1 ? 's' : ''}. You have ${3 - tabSwitchCount} more allowed switch${3 - tabSwitchCount > 1 ? 'es' : ''} before automatic submission.`}
          </div>
        </div>
        <button 
          onClick={() => setShowTabWarning(false)}
          style={{ width:"100%", padding:"12px", borderRadius:12, background:C.blue, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:C.font }}>
          I Understand
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, width:"100vw", height:"100vh", overflow:"hidden", background:C.bg, fontFamily:C.font, display:"flex", flexDirection:"column" }}>
      {/* Fullscreen overlay to block interactions outside quiz */}
      {!result && <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:1 }}/>}
      
      {/* Tab switch warning modal */}
      {showTabWarning && <TabWarningModal />}
      
      {/* Main quiz container with navigator */}
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
        {/* Sticky header */}
        <div style={{ position:"sticky", top:0, zIndex:50, background:C.navy, padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 16px #1a3a6b28", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {/* Navigator Toggle */}
            <button onClick={() => setShowNavigator(!showNavigator)}
              style={{ padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>
              {showNavigator ? "Hide" : "Show"} Navigator
            </button>
            <div>
              <div style={{ fontSize:11, color:"#a8c0e0", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{quiz.subject}</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff", marginTop:2 }}>{quiz.title}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            {/* Tab Switch Warning */}
            {tabSwitchCount > 0 && (
              <div style={{ textAlign:"center", padding:"8px 12px", background:"#fef3c7", borderRadius:8, border:"1.5px solid #fcd34d" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#92400e" }}>⚠️ Tab Switches</div>
                <div style={{ fontSize:12, fontWeight:900, color:"#dc2626" }}>{tabSwitchCount}/3</div>
              </div>
            )}
            {/* Progress */}
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:900, color:C.orange }}>{answeredCount}/{totalQ}</div>
              <div style={{ fontSize:10, color:"#a8c0e0" }}>Answered</div>
            </div>
            {/* Timer */}
            <div style={{ background:`${timerColor}22`, border:`1.5px solid ${timerColor}55`, borderRadius:12, padding:"8px 16px", textAlign:"center", minWidth:80 }}>
              <div style={{ fontSize:18, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums" }}>{formatTime(timeLeft)}</div>
              <div style={{ fontSize:10, color:"#a8c0e0" }}>Remaining</div>
            </div>
          </div>
        </div>

        {/* Main content area with navigator */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          {/* Navigator Sidebar */}
          {showNavigator && (
            <div style={{ width:240, background:C.card, borderRight:`1.5px solid ${C.border}`, overflow:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12, flexShrink:0, boxShadow:"2px 0 8px rgba(26, 58, 107, 0.06)" }}>
              <div style={{ fontSize:13, fontWeight:900, color:C.navy, display:"flex", alignItems:"center", gap:8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
                Question Navigator
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {quiz.questions.map((q, qi) => {
                  const isAnswered = answers[qi] !== null && answers[qi] !== undefined;
                  const isMarked = markedForReview.has(qi);
                  const isBookmarked = bookmarkedQuestions.has(qi);
                  
                  return (
                    <button key={qi}
                      onClick={() => document.getElementById(`q-${qi}`)?.scrollIntoView({ behavior:"smooth", block:"center" })}
                      style={{
                        padding:"10px 12px", borderRadius:8, border:`1.5px solid ${isAnswered ? C.blue : C.border}`,
                        background: isAnswered ? `${C.blue}11` : "transparent", cursor:"pointer", textAlign:"left",
                        display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, fontSize:11, fontWeight:700, color:C.navy,
                        transition:"all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${C.blue}08`;
                        e.currentTarget.style.borderColor = C.blue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isAnswered ? `${C.blue}11` : "transparent";
                        e.currentTarget.style.borderColor = isAnswered ? C.blue : C.border;
                      }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background: isAnswered ? C.blue : C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#fff", flexShrink:0, transition:"all 0.2s" }}>
                          {isAnswered ? "✓" : qi + 1}
                        </div>
                        <span style={{ fontSize:10, fontWeight:600 }}>Q{qi + 1}</span>
                      </div>
                      <div style={{ display:"flex", gap:3 }}>
                        {isMarked && <svg width="12" height="12" viewBox="0 0 24 24" fill={C.orange} title="Marked for Review"><path d="M12 2L15.09 8.26H22L17.54 12.88L18.91 19.12L12 15.4L5.09 19.12L6.45 12.88L2 8.26H8.91L12 2Z"/></svg>}
                        {isBookmarked && <svg width="12" height="12" viewBox="0 0 24 24" fill={C.blue} title="Bookmarked"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div style={{ fontSize:9, color:C.muted, borderTop:`1px solid ${C.border}`, paddingTop:10, marginTop:10, lineHeight:1.6 }}>
                <div style={{ marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:C.blue, color:"#fff", fontWeight:900, fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✓</div>
                  <span>Answered</span>
                </div>
                <div style={{ marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={C.orange}><path d="M12 2L15.09 8.26H22L17.54 12.88L18.91 19.12L12 15.4L5.09 19.12L6.45 12.88L2 8.26H8.91L12 2Z"/></svg>
                  <span>For Review</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={C.blue}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span>Bookmarked</span>
                </div>
              </div>
            </div>
          )}

        {/* Questions - Scrollable */}
        <div style={{ flex:1, overflow:"auto", padding:"28px 20px 28px" }}>
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {quiz.questions.map((q, qi) => {
            const chosen = answers[qi];
            const isMarked = markedForReview.has(qi);
            const isBookmarked = bookmarkedQuestions.has(qi);
            return (
              <div key={qi} style={{ background:C.card, borderRadius:16, border:`1.5px solid ${chosen !== null ? C.blue : C.border}`, overflow:"hidden", boxShadow:"0 4px 16px rgba(26, 58, 107, 0.08)", transition:"all 0.2s" }} id={`q-${qi}`}>
                {/* Question header */}
                <div style={{ background:`linear-gradient(135deg, ${C.altBg} 0%, #ffffff 100%)`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:`1.5px solid ${C.border}`, justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:chosen !== null ? `linear-gradient(135deg, ${C.blue}, ${C.blue}dd)` : C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:chosen !== null ? "#fff" : C.muted, flexShrink:0, boxShadow: chosen !== null ? `0 2px 8px ${C.blue}26` : "none" }}>
                      {qi + 1}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:C.navy }}>Question {qi + 1} of {totalQ}</div>
                      {chosen !== null && <div style={{ fontSize:10, fontWeight:700, color:C.green, marginTop:2 }}>✓ Answered</div>}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {/* Mark for Review Button */}
                    <button onClick={() => {
                      const newMarked = new Set(markedForReview);
                      if (newMarked.has(qi)) newMarked.delete(qi);
                      else newMarked.add(qi);
                      setMarkedForReview(newMarked);
                    }}
                      title="Mark for review"
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:8, border:`1.5px solid ${isMarked ? C.orange : C.border}`, background:isMarked ? `${C.orange}dd` : "transparent", cursor:"pointer", fontFamily:C.font, fontSize:12, fontWeight:700, color:isMarked ? C.orange : C.muted, transition:"all 0.2s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${C.orange}22`;
                        e.currentTarget.style.borderColor = C.orange;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isMarked ? `${C.orange}dd` : "transparent";
                        e.currentTarget.style.borderColor = isMarked ? C.orange : C.border;
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.8 }}>
                        <path d="M12 2L15.09 8.26H22L17.54 12.88L18.91 19.12L12 15.4L5.09 19.12L6.45 12.88L2 8.26H8.91L12 2Z"/>
                      </svg>
                      <span style={{ fontWeight:700 }}>Review</span>
                    </button>
                    {/* Bookmark Button */}
                    <button onClick={() => {
                      const newBookmarks = new Set(bookmarkedQuestions);
                      if (newBookmarks.has(qi)) newBookmarks.delete(qi);
                      else newBookmarks.add(qi);
                      setBookmarkedQuestions(newBookmarks);
                    }}
                      title="Bookmark question"
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:8, border:`1.5px solid ${isBookmarked ? C.blue : C.border}`, background:isBookmarked ? `${C.blue}18` : "transparent", cursor:"pointer", fontFamily:C.font, fontSize:12, fontWeight:700, color:isBookmarked ? C.blue : C.muted, transition:"all 0.2s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${C.blue}22`;
                        e.currentTarget.style.borderColor = C.blue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isBookmarked ? `${C.blue}18` : "transparent";
                        e.currentTarget.style.borderColor = isBookmarked ? C.blue : C.border;
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.8 }}>
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span style={{ fontWeight:700 }}>Save</span>
                    </button>
                  </div>
                </div>

                <div style={{ padding:"24px 20px" }}>
                  <p style={{ margin:"0 0 20px", fontSize:15, fontWeight:800, color:C.navy, lineHeight:1.7, letterSpacing:"-0.3px" }}>{q.text}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi;
                      return (
                        <button key={oi} type="button"
                          onClick={() => {
                            const newAns = [...answers];
                            newAns[qi] = oi;
                            setAnswers(newAns);
                          }}
                          style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12,
                            border:`1.5px solid ${isChosen ? C.blue : C.border}`,
                            background: isChosen ? `linear-gradient(135deg, ${C.blue}18, ${C.blue}08)` : C.bg,
                            cursor:"pointer", textAlign:"left", fontFamily:C.font, transition:"all 0.15s",
                            boxShadow: isChosen ? `0 2px 8px ${C.blue}22` : "none",
                          }}
                          onMouseEnter={(e) => {
                            if(!isChosen) {
                              e.currentTarget.style.borderColor = C.blue;
                              e.currentTarget.style.background = `${C.blue}08`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if(!isChosen) {
                              e.currentTarget.style.borderColor = C.border;
                              e.currentTarget.style.background = C.bg;
                            }
                          }}>
                          <div style={{ width:24, height:24, borderRadius:"50%", border:`2.5px solid ${isChosen ? C.blue : C.border}`, background:isChosen ? C.blue : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s", boxShadow: isChosen ? `0 2px 6px ${C.blue}44` : "none" }}>
                            {isChosen && <div style={{ width:9, height:9, borderRadius:"50%", background:"#fff" }}/>}
                          </div>
                          <span style={{ fontSize:14, fontWeight: isChosen ? 700 : 500, color: isChosen ? C.navy : C.body, lineHeight:1.5 }}>
                            <strong style={{ color:C.muted, marginRight:8, fontWeight:800 }}>{String.fromCharCode(65+oi)}.</strong>{opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
        </div>

        {/* Review Panel */}
        {(markedForReview.size > 0 || bookmarkedQuestions.size > 0) && (
          <div style={{ background:`linear-gradient(135deg, ${C.altBg}, #f9fbff)`, borderTop:`1.5px solid ${C.border}`, padding:"20px 32px", display:"flex", gap:32, flexWrap:"wrap", alignItems:"center", justifyContent:"center" }}>
            {markedForReview.size > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 16px", borderRadius:12, background:C.card, border:`1.5px solid ${C.orange}33`, boxShadow:"0 2px 8px #f973161a" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>
                    <svg style={{ display:"inline", width:12, height:12, marginRight:4, verticalAlign:"middle" }} viewBox="0 0 24 24" fill="currentColor" color={C.orange}>
                      <path d="M12 2L15.09 8.26H22L17.54 12.88L18.91 19.12L12 15.4L5.09 19.12L6.45 12.88L2 8.26H8.91L12 2Z"/>
                    </svg>
                    Review Later
                  </div>
                  <div style={{ fontSize:13, fontWeight:900, color:C.navy }}>{markedForReview.size}</div>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", maxWidth:300 }}>
                  {Array.from(markedForReview).map(qi => (
                    <button key={qi} onClick={() => document.getElementById(`q-${qi}`)?.scrollIntoView({ behavior:"smooth", block:"center" })}
                      style={{ minWidth:32, height:32, borderRadius:8, background:C.orange, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:11, transition:"all 0.2s", boxShadow:"0 2px 6px rgba(249, 115, 22, 0.3)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                      {qi + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {bookmarkedQuestions.size > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 16px", borderRadius:12, background:C.card, border:`1.5px solid ${C.blue}33`, boxShadow:"0 2px 8px #2563eb1a" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>
                    <svg style={{ display:"inline", width:12, height:12, marginRight:4, verticalAlign:"middle" }} viewBox="0 0 24 24" fill="currentColor" color={C.blue}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Bookmarked
                  </div>
                  <div style={{ fontSize:13, fontWeight:900, color:C.navy }}>{bookmarkedQuestions.size}</div>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", maxWidth:300 }}>
                  {Array.from(bookmarkedQuestions).map(qi => (
                    <button key={qi} onClick={() => document.getElementById(`q-${qi}`)?.scrollIntoView({ behavior:"smooth", block:"center" })}
                      style={{ minWidth:32, height:32, borderRadius:8, background:C.blue, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:11, transition:"all 0.2s", boxShadow:"0 2px 6px rgba(37, 99, 235, 0.3)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                      {qi + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit button bar - sticky at bottom */}
        <div style={{ background:C.card, borderTop:`1.5px solid ${C.border}`, padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 -4px 24px #1a3a6b10", flexShrink:0 }}>
          <div style={{ fontSize:13, color:C.muted }}>
            <span style={{ fontWeight:700, color:answeredCount === totalQ ? C.green : C.navy }}>{answeredCount}</span>/{totalQ} questions answered
            {answeredCount < totalQ && <span style={{ color:C.orange, marginLeft:6 }}>({totalQ - answeredCount} unanswered will be marked wrong)</span>}
          </div>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            style={{ padding:"12px 32px", borderRadius:12, background:submitting ? "#93c5fd" : C.blue, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:submitting ? "not-allowed" : "pointer", fontFamily:C.font, display:"flex", alignItems:"center", gap:8 }}>
            {submitting ? "Submitting…" : "Submit Quiz"}
            {!submitting && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:15,height:15 }}><path d="M5 13l4 4L19 7"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}
