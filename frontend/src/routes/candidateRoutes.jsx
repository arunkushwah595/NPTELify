import { Routes, Route, Navigate } from "react-router-dom";
import StudentMainDashboardPageWrapper from "../pages/StudentMainDashboardPageWrapper";
import StudentResultsDashboardPageWrapper from "../pages/StudentResultsDashboardPageWrapper";
import StudentProgressDashboardPageWrapper from "../pages/StudentProgressDashboardPageWrapper";
import StudentSolutionsDashboardPageWrapper from "../pages/StudentSolutionsDashboardPageWrapper";
import CandidateProfilePage from "../pages/CandidateProfilePage";
import QuizPage from "../pages/QuizPage";
import PrivateRoute from "./PrivateRoute";

const CandidateRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard"
        element={
          <PrivateRoute role="candidate">
            <StudentMainDashboardPageWrapper />
          </PrivateRoute>
        }
      />
      <Route path="results"
        element={
          <PrivateRoute role="candidate">
            <StudentResultsDashboardPageWrapper />
          </PrivateRoute>
        }
      />
      <Route path="progress"
        element={
          <PrivateRoute role="candidate">
            <StudentProgressDashboardPageWrapper />
          </PrivateRoute>
        }
      />
      <Route path="solutions"
        element={
          <PrivateRoute role="candidate">
            <StudentSolutionsDashboardPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="profile"
        element={
          <PrivateRoute role="candidate">
            <CandidateProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="quiz/:id"
        element={
          <PrivateRoute role="candidate">
            <QuizPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default CandidateRoutes;