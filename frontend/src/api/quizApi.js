const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  window.location.replace("/login");
}

async function request(url, options = {}) {
  const authHeaders = getAuthHeaders();
  const fullUrl = API_BASE_URL + url;
  const token = localStorage.getItem("token");
  
  const fetchOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    }
  };
  
  const res = await fetch(fullUrl, fetchOptions);
  
  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Please log in again.");
  }
  
  const text = await res.text();
  let data = {};
  try { if (text) data = JSON.parse(text); } catch { /* non-JSON */ }
  
  if (!res.ok) {
    const errorMessage = data.message || data.error || `HTTP ${res.status}: Request failed`;
    throw new Error(errorMessage);
  }
  
  return data;
}

// ── Quiz APIs ──────────────────────────────────────────────
export const createQuiz = (body) =>
  request("/api/quizzes", { method: "POST", body: JSON.stringify(body) });

export const getAllQuizzes = () => request("/api/quizzes");

export const getMyQuizzes = () => request("/api/quizzes/mine");

export const getQuizById = (id) => request(`/api/quizzes/${id}`);

export const updateQuiz = (id, body) =>
  request(`/api/quizzes/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteQuiz = (id) =>
  request(`/api/quizzes/${id}`, { method: "DELETE" });

export const getUpcomingQuizzes = () => request("/api/quizzes/upcoming/all");

export const getMyUpcomingQuizzes = () => request("/api/quizzes/upcoming/mine");

export const getPastQuizzes = () => request("/api/quizzes/past/all");

export const getMyPastQuizzes = () => request("/api/quizzes/past/mine");

export const getExaminerStats = () => request("/api/quizzes/stats/mine");

export const getCandidateQuizData = (id) => request(`/api/quizzes/${id}/candidate-data`);

export const getQuizStatus = (id) => request(`/api/quizzes/${id}/status`);

export const copyQuiz = (id) => request(`/api/quizzes/${id}`);

// ── Attempt APIs ───────────────────────────────────────────
export const submitAttempt = (quizId, answers) =>
  request(`/api/attempts/${quizId}`, { method: "POST", body: JSON.stringify({ answers }) });

export const getMyAttempts = () => request("/api/attempts/my");

export const getAttemptsForQuiz = (quizId) => request(`/api/attempts/quiz/${quizId}`);

export const getAttemptDetail = (attemptId) => request(`/api/attempts/${attemptId}`);

export const downloadAttemptPdf = async (attemptId) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/attempts/${attemptId}/download-pdf`, {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(`Failed to download PDF: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quiz_Report_Attempt_${attemptId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadQuizReportPdf = async (quizId) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/download-pdf`, {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(`Failed to download PDF: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quiz_Report_${quizId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Declare/Publish results for a quiz (notifies all candidates)
export const declareResults = (quizId) =>
  request(`/api/quizzes/${quizId}/declare-results`, { method: "POST", body: JSON.stringify({}) });
