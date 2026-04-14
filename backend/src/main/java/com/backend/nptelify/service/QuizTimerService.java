package com.backend.nptelify.service;

import com.backend.nptelify.entity.Quiz;
import com.backend.nptelify.entity.SchedulingMode;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Service for calculating quiz timing and validating time-based quiz constraints.
 * Provides backend-driven timer calculations to prevent client-side manipulation.
 * 
 * ⚠️ IMPORTANT: This service handles the timezone mismatch between:
 * - Naive LocalDateTime stored in DB (created by frontend without timezone)
 * - UTC time used for server-side calculations
 * 
 * Solution: Treat all stored quiz times as if they're in the server's assumed timezone (IST/UTC+5:30)
 * and convert them to UTC for consistent comparisons.
 */
@Service
public class QuizTimerService {

    /**
     * Calculate the remaining time for a quiz in minutes.
     * Returns 0 if quiz is no longer available.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time (expected to be UTC)
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
                // ⚠️ The stored scheduledDateTime is naive (created by frontend)
                // Treat it as IST (Asia/Kolkata) and convert to UTC for comparison
                LocalDateTime storedTime = quiz.getScheduledDateTime();
                ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
                LocalDateTime utcTime = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
                endTime = utcTime.plusMinutes(quiz.getDurationMinutes());
            }
        } else if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            // For WINDOW: use the window end time
            if (quiz.getWindowEndDateTime() != null) {
                // ⚠️ The stored windowEndDateTime is naive (created by frontend)
                LocalDateTime storedTime = quiz.getWindowEndDateTime();
                ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
                endTime = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
            }
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
     * @param currentTime The current time (UTC)
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
            // Convert stored IST time to UTC
            LocalDateTime storedTime = quiz.getScheduledDateTime();
            ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
            LocalDateTime scheduledUtc = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
            LocalDateTime endTime = scheduledUtc.plusMinutes(quiz.getDurationMinutes());
            
            return (currentTime.isAfter(scheduledUtc) || currentTime.isEqual(scheduledUtc)) && currentTime.isBefore(endTime);
        } else if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            // For WINDOW: must be within the window
            if (quiz.getScheduledDateTime() == null || quiz.getWindowEndDateTime() == null) {
                return false;
            }
            // Convert both stored times from IST to UTC
            LocalDateTime storedStart = quiz.getScheduledDateTime();
            LocalDateTime storedEnd = quiz.getWindowEndDateTime();
            
            ZonedDateTime istStart = storedStart.atZone(ZoneId.of("Asia/Kolkata"));
            LocalDateTime windowStartUtc = istStart.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
            
            ZonedDateTime istEnd = storedEnd.atZone(ZoneId.of("Asia/Kolkata"));
            LocalDateTime windowEndUtc = istEnd.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
            
            return (currentTime.isAfter(windowStartUtc) || currentTime.isEqual(windowStartUtc)) &&
                   (currentTime.isBefore(windowEndUtc) || currentTime.isEqual(windowEndUtc));
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
     * @param currentTime The time when candidate starts (UTC)
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

            // Convert stored IST time to UTC
            LocalDateTime storedTime = quiz.getScheduledDateTime();
            ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
            LocalDateTime quizStartUtc = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
            LocalDateTime quizEnd = quizStartUtc.plusMinutes(quiz.getDurationMinutes());

            // If joining before or at start time, get full duration
            if (currentTime.isBefore(quizStartUtc) || currentTime.isEqual(quizStartUtc)) {
                return quiz.getDurationMinutes();
            }

            // If joining late, calculate remaining duration
            long minutesLate = ChronoUnit.MINUTES.between(quizStartUtc, currentTime);
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
     * @param currentTime The current time (UTC)
     * @return true if joining after start time for FIXED_TIME quiz, false otherwise
     */
    public boolean isLatJoin(Quiz quiz, LocalDateTime currentTime) {
        if (quiz == null || quiz.getSchedulingMode() != SchedulingMode.FIXED_TIME) {
            return false;
        }

        if (quiz.getScheduledDateTime() == null) {
            return false;
        }

        // Convert stored IST time to UTC
        LocalDateTime storedTime = quiz.getScheduledDateTime();
        ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
        LocalDateTime scheduledUtc = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();

        return currentTime.isAfter(scheduledUtc);
    }

    /**
     * Get minutes late for a late join.
     * 
     * @param quiz The quiz entity
     * @param currentTime The current time (UTC)
     * @return Minutes late (0 if not late, positive number if late)
     */
    public long getMinutesLate(Quiz quiz, LocalDateTime currentTime) {
        if (!isLatJoin(quiz, currentTime)) {
            return 0;
        }

        // Convert stored IST time to UTC
        LocalDateTime storedTime = quiz.getScheduledDateTime();
        ZonedDateTime istTime = storedTime.atZone(ZoneId.of("Asia/Kolkata"));
        LocalDateTime scheduledUtc = istTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();

        return Math.abs(ChronoUnit.MINUTES.between(scheduledUtc, currentTime));
    }
}
