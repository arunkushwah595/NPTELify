package com.backend.nptelify.dto;

import com.backend.nptelify.entity.SchedulingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO containing quiz info + candidate-specific attempt data.
 * Used to enrich quiz display with attempt history.
 */
public class CandidateQuizDataResponse {

    private Long quizId;
    private String title;
    private String subject;
    private int durationMinutes;
    private SchedulingMode schedulingMode;
    private LocalDateTime scheduledDateTime;
    private LocalDateTime windowEndDateTime;
    private String examinerName;
    private List<QuestionDto> questions;
    private boolean allowMultipleAttempts;
    
    // Candidate-specific attempt info
    private int attemptCount;           // Total attempts by this candidate
    private int bestScore;              // Best score among all attempts
    private int totalQuestions;         // Total questions in quiz
    private LocalDateTime lastAttemptAt; // Timestamp of most recent attempt
    private boolean hasAttempted;       // If candidate has attempted this quiz

    public CandidateQuizDataResponse() {}

    public CandidateQuizDataResponse(
            Long quizId, String title, String subject, int durationMinutes,
            SchedulingMode schedulingMode, LocalDateTime scheduledDateTime, LocalDateTime windowEndDateTime,
            String examinerName, List<QuestionDto> questions,
            boolean allowMultipleAttempts, int attemptCount, int bestScore, int totalQuestions,
            LocalDateTime lastAttemptAt) {
        this.quizId = quizId;
        this.title = title;
        this.subject = subject;
        this.durationMinutes = durationMinutes;
        this.schedulingMode = schedulingMode;
        this.scheduledDateTime = scheduledDateTime;
        this.windowEndDateTime = windowEndDateTime;
        this.examinerName = examinerName;
        this.questions = questions;
        this.allowMultipleAttempts = allowMultipleAttempts;
        this.attemptCount = attemptCount;
        this.bestScore = bestScore;
        this.totalQuestions = totalQuestions;
        this.lastAttemptAt = lastAttemptAt;
        this.hasAttempted = attemptCount > 0;
    }

    // Legacy constructor for backward compatibility
    public CandidateQuizDataResponse(
            Long quizId, String title, String subject, int durationMinutes,
            LocalDateTime scheduledDateTime, String examinerName, List<QuestionDto> questions,
            boolean allowMultipleAttempts, int attemptCount, int bestScore, int totalQuestions,
            LocalDateTime lastAttemptAt) {
        this(quizId, title, subject, durationMinutes, SchedulingMode.FIXED_TIME, 
             scheduledDateTime, null, examinerName, questions, allowMultipleAttempts, 
             attemptCount, bestScore, totalQuestions, lastAttemptAt);
    }

    // Getters and setters
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public SchedulingMode getSchedulingMode() { return schedulingMode; }
    public void setSchedulingMode(SchedulingMode schedulingMode) { this.schedulingMode = schedulingMode; }

    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }

    public LocalDateTime getWindowEndDateTime() { return windowEndDateTime; }
    public void setWindowEndDateTime(LocalDateTime windowEndDateTime) { this.windowEndDateTime = windowEndDateTime; }

    public String getExaminerName() { return examinerName; }
    public void setExaminerName(String examinerName) { this.examinerName = examinerName; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public boolean isAllowMultipleAttempts() { return allowMultipleAttempts; }
    public void setAllowMultipleAttempts(boolean allowMultipleAttempts) { this.allowMultipleAttempts = allowMultipleAttempts; }

    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }

    public int getBestScore() { return bestScore; }
    public void setBestScore(int bestScore) { this.bestScore = bestScore; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public LocalDateTime getLastAttemptAt() { return lastAttemptAt; }
    public void setLastAttemptAt(LocalDateTime lastAttemptAt) { this.lastAttemptAt = lastAttemptAt; }

    public boolean isHasAttempted() { return hasAttempted; }
    public void setHasAttempted(boolean hasAttempted) { this.hasAttempted = hasAttempted; }

    public static class QuestionDto {
        private Long id;
        private String text;
        private List<String> options;

        public QuestionDto(Long id, String text, List<String> options) {
            this.id = id;
            this.text = text;
            this.options = options == null ? List.of() : new ArrayList<>(options);
        }

        public Long getId() { return id; }
        public String getText() { return text; }
        public List<String> getOptions() { return options; }
    }
}
