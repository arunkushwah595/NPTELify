package com.backend.nptelify.service;

import com.backend.nptelify.entity.Quiz;
import com.backend.nptelify.entity.SchedulingMode;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Service for calculating quiz timing and validating time-based quiz constraints.
 * Provides backend-driven timer calculations to prevent client-side manipulation.
 */
@Service
public class QuizTimerService {

    /**
     * Calculate the remaining time for a quiz in minutes.
     * Returns 0 if quiz is no longer available.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time (typically server time)
     * @return Remaining minutes (0 or positive if quiz is available, negative if expired)
     */
    public long getRemainingMinutes(Quiz quiz, LocalDateTime currentTime) {
        if (quiz == null || quiz.getSchedulingMode() == null) {
            return 0;
        }

        LocalDateTime endTime = null;

        if (quiz.getSchedulingMode() == SchedulingMode.FIXED_TIME) {
            // For FIXED_TIME: end time is start + duration
            if (quiz.getScheduledDateTime() != null) {
                endTime = quiz.getScheduledDateTime().plusMinutes(quiz.getDurationMinutes());
            }
        } else if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            // For WINDOW: use the window end time
            endTime = quiz.getWindowEndDateTime();
        }

        if (endTime == null) {
            return 0;
        }

        long remainingMinutes = ChronoUnit.MINUTES.between(currentTime, endTime);
        return Math.max(0, remainingMinutes);
    }

    /**
     * Check if a candidate can start a quiz at the given time.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time
     * @return true if candidate can start the quiz, false otherwise
     */
    public boolean canStartQuiz(Quiz quiz, LocalDateTime currentTime) {
        if (quiz == null || quiz.getSchedulingMode() == null) {
            return false;
        }

        if (quiz.getSchedulingMode() == SchedulingMode.FIXED_TIME) {
            // For FIXED_TIME: must start after or at the scheduled time
            if (quiz.getScheduledDateTime() == null) {
                return false;
            }
            LocalDateTime endTime = quiz.getScheduledDateTime().plusMinutes(quiz.getDurationMinutes());
            return currentTime.isAfter(quiz.getScheduledDateTime()) || currentTime.isEqual(quiz.getScheduledDateTime());
        } else if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            // For WINDOW: must be within the window
            if (quiz.getScheduledDateTime() == null || quiz.getWindowEndDateTime() == null) {
                return false;
            }
            return (currentTime.isAfter(quiz.getScheduledDateTime()) || currentTime.isEqual(quiz.getScheduledDateTime())) &&
                   (currentTime.isBefore(quiz.getWindowEndDateTime()) || currentTime.isEqual(quiz.getWindowEndDateTime()));
        }

        return false;
    }

    /**
     * Check if a quiz has ended at the given time.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time
     * @return true if quiz has ended, false otherwise
     */
    public boolean hasQuizEnded(Quiz quiz, LocalDateTime currentTime) {
        return getRemainingMinutes(quiz, currentTime) <= 0;
    }

    /**
     * Get the effective duration for a candidate taking the quiz.
     * For FIXED_TIME mode, if joining late, duration is reduced.
     * For WINDOW mode, duration is always the full duration.
     * 
     * @param quiz The quiz entity
     * @param currentTime The time when candidate starts
     * @return Effective duration in minutes
     */
    public long getEffectiveDurationMinutes(Quiz quiz, LocalDateTime currentTime) {
        if (quiz == null) {
            return 0;
        }

        if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            // WINDOW mode: always full duration
            return quiz.getDurationMinutes();
        } else if (quiz.getSchedulingMode() == SchedulingMode.FIXED_TIME) {
            // FIXED_TIME mode: reduced if joining late
            if (quiz.getScheduledDateTime() == null) {
                return quiz.getDurationMinutes();
            }

            LocalDateTime quizStart = quiz.getScheduledDateTime();
            LocalDateTime quizEnd = quizStart.plusMinutes(quiz.getDurationMinutes());

            // If joining before or at start time, get full duration
            if (currentTime.isBefore(quizStart) || currentTime.isEqual(quizStart)) {
                return quiz.getDurationMinutes();
            }

            // If joining late, calculate remaining duration
            long minutesLate = ChronoUnit.MINUTES.between(quizStart, currentTime);
            long remainingDuration = quiz.getDurationMinutes() - minutesLate;

            return Math.max(0, remainingDuration);
        }

        return quiz.getDurationMinutes();
    }

    /**
     * Calculate the actual end time for a candidate based on when they start.
     * 
     * @param quiz The quiz entity
     * @param startTime The time when candidate starts
     * @return The time when the quiz will end for this candidate
     */
    public LocalDateTime getQuizEndTimeForCandidate(Quiz quiz, LocalDateTime startTime) {
        if (quiz == null) {
            return null;
        }

        long effectiveDuration = getEffectiveDurationMinutes(quiz, startTime);
        return startTime.plusMinutes(effectiveDuration);
    }

    /**
     * Check if a candidate is joining late for a FIXED_TIME quiz.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time
     * @return true if joining after start time for FIXED_TIME quiz, false otherwise
     */
    public boolean isLatJoin(Quiz quiz, LocalDateTime currentTime) {
        if (quiz == null || quiz.getSchedulingMode() != SchedulingMode.FIXED_TIME) {
            return false;
        }

        if (quiz.getScheduledDateTime() == null) {
            return false;
        }

        return currentTime.isAfter(quiz.getScheduledDateTime());
    }

    /**
     * Get minutes late for a late join.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time
     * @return Minutes late (0 if not late, positive number if late)
     */
    public long getMinutesLate(Quiz quiz, LocalDateTime currentTime) {
        if (!isLatJoin(quiz, currentTime)) {
            return 0;
        }

        return Math.abs(ChronoUnit.MINUTES.between(quiz.getScheduledDateTime(), currentTime));
    }
}
