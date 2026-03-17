// ExaminerCreateQuiz.jsx — Google-Forms-style quiz builder
import { useState, useEffect } from "react";
import { createQuiz, updateQuiz, getQuizById } from "../api/quizApi";
import { useSearchParams, useNavigate } from "react-router-dom";

const C = {
  navy:"#1a3a6b",blue:"#2563eb",orange:"#f97316",green:"#16a34a",red:"#dc2626",purple:"#7c3aed",
  bg:"#f5f8ff",card:"#ffffff",altBg:"#eaf0fb",border:"#dce8fb",muted:"#7a8faf",body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

const Q_TYPES = [
  { value:"mcq",       label:"Multiple Choice (MCQ)" },
  { value:"msq",       label:"Multiple Select (MSQ)" },
  { value:"truefalse", label:"True / False" },
  { value:"short",     label:"Short Answer" },
];

function inputStyle(focused) {
  return { width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${focused?C.blue:C.border}`,background:C.bg,color:C.navy,fontSize:14,fontFamily:C.font,outline:"none",boxSizing:"border-box",transition:"border-color 0.18s" };
}
function labelStyle() {
  return { fontSize:13,fontWeight:700,color:C.navy,marginBottom:6,display:"block" };
}
function sectionCard(children, extraStyle) {
  return (
    <div style={{ background:C.card,borderRadius:16,border:`1.5px solid ${C.border}`,padding:"22px 24px",boxShadow:"0 2px 12px #1a3a6b08",...extraStyle }}>
      {children}
    </div>
  );
}

// ── Focusable Input
function FInput({ label, name, type="text", placeholder, value, onChange, required }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex",flexDirection:"column" }}>
      {label && <label style={labelStyle()}>{label}{required && <span style={{ color:C.red }}> *</span>}</label>}
      <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={inputStyle(f)} />
    </div>
  );
}

// ── Select
function FSelect({ label, value, onChange, options, required }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex",flexDirection:"column" }}>
      {label && <label style={labelStyle()}>{label}{required && <span style={{ color:C.red }}> *</span>}</label>}
      <select value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ ...inputStyle(f),appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237a8faf' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:36 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Textarea
function FTextarea({ label, placeholder, value, onChange, rows=3, required }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex",flexDirection:"column" }}>
      {label && <label style={labelStyle()}>{label}{required && <span style={{ color:C.red }}> *</span>}</label>}
      <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ ...inputStyle(f),resize:"vertical",lineHeight:1.55 }} />
    </div>
  );
}

// ── Single Question Card
function QuestionCard({ q, idx, onChange, onRemove, onDuplicate }) {
  const updateField = (field, val) => onChange({ ...q, [field]: val });
  const updateOption = (i, val) => {
    const opts = [...q.options];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };
  const addOption = () => onChange({ ...q, options: [...q.options, ""] });
  const removeOption = i => {
    const opts = q.options.filter((_,oi) => oi !== i);
    // also fix correctAnswer if needed
    let ca = q.correctAnswer;
    if (q.type === "mcq"  && ca === i)  ca = null;
    if (q.type === "mcq"  && ca > i)    ca = ca - 1;
    onChange({ ...q, options: opts, correctAnswer: ca });
  };
  const toggleMSQ = i => {
    const set = new Set(q.correctAnswer || []);
    set.has(i) ? set.delete(i) : set.add(i);
    onChange({ ...q, correctAnswer: [...set] });
  };

  const isMCQ        = q.type === "mcq";
  const isMSQ        = q.type === "msq";
  const isTF         = q.type === "truefalse";
  const isShort      = q.type === "short";
  const hasOptions   = isMCQ || isMSQ || isTF;
  const tfOptions    = ["True","False"];
  const displayOpts  = isTF ? tfOptions : q.options;

  return (
    <div style={{ background:C.card,borderRadius:16,border:`1.5px solid ${C.border}`,overflow:"hidden",boxShadow:"0 2px 10px #1a3a6b0a" }}>
      {/* Question header bar */}
      <div style={{ background:C.altBg,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:26,height:26,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0 }}>{idx+1}</div>
          <span style={{ fontSize:12,fontWeight:700,color:C.muted }}>Question {idx+1}</span>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          <ActionBtn title="Duplicate" color={C.blue} onClick={onDuplicate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </ActionBtn>
          <ActionBtn title="Remove" color={C.red} onClick={onRemove}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </ActionBtn>
        </div>
      </div>

      <div style={{ padding:"20px 22px",display:"flex",flexDirection:"column",gap:16 }}>
        {/* Question text + type row */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:14,alignItems:"flex-start" }}>
          <FTextarea
            label="Question Text" placeholder="Enter your question here…" value={q.text} rows={2}
            onChange={e => updateField("text", e.target.value)} required />
          <div style={{ minWidth:220 }}>
            <FSelect label="Question Type" value={q.type} options={Q_TYPES}
              onChange={e => {
                const t = e.target.value;
                updateField("type", t);
                onChange({ ...q, type:t, correctAnswer: t==="msq"?[]:(t==="truefalse"?null:null) });
              }} />
          </div>
        </div>

        {/* Marks + Required row */}
        <div style={{ display:"grid",gridTemplateColumns:"120px 1fr",gap:14,alignItems:"flex-end" }}>
          <FInput label="Marks" type="number" placeholder="e.g. 2" value={q.marks}
            onChange={e => updateField("marks", e.target.value)} />
          <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingBottom:2 }}>
            <div onClick={() => updateField("required",!q.required)}
              style={{ width:20,height:20,borderRadius:5,border:`2px solid ${q.required?C.blue:C.border}`,background:q.required?C.blue:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s" }}>
              {q.required && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width:11,height:11 }}><path d="M5 13l4 4L19 7"/></svg>}
            </div>
            <span style={{ fontSize:13,fontWeight:600,color:C.body }}>Required question</span>
          </label>
        </div>

        {/* Options */}
        {hasOptions && (
          <div>
            <label style={labelStyle()}>
              Options & Correct Answer
              <span style={{ fontSize:11,fontWeight:500,color:C.muted,marginLeft:6 }}>
                {isMCQ?"Select ONE correct answer":isMSQ?"Select ALL correct answers":"Select correct"}
              </span>
            </label>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {displayOpts.map((opt,i) => {
                const isCorrectMCQ = !isMSQ && !isTF ? q.correctAnswer === i : isTF ? q.correctAnswer === i : false;
                const isCorrectMSQ = isMSQ && (q.correctAnswer||[]).includes(i);
                const isTFCorrect  = isTF && q.correctAnswer === i;
                const isMarked     = isCorrectMCQ || isCorrectMSQ || isTFCorrect;
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {/* Correct answer toggle */}
                    <button type="button"
                      onClick={() => {
                        if (isMSQ) toggleMSQ(i);
                        else updateField("correctAnswer", q.correctAnswer===i ? null : i);
                      }}
                      title="Mark as correct answer"
                      style={{ width:22,height:22,borderRadius: isMSQ?"5px":"50%",border:`2px solid ${isMarked?C.green:C.border}`,background:isMarked?C.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s",padding:0 }}>
                      {isMarked && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width:11,height:11 }}><path d="M5 13l4 4L19 7"/></svg>}
                    </button>
                    {isTF ? (
                      <div style={{ flex:1,padding:"10px 14px",borderRadius:10,background:isMarked?"#f0fdf4":C.bg,border:`1.5px solid ${isMarked?"#86efac":C.border}`,fontSize:13,fontWeight:700,color:isMarked?C.green:C.navy }}>
                        {opt}
                      </div>
                    ) : (
                      <div style={{ flex:1,position:"relative" }}>
                        <input value={opt} placeholder={`Option ${String.fromCharCode(65+i)}`}
                          onChange={e => updateOption(i, e.target.value)}
                          style={{ width:"100%",padding:"10px 40px 10px 14px",borderRadius:10,border:`1.5px solid ${isMarked?"#86efac":C.border}`,background:isMarked?"#f0fdf4":C.bg,color:isMarked?C.green:C.navy,fontSize:13,fontFamily:C.font,outline:"none",boxSizing:"border-box" }}/>
                        {isMarked && <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,fontWeight:700,color:C.green }}>✓</span>}
                      </div>
                    )}
                    {!isTF && q.options.length > 2 && (
                      <button type="button" onClick={()=>removeOption(i)}
                        style={{ width:24,height:24,borderRadius:"50%",background:"#fef2f2",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.red }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:12,height:12 }}><path d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                );
              })}
              {!isTF && (
                <button type="button" onClick={addOption}
                  style={{ alignSelf:"flex-start",display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1.5px dashed ${C.border}`,background:"transparent",color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:C.font,transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:13,height:13 }}><path d="M12 5v14M5 12h14"/></svg>
                  Add option
                </button>
              )}
            </div>
          </div>
        )}

        {isShort && (
          <div style={{ padding:"12px 16px",borderRadius:10,background:C.bg,border:`1.5px dashed ${C.border}` }}>
            <div style={{ fontSize:12,color:C.muted,fontWeight:600 }}>Short answer — candidate types free text</div>
            <FInput label="" placeholder="Model answer (for auto-grading hint)" value={q.correctAnswer||""}
              onChange={e=>updateField("correctAnswer",e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, children, title }) {
  const [h,setH]=useState(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:28,height:28,borderRadius:8,border:`1.5px solid ${h?color:C.border}`,background:h?`${color}10`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:h?color:C.muted,transition:"all 0.15s" }}>
      {children}
    </button>
  );
}

const defaultQuestion = () => ({
  id: Date.now() + Math.random(),
  text: "", type:"mcq", marks:"1", required:true,
  options:["","","",""],
  correctAnswer: null,
});



export default function ExaminerCreateQuizDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("editId");
  const copyData = searchParams.get("copyData");
  
  const [meta, setMeta]           = useState({ title:"", subject:"", description:"", date:"", time:"", duration:"30", totalMarks:"" });
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [submitted, setSubmitted] = useState(false);
  const [hov, setHov]             = useState(null);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState(null);
  const [editLoading, setEditLoading] = useState(editId ? true : false);

  const setM = (field,val) => setMeta(p => ({ ...p,[field]:val }));

  const updateQ = (i,q) => { const qs=[...questions]; qs[i]=q; setQuestions(qs); };
  const removeQ = i => setQuestions(questions.filter((_,qi)=>qi!==i));
  const dupQ    = i => { const qs=[...questions]; qs.splice(i+1,0,{...questions[i],id:Date.now()}); setQuestions(qs); };
  const addQ    = () => setQuestions([...questions,defaultQuestion()]);

  // Helper function to decode base64
  const decodeBase64 = (str) => {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    } catch (e) {
      return JSON.parse(atob(str));
    }
  };

  // Load quiz data if in edit mode or copy mode
  useEffect(() => {
    if (copyData) {
      try {
        const decodedData = decodeBase64(copyData);
        setMeta({
          title: decodedData.title || "",
          subject: decodedData.subject || "",
          description: "",
          date: "",
          time: "",
          duration: decodedData.durationMinutes ? decodedData.durationMinutes.toString() : "30",
          totalMarks: ""
        });
        
        const loadedQuestions = (decodedData.questions || []).map((q, idx) => ({
          id: q.id || Date.now() + idx,
          text: q.text || "",
          type: q.type || "mcq",
          marks: "1",
          required: true,
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null
        }));
        setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [defaultQuestion()]);
        setEditLoading(false);
      } catch (e) {
        setErr("Failed to copy quiz: " + e.message);
        setEditLoading(false);
      }
    } else if (editId) {
      getQuizById(editId)
        .then(quiz => {
          setMeta({
            title: quiz.title,
            subject: quiz.subject,
            description: "",
            date: quiz.scheduledDateTime ? quiz.scheduledDateTime.split('T')[0] : "",
            time: quiz.scheduledDateTime ? quiz.scheduledDateTime.split('T')[1].substring(0, 5) : "",
            duration: quiz.durationMinutes.toString(),
            totalMarks: ""
          });
          
          const loadedQuestions = quiz.questions.map((q, idx) => ({
            id: q.id || Date.now() + idx,
            text: q.text,
            type: "mcq",
            marks: "1",
            required: true,
            options: q.options || [],
            correctAnswer: null
          }));
          setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [defaultQuestion()]);
          setEditLoading(false);
        })
        .catch(e => {
          setErr("Failed to load quiz: " + e.message);
          setEditLoading(false);
        });
    }
  }, [editId, copyData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    // Validate date and time
    if (!meta.date || !meta.time) {
      setErr("Please set both date and time for the quiz.");
      return;
    }

    // Only MCQ + TF are supported by the backend
    const submittable = questions.filter(q => q.type === "mcq" || q.type === "truefalse");
    const skipped     = questions.length - submittable.length;

    if (submittable.length === 0) {
      setErr("Add at least one Multiple Choice or True/False question.");
      return;
    }

    for (let i = 0; i < submittable.length; i++) {
      const q = submittable[i];
      if (!q.text.trim()) { setErr(`Question ${i+1}: Question text is required.`); return; }
      if (q.correctAnswer === null || q.correctAnswer === undefined) {
        setErr(`Question ${i+1}: Please mark the correct answer.`);
        return;
      }
      if (q.type === "mcq") {
        const filled = q.options.filter(o => o.trim());
        if (filled.length < 2) { setErr(`Question ${i+1}: At least 2 options are required.`); return; }
      }
    }

    // Combine date and time into ISO datetime string
    const scheduledDateTime = `${meta.date}T${meta.time}:00`;

    const payload = {
      title:           meta.title,
      subject:         meta.subject,
      durationMinutes: parseInt(meta.duration) || 30,
      scheduledDateTime: scheduledDateTime,
      questions: submittable.map(q => ({
        text:          q.text,
        options:       q.type === "truefalse" ? ["True","False"] : q.options.filter(o => o.trim()),
        correctOption: q.correctAnswer,
      })),
    };

    setLoading(true);
    try {
      if (editId) {
        await updateQuiz(editId, payload);
        setSubmitted({ title: meta.title, skipped, isEdit: true });
      } else {
        await createQuiz(payload);
        setSubmitted({ title: meta.title, skipped, isEdit: false });
      }
    } catch (e) {
      setErr(e.message || "Failed to save quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (editLoading) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",fontFamily:C.font }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:16,color:C.body, marginBottom:8 }}>Loading quiz...</div>
          <div style={{ width:40,height:40,borderRadius:"50%",border:`3px solid ${C.border}`,borderTop:`3px solid ${C.blue}`,margin:"0 auto",animation:"spin 1s linear infinite" }}/>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",fontFamily:C.font }}>
        <div style={{ background:C.card,borderRadius:20,padding:"48px 40px",textAlign:"center",border:`1.5px solid ${C.border}`,maxWidth:480 }}>
          <div style={{ width:64,height:64,borderRadius:"50%",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28 }}>✅</div>
          <h2 style={{ margin:"0 0 8px",fontSize:22,fontWeight:900,color:C.navy }}>{submitted.isEdit ? "Quiz Updated!" : "Quiz Published!"}</h2>
          <p style={{ margin:"0 0 8px",fontSize:14,color:C.muted }}>"{submitted.title}" has been {submitted.isEdit ? "updated" : "published"} successfully.</p>
          {submitted.skipped > 0 && (
            <p style={{ margin:"0 0 24px",fontSize:12,color:C.orange }}>
              Note: {submitted.skipped} MSQ/Short Answer question{submitted.skipped>1?"s were":" was"} skipped (not yet supported).
            </p>
          )}
          <button onClick={()=> { navigate("/examiner/dashboard"); }}
            style={{ padding:"12px 28px",borderRadius:12,background:C.blue,color:"#fff",border:"none",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:C.font }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:18,fontFamily:C.font,maxWidth:860 }}>

      {/* ── Header strip */}
      <div style={{ background:C.navy,borderRadius:18,padding:"20px 26px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:11,color:"#a8c0e0",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Quiz Builder</div>
          <div style={{ fontSize:18,fontWeight:900,color:"#fff" }}>{copyData ? "Copy Quiz" : editId ? "Edit Quiz" : "Create New Quiz"}</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:12,color:"#a8c0e0" }}>{questions.length} question{questions.length!==1?"s":""}</span>
          <div style={{ width:6,height:6,borderRadius:"50%",background:C.orange }}/>
        </div>
      </div>

      {/* ── Quiz Metadata */}
      {sectionCard(
        <>
          <div style={{ fontSize:14,fontWeight:800,color:C.navy,marginBottom:18,display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:C.altBg,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width:15,height:15 }}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            Quiz Details
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <FInput label="Quiz Title" placeholder="e.g. Python for DS — Week 8 Assignment" value={meta.title} onChange={e=>setM("title",e.target.value)} required />
            <FInput label="Subject" placeholder="e.g. Python for Data Science" value={meta.subject} onChange={e=>setM("subject",e.target.value)} required />
          </div>
          <div style={{ marginTop:14 }}>
            <FTextarea label="Description / Instructions" placeholder="Provide any instructions or context for the candidate…" value={meta.description} onChange={e=>setM("description",e.target.value)} rows={2} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginTop:14 }}>
            <FInput label="Date of Exam" type="date" value={meta.date} onChange={e=>setM("date",e.target.value)} required />
            <FInput label="Time" type="time" value={meta.time} onChange={e=>setM("time",e.target.value)} required />
            <FInput label="Duration (mins)" type="number" placeholder="e.g. 45" value={meta.duration} onChange={e=>setM("duration",e.target.value)} required />
            <FInput label="Total Marks" type="number" placeholder="e.g. 20" value={meta.totalMarks} onChange={e=>setM("totalMarks",e.target.value)} required />
          </div>
        </>
      )}

      {/* ── Questions */}
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {questions.map((q,i) => (
          <QuestionCard key={q.id} q={q} idx={i}
            onChange={nq => updateQ(i,nq)}
            onRemove={() => removeQ(i)}
            onDuplicate={() => dupQ(i)} />
        ))}
      </div>

      {/* ── Add question / submit */}
      <div style={{ display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
        <button type="button" onClick={addQ}
          onMouseEnter={()=>setHov("add")} onMouseLeave={()=>setHov(null)}
          style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 22px",borderRadius:12,border:`1.5px dashed ${hov==="add"?C.blue:C.border}`,background:hov==="add"?C.altBg:"transparent",color:hov==="add"?C.blue:C.body,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:C.font,transition:"all 0.18s" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:16,height:16 }}><path d="M12 5v14M5 12h14"/></svg>
          Add Question
        </button>
        <div style={{ flex:1 }}/>

        {/* Error banner */}
        {err && (
          <div style={{ fontSize:12,color:C.red,background:"#fef2f2",border:`1px solid #fca5a5`,borderRadius:10,padding:"8px 14px",maxWidth:360 }}>
            {err}
          </div>
        )}

        <button type="submit" disabled={loading}
          onMouseEnter={()=>setHov("sub")} onMouseLeave={()=>setHov(null)}
          style={{ padding:"12px 28px",borderRadius:12,border:"none",background:loading?"#93c5fd":hov==="sub"?"#1d53d4":C.blue,color:"#fff",fontSize:14,fontWeight:800,cursor:loading?"not-allowed":"pointer",fontFamily:C.font,display:"flex",alignItems:"center",gap:8,transition:"background 0.18s",boxShadow:`0 4px 16px ${C.blue}28` }}>
          {loading ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:15,height:15,animation:"spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {editId ? "Updating…" : "Publishing…"}
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:15,height:15 }}><path d="M5 13l4 4L19 7"/></svg>
              {editId ? "Update Quiz" : "Publish Quiz"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}