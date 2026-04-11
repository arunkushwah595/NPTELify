import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HelpSupportPage from "../pages/HelpSupportPage";

// Smart Home component that redirects logged-in users to their dashboard
function SmartHome() {
  const { user } = useAuth();

  // If user is logged in and has a role, redirect to their dashboard
  if (user && user.token) {
    if (user.role === 'examiner') {
      return <Navigate to="/examiner/dashboard" replace />;
    } else {
      return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  // Otherwise show the public home page
  return <Home />;
}

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<SmartHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/help" element={<HelpSupportPage />} />
    </Routes>
  );
};

export default AuthRoutes;