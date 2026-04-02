// notificationStore.js - Notification state management (User-specific)

let listeners = [];
let notifications = [];
let currentUserId = null;

// Get storage key for a specific user
function getStorageKey(suffix) {
  const keyPrefix = currentUserId ? `notifications_${currentUserId}` : "notifications";
  return suffix ? `${keyPrefix}_${suffix}` : keyPrefix;
}

// Set current user ID (called when user logs in/out)
function setCurrentUser(userId) {
  currentUserId = userId;
}

// Load notifications from localStorage
function loadNotifications() {
  try {
    const stored = localStorage.getItem(getStorageKey());
    notifications = stored ? JSON.parse(stored) : [];
  } catch (e) {
    notifications = [];
  }
}

// Save notifications to localStorage
function saveNotifications() {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(notifications));
  } catch (e) {
    // Silent fail
  }
}

// Load deleted notification hashes from localStorage (user-specific)
function loadDeletedHashes() {
  try {
    const stored = localStorage.getItem(getStorageKey("deleted"));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Save deleted notification hashes to localStorage (user-specific)
function saveDeletedHashes(hashes) {
  try {
    localStorage.setItem(getStorageKey("deleted"), JSON.stringify(hashes));
  } catch (e) {
    // Silent fail
  }
}

// Create a hash for a notification to detect duplicates
function createNotificationHash(notification) {
  return `${notification.type || 'unknown'}:${notification.title}:${notification.message}`;
}

export const notificationStore = {
  // Set the current user (call this when user logs in/out)
  setCurrentUser: (userId) => {
    setCurrentUser(userId);
    // Reload notifications for the new user
    loadNotifications();
    notificationStore.notify();
  },

  // Add listener for state changes
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  // Notify all listeners of changes
  notify: () => {
    listeners.forEach(listener => listener());
  },

  // Get all notifications
  getAll: () => {
    loadNotifications();
    return notifications;
  },

  // Get unread notification count
  getUnreadCount: () => {
    loadNotifications();
    return notifications.filter(n => !n.read).length;
  },

  // Add new notification (with duplicate prevention)
  add: (notification) => {
    loadNotifications();
    const deletedHashes = loadDeletedHashes();
    const hash = createNotificationHash(notification);
    
    // Don't add if this notification was previously deleted by this user
    if (deletedHashes.includes(hash)) {
      return null;
    }
    
    // Don't add if an identical unread notification already exists for this user
    const isDuplicate = notifications.some(
      n => !n.read && createNotificationHash(n) === hash
    );
    
    if (isDuplicate) {
      return null;
    }
    
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    notifications.unshift(newNotification);
    saveNotifications();
    notificationStore.notify();
    return newNotification;
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    loadNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      saveNotifications();
      notificationStore.notify();
    }
  },

  // Mark notification as unread
  markAsUnread: (notificationId) => {
    loadNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = false;
      saveNotifications();
      notificationStore.notify();
    }
  },

  // Mark all as read
  markAllAsRead: () => {
    loadNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications();
    notificationStore.notify();
  },

  // Clear all notifications
  clearAll: () => {
    notifications = [];
    saveNotifications();
    notificationStore.notify();
  },

  // Remove specific notification (and remember it was deleted)
  remove: (notificationId) => {
    loadNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      // Record this notification as deleted so it won't be re-added for this user
      const hash = createNotificationHash(notification);
      const deletedHashes = loadDeletedHashes();
      if (!deletedHashes.includes(hash)) {
        deletedHashes.push(hash);
        saveDeletedHashes(deletedHashes);
      }
    }
    
    notifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications();
    notificationStore.notify();
  },
  
  // Clear all deleted notification tracking for current user (admin/debug function)
  clearDeletedTracking: () => {
    saveDeletedHashes([]);
  },

  // Add student-specific notifications
  notifyQuizStartingSoon: (quizTitle) => {
    notificationStore.add({
      type: "quiz_starting",
      title: "Quiz Starting Soon",
      message: `${quizTitle} is starting now!`,
      icon: "🚀",
      color: "#f97316",
    });
  },

  notifyQuizLive: (quizTitle) => {
    notificationStore.add({
      type: "quiz_live",
      title: "Quiz Live",
      message: `${quizTitle} is now available. Start attempting!`,
      icon: "🔴",
      color: "#dc2626",
    });
  },

  notifyQuizEnded: (quizTitle) => {
    notificationStore.add({
      type: "quiz_ended",
      title: "Quiz Ended",
      message: `${quizTitle} has ended.`,
      icon: "⏱️",
      color: "#7c3aed",
    });
  },

  notifyResultsAvailable: (quizTitle) => {
    notificationStore.add({
      type: "results_available",
      title: "Quiz Ended",
      message: `Now you can see the results or solutions of ${quizTitle}`,
      icon: "✅",
      color: "#16a34a",
    });
  },

  // Add examiner-specific notifications
  notifyNewAttempt: (candidateName, quizTitle) => {
    notificationStore.add({
      type: "new_attempt",
      title: "New Attempt",
      message: `${candidateName} attempted ${quizTitle}`,
      icon: "📝",
      color: "#16a34a",
    });
  },

  notifyQuizStartedExaminer: (quizTitle) => {
    notificationStore.add({
      type: "quiz_started_examiner",
      title: "Quiz Started",
      message: `${quizTitle} is now live!`,
      icon: "🔴",
      color: "#dc2626",
    });
  },

  notifyQuizEndedExaminer: (quizTitle) => {
    notificationStore.add({
      type: "quiz_ended_examiner",
      title: "Quiz Ended",
      message: `${quizTitle} has ended.`,
      icon: "⏱️",
      color: "#7c3aed",
    });
  },

  notifyQuizCreated: (quizTitle) => {
    notificationStore.add({
      type: "quiz_created",
      title: "Quiz Created",
      message: `${quizTitle} has been created successfully!`,
      icon: "✨",
      color: "#2563eb",
    });
  },
};
