import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

// Add Google Fonts import for heading font
const linkElement = document.createElement("link");
linkElement.href = "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap";
linkElement.rel = "stylesheet";
if (document.head && !document.querySelector('link[href*="Inter"]')) {
  document.head.appendChild(linkElement);
}

const C = {
  navy: "#1a3a6b",
  blue: "#2563eb",
  orange: "#f97316",
  green: "#16a34a",
  red: "#dc2626",
  bg: "#f5f8ff",
  card: "#ffffff",
  altBg: "#eaf0fb",
  border: "#dce8fb",
  muted: "#7a8faf",
  body: "#4a6490",
  font: "'DM Sans', 'Segoe UI', sans-serif",
  headingFont: "'Inter', 'DM Sans', 'Segoe UI', sans-serif",
};

// Student-only FAQs
const studentFaqData = [
  {
    question: "How do I take a quiz?",
    answer: ["Go to your Student Dashboard", "Find the quiz from the 'Main' tab", "Click 'Attempt Quiz'", "Read all instructions carefully before starting", "Remember: You can only submit once"],
  },
  {
    question: "Can I go back to previous questions?",
    answer: ["Yes, you can navigate between questions during the quiz", "Use the question navigation panel on the left side to jump to any question", "Note: Once you submit the quiz, you cannot modify your answers"],
  },
  {
    question: "What happens if I accidentally close the quiz?",
    answer: ["Your answers are auto-saved as you progress", "You can return to the quiz before the deadline if you close it accidentally", "Important: The timer will continue running even if you close the quiz"],
  },
  {
    question: "How do I view my quiz results?",
    answer: ["Go to the 'Results' tab in your Student Dashboard", "See all your completed quizzes and their scores", "Click on a quiz to view detailed results and answer explanations"],
  },
  {
    question: "When will my results be available?",
    answer: ["Results are typically available after the quiz deadline", "Examiners may publish results immediately or after manual review", "Timeline depends on quiz settings configured by your instructor"],
  },
  {
    question: "Can I retake a quiz?",
    answer: ["Only if the examiner allows retakes", "Check the quiz instructions for retry policies", "Contact your instructor if you have questions about retaking"],
  },
];

// Examiner-only FAQs
const examinerFaqData = [
  {
    question: "How do I create a new quiz?",
    answer: ["Click 'Create Quiz' in your Examiner Dashboard", "Add quiz details (title, subject, date/time, duration)", "Add questions from the question bank or create new ones inline"],
  },
  {
    question: "How do I add questions to a quiz?",
    answer: [
      "Option 1: Import questions from the Question Bank for quick setup",
      "Option 2: Create questions directly in the Quiz Builder",
      "Supported formats: Multiple choice and other question types",
      "You can mix imported and new questions in the same quiz",
    ],
  },
  {
    question: "Can I edit a quiz after students have started it?",
    answer: ["No, quizzes are locked once the scheduled time starts", "Plan and review your quiz thoroughly before the start time", "Ensure all questions and settings are finalized before publishing"],
  },
  {
    question: "How do I view student attempts?",
    answer: ["Go to the 'Progress' tab in your Examiner Dashboard", "See all student attempts, their scores, and attempt times", "Click on a student to view their individual responses and answers"],
  },
  {
    question: "Can I download student results?",
    answer: ["View results in the Results tab", "Use your browser's print feature (Ctrl+P) to save as PDF", "Export features may vary based on your subscription plan"],
  },
  {
    question: "How do I manage the question bank?",
    answer: ["Visit the Question Bank page from your dashboard", "Create new questions for future reuse", "Edit and organize questions by subject and difficulty level", "Delete unused questions to keep your bank organized"],
  },
];

// General FAQs (for logged out users)
const generalFaqData = [
  {
    question: "What is NPTELify?",
    answer: ["A comprehensive quiz and assessment platform designed for NPTEL learners", "Allows students to take quizzes and view results", "Enables examiners to create and manage assessments", "Provides real-time feedback and performance insights"],
  },
  {
    question: "How do I create an account?",
    answer: ["Click 'Sign Up Free' on the homepage", "Choose your role (Student or Examiner)", "Fill in your details (name, email, password)", "Verify your email address", "You're ready to log in and start using NPTELify"],
  },
  {
    question: "What's the difference between Student and Examiner accounts?",
    answer: [
      "Student accounts: Take quizzes, view your results, track your progress, and see detailed answer explanations",
      "Examiner accounts: Create and manage quizzes, add questions, monitor student attempts, and analyze performance data",
    ],
  },
  {
    question: "How do I reset my password?",
    answer: ["Click 'Forgot Password' on the login page", "Enter your registered email address", "Follow the email verification process", "Click the reset link in your email", "Create your new password and log in"],
  },
  {
    question: "Is my data secure?",
    answer: ["Yes, all data is encrypted and transmitted securely", "Your quiz responses and personal information are protected", "Industry-standard security measures are implemented", "We comply with data protection regulations"],
  },
  {
    question: "What browsers are supported?",
    answer: ["Google Chrome (recommended)", "Mozilla Firefox", "Apple Safari", "Microsoft Edge", "Works best on latest versions of these browsers"],
  },
];

// Student guides
const studentGuides = [
  {
    title: "Getting Started",
    description: "Your first steps as a student",
    icon: "rocket",
    steps: [
      "Log in with your credentials",
      "Go to Student Dashboard → Main tab",
      "Browse available quizzes",
      "Check quiz details and schedule",
      "Click 'Attempt Quiz' when ready",
    ],
  },
  {
    title: "Taking a Quiz",
    description: "Complete your quiz attempt successfully",
    icon: "edit",
    steps: [
      "Open a quiz from the Main tab",
      "Read the quiz instructions carefully",
      "Answer all questions thoughtfully",
      "Use the navigation panel to move between questions",
      "Review your answers before submitting",
      "Click 'Submit' to finalize your attempt",
    ],
  },
  {
    title: "Checking Results",
    description: "View your quiz performance",
    icon: "chart",
    steps: [
      "Go to the 'Results' tab",
      "Find your completed quiz",
      "Click to view your score",
      "Review your answers and feedback",
      "Compare your performance",
      "Identify areas for improvement",
    ],
  },
  {
    title: "Progress Tracking",
    description: "Monitor your learning journey",
    icon: "trending",
    steps: [
      "Visit the 'Progress' tab",
      "View all your attempted quizzes",
      "See your scores and timestamps",
      "Track your improvement over time",
      "Identify patterns in your performance",
      "Plan your study schedule accordingly",
    ],
  },
];

// Examiner guides
const examinerGuides = [
  {
    title: "Creating Your First Quiz",
    description: "Build a quiz from scratch",
    icon: "pencil",
    steps: [
      "Go to Examiner Dashboard → Create Quiz",
      "Fill in quiz details (title, subject, description)",
      "Set date, time, and duration",
      "Configure mark allocation and settings",
      "Move to next section to add questions",
      "Review and save your quiz",
    ],
  },
  {
    title: "Managing Questions",
    description: "Build your question bank",
    icon: "book",
    steps: [
      "Navigate to Question Bank from sidebar",
      "Click 'Add New Question' to create",
      "Fill in question text and options",
      "Specify the correct answer",
      "Set difficulty and subject tags",
      "Save to your question bank",
    ],
  },
  {
    title: "Monitoring Student Progress",
    description: "Track quiz attempts and performance",
    icon: "eye",
    steps: [
      "Go to your quiz's Progress tab",
      "View all student attempts",
      "See submission times and durations",
      "Click on a student to see their answers",
      "Review their performance",
      "Provide feedback if needed",
    ],
  },
  {
    title: "Publishing Results",
    description: "Share quiz results with students",
    icon: "target",
    steps: [
      "Go to the Results tab",
      "Review the class performance summary",
      "Analyze answer statistics",
      "Identify common mistakes",
      "Publish results when ready",
      "Students will see their scores",
    ],
  },
];

// General guides (for logged out users)
const generalGuides = [
  {
    title: "Student Quick Start",
    description: "Get started with your first quiz",
    icon: "rocket",
    steps: [
      "Create a student account",
      "Complete your profile",
      "Browse available quizzes",
      "Enter a quiz and read instructions",
      "Answer questions carefully",
      "Submit and view your results",
    ],
  },
  {
    title: "Examiner Quick Start",
    description: "Create your first quiz",
    icon: "pencil",
    steps: [
      "Create an examiner account",
      "Complete your profile",
      "Navigate to Create Quiz",
      "Fill in quiz information",
      "Add questions from the bank",
      "Save and schedule your quiz",
    ],
  },
  {
    title: "Sign Up & Account Setup",
    description: "Create your NPTELify account",
    icon: "lock",
    steps: [
      "Click 'Sign Up Free' on homepage",
      "Choose your role (Student/Examiner)",
      "Enter your email address",
      "Create a secure password",
      "Fill in your full name",
      "Verify your email and start using NPTELify",
    ],
  },
  {
    title: "Platform Overview",
    description: "Understand NPTELify features",
    icon: "star",
    steps: [
      "Students can take quizzes and track progress",
      "Examiners can create and manage quizzes",
      "Real-time notifications keep you updated",
      "Question bank organizes questions by subject",
      "Results analytics show performance insights",
      "Secure platform protects all your data",
    ],
  },
];

const troubleshooting = [
  {
    issue: "I can't log in",
    solutions: [
      "Verify your email and password are correct",
      "Check if caps lock is on",
      "Clear browser cookies and cache",
      "Try a different browser",
      "Contact support if issue persists",
    ],
  },
  {
    issue: "Quiz timer is running fast",
    solutions: [
      "Check your device system clock is correct",
      "The timer syncs with server time, not device time",
      "Ensure stable internet connection",
      "Avoid switching browser tabs during quiz",
    ],
  },
  {
    issue: "My answer isn't being saved",
    solutions: [
      "Check your internet connection is stable",
      "Try selecting a different answer and re-selecting",
      "Refresh the page and continue (auto-save will preserve answers)",
      "Use a supported browser (Chrome, Firefox, Safari, Edge)",
    ],
  },
  {
    issue: "I can't see my quiz results",
    solutions: [
      "Results appear after quiz deadline",
      "Examiner may need to manually review and publish results",
      "Refresh the page to get latest data",
      "Check if quiz status shows 'Completed'",
    ],
  },
  {
    issue: "Page is loading slowly",
    solutions: [
      "Check your internet connection speed",
      "Close other browser tabs and applications",
      "Clear browser cache and cookies",
      "Disable browser extensions temporarily",
      "Try a different network or device",
    ],
  },
  {
    issue: "I'm not receiving notifications",
    solutions: [
      "Check if notifications are enabled in browser",
      "Verify notification permissions for this site",
      "Check your email spam folder",
      "Ensure you're logged in to see real-time notifications",
      "Refresh browser to sync latest notifications",
    ],
  },
];

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedTrouble, setExpandedTrouble] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState(null);

  // Determine content based on auth status and role
  const isLoggedIn = !!auth.user;
  const isStudent = auth.user?.role === "candidate";
  const isExaminer = auth.user?.role === "examiner";

  const faqData = isStudent ? studentFaqData : isExaminer ? examinerFaqData : generalFaqData;
  const guides = isStudent ? studentGuides : isExaminer ? examinerGuides : generalGuides;

  const getBackButtonText = () => {
    if (!isLoggedIn) return "← Back to Home";
    if (isStudent) return "← Back to Student Dashboard";
    if (isExaminer) return "← Back to Examiner Dashboard";
    return "← Back";
  };

  const handleBackClick = () => {
    if (!isLoggedIn) {
      navigate("/home");
    } else if (isStudent) {
      navigate("/candidate/dashboard");
    } else if (isExaminer) {
      navigate("/examiner/dashboard");
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setContactStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }
    setContactStatus({ type: "success", message: "Thank you! We'll get back to you soon." });
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setContactStatus(null), 3000);
  };

  const getGuideIcon = (iconName) => {
    const iconMap = {
      "rocket": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
      "edit": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      "chart": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="19" x2="19" y2="19"/><rect x="5" y="9" width="4" height="10"/><rect x="15" y="3" width="4" height="16"/></svg>,
      "trending": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></svg>,
      "pencil": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      "book": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      "eye": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      "target": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
      "lock": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      "star": <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}><polygon points="12 2 15.09 10.26 23.77 10.36 17.39 16.4 19.68 25.32 12 20.13 4.32 25.32 6.61 16.4 0.23 10.36 8.91 10.26 12 2"/></svg>,
    };
    return iconMap[iconName] || iconName;
  };

  const LogoButton = () => {
    const dashboardPath = isStudent ? "/candidate/dashboard" : isExaminer ? "/examiner/dashboard" : "/home";
    return (
      <button onClick={() => navigate(dashboardPath)} style={{ display:"flex", alignItems:"center", gap:9, background:"none", border:"none", cursor:"pointer", padding:0 }}>
        <img
          src="/logo_half.png"
          alt="logo"
          style={{ width:36, height:36, objectFit:"contain" }}
        />
        <span style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.5px" }}>
          <span style={{ color:"#1a3a6b" }}>NPTEL</span><span style={{ color:"#f97316" }}>ify</span>
        </span>
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.font }}>
      {/* Professional Header (only when logged in) */}
      {isLoggedIn && (
        <header style={{ height:60, background:C.card, borderBottom:`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", flexShrink:0, fontFamily:C.font, position:"fixed", top:0, left:0, right:0, zIndex:100, boxShadow: "0 2px 12px rgba(26, 58, 107, 0.08)" }}>
          <LogoButton />
          <div style={{ display:"flex", gap:32, alignItems:"center" }}>
            {["FAQs", "Guide", "Troubleshooting", "Contact Support"].map(l => (
              <a key={l} href={`#${l.replace(/\s/g,"-").toLowerCase()}`}
                onClick={() => {
                  const sectionId = l.replace(/\s/g,"-").toLowerCase() === "faqs" ? "faq-section" : l.replace(/\s/g,"-").toLowerCase() === "guide" ? "guide-section" : l.replace(/\s/g,"-").toLowerCase() === "troubleshooting" ? "trouble-section" : "contact-section";
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ fontSize:14, fontWeight:600, color:"#4a6490", textDecoration:"none", cursor:"pointer" }}
                onMouseEnter={e=>e.target.style.color="#2563eb"}
                onMouseLeave={e=>e.target.style.color="#4a6490"}>{l}</a>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <button
              onClick={() => {
                const dashboardPath = isStudent ? "/candidate/dashboard" : "/examiner/dashboard";
                navigate(dashboardPath);
              }}
              style={{
                padding:"9px 20px",
                background: isStudent ? C.orange : C.blue,
                border:"none",
                borderRadius:10,
                color:"white",
                fontWeight:700,
                fontSize:14,
                cursor:"pointer",
                transition:"all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "0 4px 12px rgba(26, 58, 107, 0.15)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isStudent ? "#ea5e0f" : "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${isStudent ? "rgba(249, 115, 22, 0.3)" : "rgba(37, 99, 235, 0.3)"}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isStudent ? C.orange : C.blue;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 58, 107, 0.15)";
              }}
            >
              Main Dashboard
            </button>
            <ProfileDropdown C={C} userName={auth.user?.name} userRole={isStudent ? "Candidate" : "Examiner"} />
          </div>
        </header>
      )}

      {/* Public Header (only when logged out) */}
      {!isLoggedIn && (
        <nav style={{ position:"sticky", top:0, zIndex:50, background:C.card, borderBottom:`1.5px solid ${C.border}`, fontFamily:C.font }}>
          <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button onClick={() => navigate("/home")} style={{ display:"flex", alignItems:"center", gap:9, background:"none", border:"none", cursor:"pointer", padding:0 }}>
              <img
                src="/logo_half.png"
                alt="logo"
                style={{ width:36, height:36, objectFit:"contain" }}
              />
              <span style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.5px" }}>
                <span style={{ color:C.navy }}>NPTEL</span><span style={{ color:C.orange }}>ify</span>
              </span>
            </button>
            <div style={{ display:"flex", gap:32, alignItems:"center" }}>
              {["FAQs", "Guide", "Troubleshooting", "Contact Support"].map(l => (
                <a key={l} href={`#${l.replace(/\s/g,"-").toLowerCase()}`}
                  onClick={() => {
                    const sectionId = l.replace(/\s/g,"-").toLowerCase() === "faqs" ? "faq-section" : l.replace(/\s/g,"-").toLowerCase() === "guide" ? "guide-section" : l.replace(/\s/g,"-").toLowerCase() === "troubleshooting" ? "trouble-section" : "contact-section";
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ fontSize:14, fontWeight:600, color:"#4a6490", textDecoration:"none", cursor:"pointer" }}
                  onMouseEnter={e=>e.target.style.color="#2563eb"}
                  onMouseLeave={e=>e.target.style.color="#4a6490"}>{l}</a>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Login Button - Same style as Home page */}
              {(() => {
                const [hovLogin, setHovLogin] = useState(false);
                return (
                  <button onClick={() => navigate("/login")}
                    onMouseEnter={()=>setHovLogin(true)} 
                    onMouseLeave={()=>setHovLogin(false)}
                    style={{
                      padding:"8px 18px", fontSize:13, fontWeight:700, borderRadius:10, cursor:"pointer", transition:"all .18s",
                      border: "1.5px solid #2563eb",
                      background: hovLogin ? "#2563eb" : "transparent",
                      color: hovLogin ? "#fff" : "#2563eb",
                      fontFamily:C.font,
                    }}>
                    Log In
                  </button>
                );
              })()}
              {/* Sign Up Button */}
              {(() => {
                const [hovSignUp, setHovSignUp] = useState(false);
                return (
                  <button onClick={() => navigate("/signup")}
                    onMouseEnter={()=>setHovSignUp(true)} 
                    onMouseLeave={()=>setHovSignUp(false)}
                    style={{
                      padding:"8px 18px", fontSize:13, fontWeight:700, borderRadius:10, cursor:"pointer", transition:"all .18s",
                      border: "none",
                      background: hovSignUp ? "#e56c0a" : "#f97316",
                      color: "#fff",
                      fontFamily:C.font,
                    }}>
                    Start Free
                  </button>
                );
              })()}
            </div>
          </div>
        </nav>
      )}
      
      {/* Content Section */}
      <div style={{ paddingTop: isLoggedIn ? 60 : 0 }}>
      {/* Gradient Header (only when logged out) */}
      {!isLoggedIn && (
        <div style={{ background: `linear-gradient(135deg, #1e40af 0%, #ea580c 100%)`, color: "white", padding: "100px 32px", textAlign: "center", position: "relative", boxShadow: "0 12px 40px rgba(234, 88, 12, 0.25)" }}>
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            style={{
              position: "absolute",
              top: 28,
              left: 28,
              padding: "12px 22px",
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: 12,
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateX(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {getBackButtonText()}
          </button>
          <h1 style={{ fontSize: 56, fontWeight: 950, marginBottom: 20, letterSpacing: "-1px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.1)", fontFamily: C.headingFont }}>
            Help & Support
          </h1>
          <p style={{ fontSize: 19, opacity: 0.95, maxWidth: 680, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, letterSpacing: "-0.3px" }}>
            Find answers, guides, and support for NPTELify
          </p>
        </div>
      )}

      {/* Logged-in Hero Section */}
      {isLoggedIn && (
        <div style={{ background: `linear-gradient(135deg, #1e40af 0%, #ea580c 100%)`, color: "white", padding: "90px 32px", textAlign: "center", boxShadow: "0 12px 40px rgba(234, 88, 12, 0.25)" }}>
          <h1 style={{ fontSize: 56, fontWeight: 950, marginBottom: 20, letterSpacing: "-1px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.1)", fontFamily: C.headingFont }}>
            {isStudent ? "Student Help Center" : "Examiner Help Center"}
          </h1>
          <p style={{ fontSize: 19, opacity: 0.95, maxWidth: 680, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, letterSpacing: "-0.3px" }}>
            {isStudent ? "Find answers, tutorials, and support for taking quizzes" : "Find answers, tutorials, and support for creating and managing quizzes"}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 32px" }}>
        
        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 90 }}>
          <div
            onClick={() => document.getElementById("faq-section").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: 28,
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue;
              e.currentTarget.style.boxShadow = `0 12px 24px ${C.blue}20`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 17 }}>FAQs</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Quick answers to common questions</div>
          </div>

          <div
            onClick={() => document.getElementById("guide-section").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: 28,
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue;
              e.currentTarget.style.boxShadow = `0 12px 24px ${C.blue}20`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 17 }}>Guides</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Step-by-step tutorials</div>
          </div>

          <div
            onClick={() => document.getElementById("trouble-section").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: 28,
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue;
              e.currentTarget.style.boxShadow = `0 12px 24px ${C.blue}20`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-8.94-8.94l-2.83 2.83a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l2.83-2.83zM3 21h18v-2H3v2z"/>
            </svg>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 17 }}>Troubleshooting</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Fix common issues quickly</div>
          </div>

          <div
            onClick={() => document.getElementById("contact-section").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: 28,
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.blue;
              e.currentTarget.style.boxShadow = `0 12px 24px ${C.blue}20`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 40, height: 40 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 17 }}>Contact Support</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Reach out to our team</div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq-section" style={{ marginBottom: 90 }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.navy, marginBottom: 12, letterSpacing: "-0.6px", fontFamily: C.headingFont }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: C.muted, fontSize: 16, fontWeight: 300 }}>Quick answers to help you get the most out of NPTELify</p>
          </div>

          {/* FAQ Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(26, 58, 107, 0.04)"
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(37, 99, 235, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <div style={{ fontWeight: 650, color: C.navy, fontSize: 16 }}>{faq.question}</div>
                  </div>
                  <div style={{ fontSize: 20, transform: expandedFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: 12 }}>▼</div>
                </button>
                {expandedFaq === idx && (
                  <div style={{ padding: "0 22px 18px 52px", borderTop: `1px solid ${C.border}`, color: C.body, fontSize: 14 }}>
                    <ul style={{ paddingLeft: 20, lineHeight: "1.8", margin: 0 }}>
                      {Array.isArray(faq.answer) ? (
                        faq.answer.map((item, i) => (
                          <li key={i} style={{ marginBottom: 10 }}>✓ {item}</li>
                        ))
                      ) : (
                        <li style={{ marginBottom: 10 }}>✓ {faq.answer}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Guides Section */}
        <div id="guide-section" style={{ marginBottom: 90 }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.navy, marginBottom: 12, letterSpacing: "-0.6px", fontFamily: C.headingFont }}>User Guides</h2>
            <p style={{ color: C.muted, fontSize: 16, fontWeight: 300 }}>Step-by-step tutorials to help you succeed</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {guides.map((guide, idx) => (
              <div
                key={idx}
                style={{
                  padding: 32,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px rgba(26, 58, 107, 0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.blue;
                  e.currentTarget.style.boxShadow = `0 20px 48px rgba(37, 99, 235, 0.12)`;
                  e.currentTarget.style.transform = "translateY(-8px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(26, 58, 107, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ marginBottom: 20 }}>{getGuideIcon(guide.icon)}</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, marginBottom: 8, fontFamily: C.headingFont }}>{guide.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>{guide.description}</p>
                <ol style={{ paddingLeft: 20, color: C.body, fontSize: 14, lineHeight: "1.9", marginBottom: 0 }}>
                  {guide.steps.map((step, i) => (
                    <li key={i} style={{ marginBottom: 10, opacity: 0.88 }}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div id="trouble-section" style={{ marginBottom: 90 }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.navy, marginBottom: 12, letterSpacing: "-0.6px", fontFamily: C.headingFont }}>Troubleshooting</h2>
            <p style={{ color: C.muted, fontSize: 16, fontWeight: 300 }}>Solutions for common issues</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {troubleshooting.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(26, 58, 107, 0.04)"
                }}
              >
                <button
                  onClick={() => setExpandedTrouble(expandedTrouble === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(249, 115, 22, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div style={{ fontWeight: 650, color: C.navy, fontSize: 16 }}>{item.issue}</div>
                  </div>
                  <div style={{ fontSize: 20, transform: expandedTrouble === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, marginLeft: 12 }}>▼</div>
                </button>
                {expandedTrouble === idx && (
                  <div style={{ padding: "0 22px 18px 52px", borderTop: `1px solid ${C.border}`, color: C.body, fontSize: 14 }}>
                    <ul style={{ paddingLeft: 20, lineHeight: "1.8", margin: 0 }}>
                      {item.solutions.map((solution, i) => (
                        <li key={i} style={{ marginBottom: 10 }}>✓ {solution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div id="contact-section" style={{ background: `linear-gradient(135deg, ${C.navy}08 0%, ${C.blue}04 100%)`, borderRadius: 20, padding: 56, border: `1px solid ${C.border}`, boxShadow: `0 8px 32px rgba(26, 58, 107, 0.06)`, display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: 700, width: "100%", textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.navy, marginBottom: 16, letterSpacing: "-0.6px", fontFamily: C.headingFont }}>Contact Support</h2>
            <p style={{ color: C.muted, marginBottom: 36, fontSize: 16, fontWeight: 300, lineHeight: 1.7 }}>Can't find what you're looking for? Our support team is here to help you succeed.</p>

            <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "left" }}>
              <div>
                <label style={{ display: "block", fontWeight: 650, color: C.navy, marginBottom: 10, fontSize: 15 }}>Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: C.font,
                    boxSizing: "border-box",
                    transition: "all 0.3s",
                    backgroundColor: C.card
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.08)`;
                    e.target.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 650, color: C.navy, marginBottom: 10, fontSize: 15 }}>Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: C.font,
                    boxSizing: "border-box",
                    transition: "all 0.3s",
                    backgroundColor: C.card
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.08)`;
                    e.target.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 650, color: C.navy, marginBottom: 10, fontSize: 15 }}>Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: C.font,
                    boxSizing: "border-box",
                    transition: "all 0.3s",
                    backgroundColor: C.card
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.08)`;
                    e.target.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 650, color: C.navy, marginBottom: 10, fontSize: 15 }}>Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: C.font,
                    boxSizing: "border-box",
                    minHeight: 150,
                    resize: "vertical",
                    transition: "all 0.3s",
                    backgroundColor: C.card
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.blue;
                    e.target.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.08)`;
                    e.target.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border;
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Tell us more about your issue or question..."
                />
              </div>

              {contactStatus && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: contactStatus.type === "success" ? `${C.green}12` : `${C.red}12`,
                    color: contactStatus.type === "success" ? C.green : C.red,
                    fontSize: 15,
                    fontWeight: 600,
                    border: `1px solid ${contactStatus.type === "success" ? C.green + "30" : C.red + "30"}`
                  }}
                >
                  {contactStatus.message}
                </div>
              )}

              <button
                type="submit"
                style={{
                  padding: "16px 32px",
                  background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: `0 8px 20px rgba(37, 99, 235, 0.2)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 16px 32px rgba(37, 99, 235, 0.25)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 8px 20px rgba(37, 99, 235, 0.2)`;
                }}
              >
                Send Message
              </button>
            </form>

            {/* Contact Info */}
            <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, color: C.navy, marginBottom: 12, fontSize: 17, justifyContent: "center", lineHeight: 1.4 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-10 5L2 7"/>
                  </svg>
                  Email
                </div>
                <a href="mailto:support@nptelify.com" style={{ color: C.blue, textDecoration: "none", fontSize: 16, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => e.target.style.opacity = "0.8"} onMouseLeave={(e) => e.target.style.opacity = "1"}>support@nptelify.com</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <div style={{ fontWeight: 800, color: C.navy, marginBottom: 12, fontSize: 17, display: "flex", alignItems: "center", gap: 10, justifyContent: "center", lineHeight: 1.4 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" style={{ width: 20, height: 20, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Response Time
                </div>
                <div style={{ color: C.body, fontSize: 16, fontWeight: 500 }}>Usually within 24-48 hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
