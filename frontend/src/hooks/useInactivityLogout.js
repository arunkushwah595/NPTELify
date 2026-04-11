import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 13 * 60 * 1000; // Warning at 13 minutes (2 minute buffer)

export const useInactivityLogout = ({ onWarning, onLogout }) => {
  const { user } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  // Reset activity timestamp and clear timeouts
  const resetInactivityTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timeout (at 13 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        onWarning?.();
      }
    }, WARNING_TIME);

    // Set logout timeout (at 15 minutes)
    timeoutRef.current = setTimeout(() => {
      onLogout?.();
    }, INACTIVITY_TIMEOUT);
  }, [user, onWarning, onLogout]);

  // Setup activity listeners
  useEffect(() => {
    if (!user) {
      // Clear timers if user logs out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    let activityTimeout;

    const handleActivity = () => {
      // Debounce activity detection (don't reset on every tiny movement)
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        // Only reset if more than 30 seconds have passed
        if (timeSinceLastActivity > 30000) {
          resetInactivityTimer();
        }
      }, 500);
    };

    // Add listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user, resetInactivityTimer]);

  return { resetInactivityTimer };
};
