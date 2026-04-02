package com.backend.nptelify.dto;

import com.backend.nptelify.entity.SchedulingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class QuizResponse {

    private Long id;
    private String title;
    private String subject;
    private int durationMinutes;
    private LocalDateTime createdAt;
    private SchedulingMode schedulingMode;
    private LocalDateTime scheduledDateTime;
    private LocalDateTime windowEndDateTime;
    private String examinerName;
    private List<QuestionDto> questions;
    private int attemptCount;
    private boolean allowMultipleAttempts;

    public QuizResponse(Long id, String title, String subject, int durationMinutes,
                        LocalDateTime createdAt, LocalDateTime scheduledDateTime, String examinerName, List<QuestionDto> questions,
                        int attemptCount) {
        this(id, title, subject, durationMinutes, createdAt, SchedulingMode.FIXED_TIME, scheduledDateTime, null, examinerName, questions, attemptCount, false);
    }

    public QuizResponse(Long id, String title, String subject, int durationMinutes,
                        LocalDateTime createdAt, LocalDateTime scheduledDateTime, String examinerName, List<QuestionDto> questions,
                        int attemptCount, boolean allowMultipleAttempts) {
        this(id, title, subject, durationMinutes, createdAt, SchedulingMode.FIXED_TIME, scheduledDateTime, null, examinerName, questions, attemptCount, allowMultipleAttempts);
    }

    public QuizResponse(Long id, String title, String subject, int durationMinutes,
                        LocalDateTime createdAt, SchedulingMode schedulingMode, LocalDateTime scheduledDateTime, LocalDateTime windowEndDateTime,
                        String examinerName, List<QuestionDto> questions, int attemptCount, boolean allowMultipleAttempts) {
        this.id = id;
        this.title = title;
        this.subject = subject;
        this.durationMinutes = durationMinutes;
        this.createdAt = createdAt;
        this.schedulingMode = schedulingMode;
        this.scheduledDateTime = scheduledDateTime;
        this.windowEndDateTime = windowEndDateTime;
        this.examinerName = examinerName;
        this.questions = questions;
        this.attemptCount = attemptCount;
        this.allowMultipleAttempts = allowMultipleAttempts;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getSubject() { return subject; }
    public int getDurationMinutes() { return durationMinutes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public SchedulingMode getSchedulingMode() { return schedulingMode; }
    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public LocalDateTime getWindowEndDateTime() { return windowEndDateTime; }
    public String getExaminerName() { return examinerName; }
    public List<QuestionDto> getQuestions() { return questions; }
    public int getAttemptCount() { return attemptCount; }
    public boolean isAllowMultipleAttempts() { return allowMultipleAttempts; }

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
