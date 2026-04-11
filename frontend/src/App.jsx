
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthRoutes from './routes/authRoutes';
import CandidateRoutes from './routes/candidateRoutes';
import ExaminerRoutes from './routes/examinerRoutes';
import { notificationStore } from './utils/notificationStore';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { SessionWarningModal } from './components/SessionWarningModal';

// Component to sync auth state with notification store
function NotificationSyncProvider({ children }) {
  const auth = useAuth();

  useEffect(() => {
    // Update notification store with current user
    // Use token as unique user identifier (most reliable)
    if (auth.user && auth.user.token) {
      notificationStore.setCurrentUser(auth.user.token);
    } else {
      notificationStore.setCurrentUser(null);
    }
  }, [auth.user]);

  return children;
}

// Component to manage session inactivity timeout
function InactivityManager({ children }) {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };

  const handleStayLoggedIn = () => {
    setShowWarning(false);
  };

  useInactivityLogout({
    onWarning: () => {
      if (user) {
        setShowWarning(true);
      }
    },
    onLogout: () => {
      handleLogout();
    },
  });

  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={showWarning}
        secondsRemaining={120}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
}

// Main route dispatcher - combines all routes with protection
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/*" element={<AuthRoutes />} />

      {/* Protected candidate routes */}
      <Route path="/candidate/*" element={user ? <CandidateRoutes /> : <Navigate to="/login" replace />} />

      {/* Protected examiner routes */}
      <Route path="/examiner/*" element={user && user.role === 'examiner' ? <ExaminerRoutes /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

const App = () => {
    return(
        <AuthProvider>
            <InactivityManager>
              <NotificationSyncProvider>
                <AppRoutes />
              </NotificationSyncProvider>
            </InactivityManager>
        </AuthProvider>
    );
};

export default App;
