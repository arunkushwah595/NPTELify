// ImportQuestionsPage.jsx — Bulk CSV import and preview
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

const C = {
  navy:"#1a3a6b", blue:"#2563eb", orange:"#f97316", green:"#16a34a", red:"#dc2626",
  bg:"#f5f8ff", card:"#ffffff", altBg:"#eaf0fb", border:"#dce8fb", muted:"#7a8faf", body:"#4a6490",
  font:"'DM Sans','Segoe UI',sans-serif",
};

const getImportIcon = (type) => {
  const icons = {
    folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    document: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M4 7v12a2 2 0 002 2h12a2 2 0 002-2V7M9 7h6M9 11h6M9 15h2M4 7h16M9 3h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"/></svg>,
    checkmark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:'100%', height:'100%' }}><path d="M5 13l4 4L19 7"/></svg>,
    alertTriangle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:'100%', height:'100%' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  };
  return icons[type] || icons.document;
};

export default function ImportQuestionsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [csvData, setCSVData] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);

  const parseCSV = (csv) => {
    const lines = csv.split("\n").filter(l => l.trim());
    const parsed = [];
    const errs = [];

    if (lines.length < 2) {
      setErrors(["CSV file must have header + at least 1 data row"]);
      return;
    }

    // Format: Question,Option1,Option2,Option3,Option4,CorrectAnswerIndex,Subject,Difficulty
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      
      // Validate row
      if (cols.length < 8) {
        errs.push(`Row ${i + 1}: Missing columns (need 8: Question, Option1-4, CorrectIndex, Subject, Difficulty)`);
        continue;
      }

      const [text, opt1, opt2, opt3, opt4, correctIdx, subject, difficulty] = cols;

      // Validate fields
      if (!text) {
        errs.push(`Row ${i + 1}: Question text is empty`);
        continue;
      }
      if (!opt1 || !opt2 || !opt3 || !opt4) {
        errs.push(`Row ${i + 1}: All 4 options required`);
        continue;
      }
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
        errs.push(`Row ${i + 1}: Correct answer index must be 0-3`);
        continue;
      }
      if (!subject) {
        errs.push(`Row ${i + 1}: Subject is required`);
        continue;
      }
      if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
        errs.push(`Row ${i + 1}: Difficulty must be easy/medium/hard`);
        continue;
      }

      // Filter out "N/A" options for true/false questions
      let allOptions = [opt1, opt2, opt3, opt4];
      let validOptions = allOptions.filter(o => o.toUpperCase() !== "N/A");
      let newCorrectIdx = parseInt(correctIdx);
      
      // If we filtered out options, adjust the correct index
      if (validOptions.length < allOptions.length) {
        // For true/false questions, we only keep the valid options
        newCorrectIdx = validOptions.findIndex(o => o === allOptions[parseInt(correctIdx)]);
      }

      parsed.push({
        rowNumber: i + 1,
        text,
        options: validOptions,
        correctAnswerIndex: newCorrectIdx,
        subject,
        difficulty: difficulty.toLowerCase(),
      });
    }

    setErrors(errs);
    setParsedQuestions(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        setCSVData(content);
        parseCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedQuestions.length === 0) {
      alert("No valid questions to import");
      return;
    }

    setImporting(true);

    // Get existing questions from question bank
    const existing = JSON.parse(localStorage.getItem("questionBank") || "[]");
    
    // Convert parsed questions to full format with IDs
    const newQuestions = parsedQuestions.map((q, idx) => ({
      ...q,
      id: Date.now() + idx,
    }));

    // Save to localStorage
    localStorage.setItem("questionBank", JSON.stringify([...existing, ...newQuestions]));

    // Show success and redirect
    alert(`Imported ${newQuestions.length} questions successfully!`);
    setImporting(false);
    navigate("/examiner/question-bank");
  };

  return (
    <DashboardLayout pageTitle="Import Questions" activeNav="question-bank">
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:C.font, padding:"32px 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:32, fontWeight:900, color:C.navy, margin:0 }}>Import Questions from CSV</h1>
          <p style={{ fontSize:14, color:C.muted, margin:"8px 0 0" }}>Bulk upload questions to your question bank</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          {/* Left: Upload & Instructions */}
          <div>
            {/* Upload Card */}
            <div style={{ background:C.card, borderRadius:16, padding:24, border:`1.5px solid ${C.border}`, marginBottom:24 }}>
              <h3 style={{ margin:"0 0 16px", color:C.navy }}>Upload CSV File</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding:40,
                  borderRadius:12,
                  border:`2px dashed ${C.blue}`,
                  background:"#f0f9ff",
                  textAlign:"center",
                  cursor:"pointer",
                  transition:"all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.borderColor = C.navy;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f0f9ff";
                  e.currentTarget.style.borderColor = C.blue;
                }}
              >
                <div style={{ fontSize:32, marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>{getImportIcon('folder')}</div>
                <div style={{ fontWeight:700, color:C.navy, marginBottom:4 }}>Select CSV to import</div>
                <div style={{ fontSize:12, color:C.muted }}>or drag and drop</div>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display:"none" }} />
            </div>

            {/* Instructions */}
            <div style={{ background:C.card, borderRadius:16, padding:24, border:`1.5px solid ${C.border}` }}>
              <h3 style={{ margin:"0 0 16px", color:C.navy, display:"flex", alignItems:"center", gap:8 }}><span style={{ width:20, height:20, color:C.blue, flexShrink:0 }}>{getImportIcon('document')}</span>CSV Format Guide</h3>
              <div style={{ fontSize:12, color:C.body, lineHeight:1.8 }}>
                <p style={{ margin:"0 0 12px", fontWeight:700 }}>Your CSV file should have 8 columns in this order:</p>
                <ol style={{ margin:0, paddingLeft:20 }}>
                  <li>Question (text)</li>
                  <li>Option 1</li>
                  <li>Option 2</li>
                  <li>Option 3</li>
                  <li>Option 4</li>
                  <li>Correct Answer Index (0-3)</li>
                  <li>Subject (e.g., Math, Science)</li>
                  <li>Difficulty (easy/medium/hard)</li>
                </ol>

                <p style={{ margin:"12px 0 0", fontWeight:700 }}>Example row:</p>
                <div style={{ background:C.altBg, padding:12, borderRadius:8, fontSize:11, fontFamily:"monospace", marginTop:8, overflow:"auto" }}>
                  "What is 2+2?","3","4","5","6",1,"Math","easy"
                </div>

                <p style={{ margin:"12px 0 0", fontWeight:700, color:C.orange, display:"flex", alignItems:"center", gap:8 }}><span style={{ width:16, height:16, color:"inherit", flexShrink:0 }}>{getImportIcon('alertTriangle')}</span> Important Notes:</p>
                <ul style={{ margin:"8px 0 0", paddingLeft:20 }}>
                  <li>First row is treated as header - don't include it in data</li>
                  <li>Correct Index: 0=Option1, 1=Option2, 2=Option3, 3=Option4</li>
                  <li>Subject is optional but recommended</li>
                  <li>Max 1000 questions per import</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Preview & Import */}
          <div>
            {/* Preview Card */}
            <div style={{ background:C.card, borderRadius:16, padding:24, border:`1.5px solid ${C.border}`, marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ margin:0, color:C.navy }}>Preview</h3>
                {parsedQuestions.length > 0 && (
                  <span style={{ fontSize:12, fontWeight:700, color:C.green, background:"#d1fae5", padding:"4px 12px", borderRadius:999, display:"flex", alignItems:"center", gap:6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:14, height:14 }}><path d="M5 13l4 4L19 7"/></svg>
                    {parsedQuestions.length} valid questions
                  </span>
                )}
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div style={{ background:"#fff5f5", border:`1px solid #fca5a5`, borderRadius:8, padding:12, marginBottom:16 }}>
                  <div style={{ fontWeight:700, color:C.red, fontSize:12, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16, color:"inherit", flexShrink:0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {errors.length} Error(s)
                  </div>
                  <div style={{ maxHeight:120, overflowY:"auto", fontSize:11, color:C.red }}>
                    {errors.map((err, i) => (
                      <div key={i} style={{ marginBottom:4 }}>• {err}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Table */}
              <div style={{ maxHeight:400, overflowY:"auto" }}>
                {parsedQuestions.length > 0 ? (
                  <div style={{ fontSize:12 }}>
                    {parsedQuestions.slice(0, 5).map((q, idx) => (
                      <div key={q.rowNumber} style={{ marginBottom:16, padding:12, borderRadius:8, background:C.altBg, border:`1px solid ${C.border}` }}>
                        <div style={{ fontWeight:700, color:C.navy, marginBottom:6 }}>
                          Q{idx + 1}: {q.text.substring(0, 60)}{q.text.length > 60 ? "..." : ""}
                        </div>
                        <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>
                          {q.subject} • <span style={{ color:q.difficulty === "easy" ? C.green : q.difficulty === "medium" ? C.orange : C.red }}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div style={{ fontSize:11, color:C.body }}>
                          Options:
                          {q.options.map((opt, i) => (
                            <div key={i} style={{ marginLeft:12, marginTop:2, background: i === q.correctAnswerIndex ? "#d1fae5" : "transparent", padding:i === q.correctAnswerIndex ? 4 : 0, borderRadius:4 }}>
                              {String.fromCharCode(65 + i)}. {opt} {i === q.correctAnswerIndex && "✓"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {parsedQuestions.length > 5 && (
                      <div style={{ textAlign:"center", padding:16, color:C.muted, fontSize:12 }}>
                        ... and {parsedQuestions.length - 5} more questions
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign:"center", padding:40, color:C.muted }}>
                    Upload a CSV to see preview
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={handleImport} disabled={parsedQuestions.length === 0 || importing}
                style={{
                  flex:1,
                  padding:12,
                  borderRadius:8,
                  background: parsedQuestions.length > 0 && !importing ? C.green : "#ccc",
                  color:"#fff",
                  border:"none",
                  fontWeight:700,
                  cursor: parsedQuestions.length > 0 && !importing ? "pointer" : "not-allowed",
                  fontFamily:C.font,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8,
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:16, height:16 }}><path d="M5 13l4 4L19 7"/></svg>
                {importing ? "Importing..." : `Import ${parsedQuestions.length} Questions`}
              </button>
              <button onClick={() => navigate("/examiner/question-bank")}
                style={{
                  flex:1,
                  padding:12,
                  borderRadius:8,
                  background:C.altBg,
                  border:`1px solid ${C.border}`,
                  fontWeight:700,
                  cursor:"pointer",
                  fontFamily:C.font,
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* CSV Template Download */}
        <div style={{ marginTop:32, textAlign:"center", padding:24, background:C.card, borderRadius:16, border:`1.5px solid ${C.border}` }}>
          <h3 style={{ margin:"0 0 8px", color:C.navy }}>Need help getting started?</h3>
          <p style={{ margin:"0 0 16px", fontSize:12, color:C.muted }}>Download our template CSV file and fill in your questions</p>
          <button onClick={() => {
            const template = `Question,Option1,Option2,Option3,Option4,CorrectAnswerIndex,Subject,Difficulty
What is 2+2?,3,4,5,6,1,Math,easy
What is the capital of India?,Delhi,Mumbai,Bangalore,Pune,0,Geography,easy
Which programming language is object-oriented?,Python,C,Assembly,Machine Code,0,Programming,medium`;
            const blob = new Blob([template], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "nptelify_questions_template.csv";
            a.click();
          }}
            style={{ padding:"10px 24px", borderRadius:8, background:C.blue, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontFamily:C.font, display:"flex", alignItems:"center", gap:8, margin:"0 auto" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download CSV Template
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
