/**
 * Quiz Progress Store
 * Manages saving and loading quiz progress across sessions
 * Allows users to resume quizzes after logout/disconnect
 */

const QUIZ_PROGRESS_PREFIX = "quiz_progress_";

export const quizProgressStore = {
  /**
   * Save current quiz progress to localStorage
   * @param {number} quizId - Quiz ID
   * @param {Array} answers - Array of answers
   * @param {Set} markedForReview - Set of marked question indices
   * @param {Set} bookmarkedQuestions - Set of bookmarked question indices
   * @param {number} tabSwitchCount - Number of tab switches
   */
  saveProgress: (quizId, answers, markedForReview, bookmarkedQuestions, tabSwitchCount) => {
    const progress = {
      quizId,
      answers,
      markedForReview: Array.from(markedForReview),
      bookmarkedQuestions: Array.from(bookmarkedQuestions),
      tabSwitchCount,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${QUIZ_PROGRESS_PREFIX}${quizId}`, JSON.stringify(progress));
  },

  /**
   * Load quiz progress from localStorage
   * @param {number} quizId - Quiz ID
   * @returns {Object|null} - Progress object or null if not found
   */
  loadProgress: (quizId) => {
    const stored = localStorage.getItem(`${QUIZ_PROGRESS_PREFIX}${quizId}`);
    if (!stored) return null;
    
    try {
      const progress = JSON.parse(stored);
      // Convert arrays back to Sets
      progress.markedForReview = new Set(progress.markedForReview || []);
      progress.bookmarkedQuestions = new Set(progress.bookmarkedQuestions || []);
      return progress;
    } catch (e) {
      console.error("Failed to load quiz progress:", e);
      return null;
    }
  },

  /**
   * Clear quiz progress for a specific quiz
   * @param {number} quizId - Quiz ID
   */
  clearProgress: (quizId) => {
    localStorage.removeItem(`${QUIZ_PROGRESS_PREFIX}${quizId}`);
  },

  /**
   * Get all in-progress quizzes
   * @returns {Array} - Array of quiz IDs with progress
   */
  getInProgressQuizzes: () => {
    const quizzes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(QUIZ_PROGRESS_PREFIX)) {
        const quizId = key.replace(QUIZ_PROGRESS_PREFIX, "");
        quizzes.push(parseInt(quizId, 10));
      }
    }
    return quizzes;
  },

  /**
   * Check if quiz is in progress
   * @param {number} quizId - Quiz ID
   * @returns {boolean}
   */
  isInProgress: (quizId) => {
    return localStorage.getItem(`${QUIZ_PROGRESS_PREFIX}${quizId}`) !== null;
  },
};
