package com.backend.nptelify.dto;

import com.backend.nptelify.entity.SchedulingMode;
import java.time.LocalDateTime;

/**
 * Response DTO containing quiz timing and status information.
 * Used to provide backend-driven timer calculations to frontend.
 * Frontend should recalculate remaining time using this base time to prevent manipulation.
 */
public class QuizStatusResponse {

    private Long quizId;
    
    // Current server time - base for all time calculations
    private LocalDateTime serverTime;
    
    // Scheduling mode (FIXED_TIME or WINDOW)
    private SchedulingMode schedulingMode;
    
    // Quiz start time (for FIXED_TIME: global start; for WINDOW: window start)
    private LocalDateTime startTime;
    
    // Quiz end time (for FIXED_TIME: start + duration; for WINDOW: window end)
    private LocalDateTime endTime;
    
    // Remaining minutes for the quiz
    private long remainingMinutes;
    
    // Quiz status: UPCOMING, LIVE, ENDED
    private QuizStatus status;
    
    // Whether this is a late join (only for FIXED_TIME mode)
    private boolean isLateJoin;
    
    // Minutes late (only for FIXED_TIME mode)
    private long minutesLate;
    
    // Effective duration for this candidate in minutes
    private long effectiveDurationMinutes;
    
    // Message for display (e.g., "You joined 5 minutes late, 25 minutes remaining")
    private String statusMessage;
    
    // Whether the quiz allows multiple attempts
    private boolean allowMultipleAttempts;

    // Constructors
    public QuizStatusResponse(Long quizId, LocalDateTime serverTime, SchedulingMode schedulingMode,
                              LocalDateTime startTime, LocalDateTime endTime, long remainingMinutes,
                              QuizStatus status, boolean isLateJoin, long minutesLate,
                              long effectiveDurationMinutes, String statusMessage, boolean allowMultipleAttempts) {
        this.quizId = quizId;
        this.serverTime = serverTime;
        this.schedulingMode = schedulingMode;
        this.startTime = startTime;
        this.endTime = endTime;
        this.remainingMinutes = remainingMinutes;
        this.status = status;
        this.isLateJoin = isLateJoin;
        this.minutesLate = minutesLate;
        this.effectiveDurationMinutes = effectiveDurationMinutes;
        this.statusMessage = statusMessage;
        this.allowMultipleAttempts = allowMultipleAttempts;
    }

    // Getters
    public Long getQuizId() { return quizId; }
    public LocalDateTime getServerTime() { return serverTime; }
    public SchedulingMode getSchedulingMode() { return schedulingMode; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public long getRemainingMinutes() { return remainingMinutes; }
    public QuizStatus getStatus() { return status; }
    public boolean isLateJoin() { return isLateJoin; }
    public long getMinutesLate() { return minutesLate; }
    public long getEffectiveDurationMinutes() { return effectiveDurationMinutes; }
    public String getStatusMessage() { return statusMessage; }
    public boolean isAllowMultipleAttempts() { return allowMultipleAttempts; }

    // Setters
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public void setServerTime(LocalDateTime serverTime) { this.serverTime = serverTime; }
    public void setSchedulingMode(SchedulingMode schedulingMode) { this.schedulingMode = schedulingMode; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public void setRemainingMinutes(long remainingMinutes) { this.remainingMinutes = remainingMinutes; }
    public void setStatus(QuizStatus status) { this.status = status; }
    public void setIsLateJoin(boolean isLateJoin) { this.isLateJoin = isLateJoin; }
    public void setMinutesLate(long minutesLate) { this.minutesLate = minutesLate; }
    public void setEffectiveDurationMinutes(long effectiveDurationMinutes) { this.effectiveDurationMinutes = effectiveDurationMinutes; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
    public void setAllowMultipleAttempts(boolean allowMultipleAttempts) { this.allowMultipleAttempts = allowMultipleAttempts; }

    // Enum for quiz status
    public enum QuizStatus {
        UPCOMING,  // Quiz has not started yet
        LIVE,      // Quiz is currently available
        ENDED      // Quiz has ended
    }
}
