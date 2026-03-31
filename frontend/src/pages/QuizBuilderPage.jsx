// QuizBuilderPage.jsx — Create quizzes from question bank
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { createQuiz } from "../api/quizApi";
import { notificationStore } from "../utils/notificationStore";

const C = {
  navy:"#1a3a6b", blue:"#2563eb", orange:"#f97316", green:"#16a34a", red:"#dc2626",
  bg:"#f5f8ff", card:"#ffffff", altBg:"#eaf0fb", border:"#dce8fb", muted:"#7a8faf", body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

const getQuizBuilderIcon = (type) => {
  const icons = {
    checkmark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:'100%', height:'100%' }}><path d="M5 13l4 4L19 7"/></svg>,
    chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M3 3v18h18M3 18l4-5 4 3 5-7 5 3"/></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 7H20v10a2 2 0 01-2 2H6.5a2 2 0 01-2-2V4.5z"/></svg>,
    back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:'100%', height:'100%' }}><path d="M15 18l-6-6 6-6"/></svg>,
  };
  return icons[type] || icons.checkmark;
};

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    duration: 60,
    scheduledDateTime: "",
    subject: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizTitle, setCreatedQuizTitle] = useState("");

  // Load questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("questionBank");
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuestions(parsed);
      // Extract unique subjects
      const subs = [...new Set(parsed.map(q => q.subject))];
      setSubjects(subs);
    }
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchSubject = !filterSubject || q.subject === filterSubject;
    const matchDifficulty = !filterDifficulty || q.difficulty === filterDifficulty;
    return matchSubject && matchDifficulty;
  });

  const toggleQuestion = (id) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestions(newSet);
  };

  const selectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title) {
      alert("Please enter quiz title");
      return;
    }
    if (selectedQuestions.size === 0) {
      alert("Please select at least one question");
      return;
    }
    if (!quizForm.scheduledDateTime) {
      alert("Please select quiz date and time");
      return;
    }

    setCreatingQuiz(true);
    try {
      // Get all selected questions (not just filtered ones)
      const selectedQuizQuestions = questions.filter(q => selectedQuestions.has(q.id));

      // Create quiz payload for API (match backend QuizRequest structure)
      const quizPayload = {
        title: quizForm.title,
        subject: quizForm.subject || "General",
        durationMinutes: parseInt(quizForm.duration),
        scheduledDateTime: quizForm.scheduledDateTime,
        questions: selectedQuizQuestions.map(q => ({
          text: q.text,
          options: q.options,
          correctOption: q.correctAnswerIndex,
        })),
      };

      const response = await createQuiz(quizPayload);
      
      // Show success notification
      notificationStore.notifyQuizCreated(quizPayload.title);
      
      // Show success modal with View Dashboard option
      setCreatedQuizTitle(quizPayload.title);
      setShowSuccessModal(true);
      
      // Reset form and selections
      setQuizForm({ title: "", description: "", duration: 60, scheduledDateTime: "", subject: "" });
      setSelectedQuestions(new Set());
    } catch (err) {
      console.error("Error creating quiz:", err);
      let errorMsg = "Failed to create quiz";
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(errorMsg);      
    } finally {
      setCreatingQuiz(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Quiz Builder" activeNav="create">
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:C.font, padding:"32px 20px" }}>
        <div style={{ maxWidth:1400, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:32, fontWeight:900, color:C.navy, margin:0 }}>Quiz Builder</h1>
            <p style={{ fontSize:14, color:C.muted, margin:"8px 0 0" }}>Create quizzes from your question bank</p>
          </div>
          <button onClick={() => navigate(-1)}
            style={{ padding:"12px 32px", borderRadius:12, background:C.altBg, border:`1.5px solid ${C.border}`, fontWeight:700, cursor:"pointer", fontFamily:C.font, display:"flex", alignItems:"center", gap:8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:16, height:16 }}><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24, alignItems:"start" }}>
          {/* Left: Quiz Form */}
          <div style={{ background:C.card, borderRadius:16, padding:24, border:`1.5px solid ${C.border}`, height:"fit-content" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:28, height:28, borderRadius:10, background:C.altBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width:15, height:15 }}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 style={{ margin:0, fontSize:13, fontWeight:800, color:C.navy }}>Quiz Details</h3>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Quiz Title *</label>
              <input type="text" placeholder="e.g., Python Basics Quiz" value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, fontSize:13, boxSizing:"border-box" }}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Subject</label>
              <input type="text" placeholder="e.g. Programming" value={quizForm.subject} onChange={e => setQuizForm({...quizForm, subject: e.target.value})}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, fontSize:13, boxSizing:"border-box" }}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Duration (minutes) *</label>
              <input type="number" min="5" max="480" value={quizForm.duration} onChange={e => setQuizForm({...quizForm, duration: parseInt(e.target.value)})}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, fontSize:13, boxSizing:"border-box" }}/>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Date & Time *</label>
              <input type="datetime-local" value={quizForm.scheduledDateTime} onChange={e => setQuizForm({...quizForm, scheduledDateTime: e.target.value})}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, fontSize:13, boxSizing:"border-box" }}/>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Description</label>
              <textarea placeholder="Optional instructions or context…" value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})}
                style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, minHeight:70, resize:"none", fontSize:13, boxSizing:"border-box" }}/>
            </div>

            <div style={{ background:C.altBg, borderRadius:8, padding:12, marginBottom:16, fontSize:12, color:C.body }}>
              <div style={{ fontWeight:700, marginBottom:4, display:"flex", alignItems:"center", gap:6 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16, color:C.navy }}><path d="M3 3v18h18M3 18l4-5 4 3 5-7 5 3"/></svg>
                Selected: {selectedQuestions.size} questions
              </div>
              <div style={{ fontSize:11, color:C.muted }}>Total: {filteredQuestions.length} available</div>
            </div>

            <button onClick={handleCreateQuiz} disabled={selectedQuestions.size === 0 || creatingQuiz}
              style={{
                width:"100%",
                padding:12,
                borderRadius:8,
                background: (selectedQuestions.size > 0 && !creatingQuiz) ? C.green : "#ccc",
                color:"#fff",
                border:"none",
                fontWeight:700,
                cursor: (selectedQuestions.size > 0 && !creatingQuiz) ? "pointer" : "not-allowed",
                fontFamily:C.font,
                marginBottom:8,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:8,
              }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:16, height:16 }}><path d="M5 13l4 4L19 7"/></svg>
              {creatingQuiz ? "Creating..." : "Create Quiz"}
            </button>
            <button onClick={() => navigate("/examiner/question-bank")}
              style={{
                width:"100%",
                padding:12,
                borderRadius:8,
                background:C.altBg,
                border:`1px solid ${C.border}`,
                fontWeight:700,
                cursor:"pointer",
                fontFamily:C.font,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:8,
              }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16, color:C.navy }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 7H20v10a2 2 0 01-2 2H6.5a2 2 0 01-2-2V4.5z"/></svg>
              Manage Questions
            </button>
          </div>

          {/* Right: Question Selection */}
          <div>
            {/* Filters */}
            <div style={{ background:C.card, borderRadius:16, padding:20, border:`1.5px solid ${C.border}`, marginBottom:24, display:"flex", gap:16, alignItems:"flex-end" }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Subject</label>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                  style={{ width:"100%", padding:10, borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, boxSizing:"border-box" }}>
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Difficulty</label>
                <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
                  style={{ width:"100%", padding:10, borderRadius:8, border:`1.5px solid ${C.border}`, fontFamily:C.font, boxSizing:"border-box" }}>
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button onClick={selectAll}
                style={{
                  padding:"10px 16px",
                  borderRadius:8,
                  background:selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0 ? C.green : C.blue,
                  color:"#fff",
                  border:"none",
                  fontWeight:700,
                  cursor:"pointer",
                  fontFamily:C.font,
                  fontSize:12,
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:14, height:14 }}><path d="M5 13l4 4L19 7"/></svg>
                {selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0 ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Questions List */}
            <div style={{ display:"grid", gap:16 }}>
              {filteredQuestions.length === 0 ? (
                <div style={{ background:C.card, borderRadius:16, padding:40, textAlign:"center", border:`1.5px solid ${C.border}` }}>
                  <p style={{ color:C.muted, fontSize:14 }}>No questions match your filters</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isSelected = selectedQuestions.has(q.id);
                  return (
                    <div key={q.id} onClick={() => toggleQuestion(q.id)}
                      style={{
                        background:C.card,
                        borderRadius:16,
                        padding:20,
                        border:`1.5px solid ${isSelected ? C.blue : C.border}`,
                        boxShadow: isSelected ? `0 0 0 3px ${C.blue}20` : "0 2px 10px #1a3a6b08",
                        cursor:"pointer",
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 12px #1a3a6b12`;
                        e.currentTarget.style.borderColor = C.blue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = isSelected ? `0 0 0 3px ${C.blue}20` : "0 2px 10px #1a3a6b08";
                        e.currentTarget.style.borderColor = isSelected ? C.blue : C.border;
                      }}>
                      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                        {/* Checkbox */}
                        <input type="checkbox" checked={isSelected} readOnly
                          style={{ width:20, height:20, cursor:"pointer", marginTop:2, accentColor:C.blue }}/>
                        
                        {/* Question */}
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8 }}>
                            {q.subject} • <span style={{ color:q.difficulty === "easy" ? C.green : q.difficulty === "medium" ? C.orange : C.red }}>
                              {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                            </span>
                          </div>
                          <p style={{ fontSize:15, fontWeight:700, color:C.navy, margin:"0 0 12px" }}>{q.text}</p>
                          <div style={{ display:"grid", gap:8 }}>
                            {q.options.map((opt, i) => (
                              <div key={i} style={{ padding:10, borderRadius:8, background:i === q.correctAnswerIndex ? "#d1fae5" : C.altBg, border:`1px solid ${i === q.correctAnswerIndex ? "#10b981" : C.border}`, fontSize:12, fontWeight:i === q.correctAnswerIndex ? 700 : 400, display:"flex", alignItems:"center", gap:8 }}>
                                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                                {i === q.correctAnswerIndex && <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{ width:14, height:14, marginLeft:"auto", flexShrink:0 }}><path d="M5 13l4 4L19 7"/></svg>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div style={{ fontSize:20, flexShrink:0, color:C.green }}>
                          {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:18, height:18 }}><path d="M5 13l4 4L19 7"/></svg>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position:"fixed",
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:"rgba(0, 0, 0, 0.5)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          zIndex:2000,
          animation:"fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background:C.card,
            borderRadius:20,
            padding:48,
            maxWidth:450,
            textAlign:"center",
            boxShadow:"0 20px 60px rgba(0, 0, 0, 0.2)",
            border:`1.5px solid ${C.border}`,
            animation:"slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            {/* Success Icon */}
            <div style={{
              width:80,
              height:80,
              borderRadius:"50%",
              background:`${C.green}15`,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              margin:"0 auto 24px",
              animation:"scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" style={{ width:40, height:40 }}>
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize:24,
              fontWeight:900,
              color:C.navy,
              margin:"0 0 12px",
              letterSpacing:"-0.5px"
            }}>
              Quiz Created!
            </h2>

            {/* Message */}
            <p style={{
              fontSize:14,
              color:C.body,
              margin:"0 0 28px",
              lineHeight:1.6
            }}>
              <strong>"{createdQuizTitle}"</strong> has been created successfully and is ready for students to attempt.
            </p>

            {/* Buttons */}
            <div style={{
              display:"flex",
              gap:12,
              justifyContent:"center"
            }}>
              <button onClick={() => setShowSuccessModal(false)}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:12,
                  background:C.altBg,
                  border:`1.5px solid ${C.border}`,
                  color:C.navy,
                  fontWeight:700,
                  fontSize:13,
                  cursor:"pointer",
                  fontFamily:C.font,
                  transition:"all 0.2s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.bg;
                  e.currentTarget.style.borderColor = C.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.altBg;
                  e.currentTarget.style.borderColor = C.border;
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M15 18l-6-6 6-6"/></svg>
                Build Another
              </button>
              <button onClick={() => {
                setShowSuccessModal(false);
                navigate("/examiner");
              }}
                style={{
                  flex:1,
                  padding:14,
                  borderRadius:12,
                  background:C.green,
                  border:`1.5px solid ${C.green}`,
                  color:"#fff",
                  fontWeight:700,
                  fontSize:13,
                  cursor:"pointer",
                  fontFamily:C.font,
                  transition:"all 0.2s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${C.green}dd`;
                  e.currentTarget.style.boxShadow = `0 8px 20px ${C.green}44`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.green;
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M12 3l9 9M3 12l9-9 9 9M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

