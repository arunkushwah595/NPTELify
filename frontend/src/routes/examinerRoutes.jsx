import { Routes, Route, Navigate } from "react-router-dom";
import MainDashboardPageWrapper from "../pages/MainDashboardPageWrapper";
import ExaminerCreateQuizPageWrapper from "../pages/ExaminerCreateQuizPageWrapper";
import ExaminerResultsPageWrapper from "../pages/ExaminerResultsPageWrapper";
import ExaminerProgressPageWrapper from "../pages/ExaminerProgressPageWrapper";
import ExaminerProfilePage from "../pages/ExaminerProfilePage";
import QuestionBankPage from "../pages/QuestionBankPage";
import ImportQuestionsPage from "../pages/ImportQuestionsPage";
import QuizBuilderPage from "../pages/QuizBuilderPage";
import PrivateRoute from "./PrivateRoute";

const ExaminerRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          <PrivateRoute role="examiner">
            <MainDashboardPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="create"
        element={
          <PrivateRoute role="examiner">
            <ExaminerCreateQuizPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="results"
        element={
          <PrivateRoute role="examiner">
            <ExaminerResultsPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="progress"
        element={
          <PrivateRoute role="examiner">
            <ExaminerProgressPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="profile"
        element={
          <PrivateRoute role="examiner">
            <ExaminerProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="question-bank"
        element={
          <PrivateRoute role="examiner">
            <QuestionBankPage />
          </PrivateRoute>
        }
      />
      <Route
        path="import-questions"
        element={
          <PrivateRoute role="examiner">
            <ImportQuestionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="quiz-builder"
        element={
          <PrivateRoute role="examiner">
            <QuizBuilderPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default ExaminerRoutes;