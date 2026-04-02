package com.backend.nptelify.dto;

import com.backend.nptelify.entity.SchedulingMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class QuizRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String subject;

    @Min(1)
    private int durationMinutes;

    @NotNull
    private SchedulingMode schedulingMode = SchedulingMode.FIXED_TIME;

    // Start time - for FIXED_TIME: quiz start time; for WINDOW: window start time
    private LocalDateTime scheduledDateTime;

    // For WINDOW mode only: the end of the time window
    private LocalDateTime windowEndDateTime;

    private boolean allowMultipleAttempts = false;

    @NotEmpty
    @Valid
    private List<QuestionDto> questions;

    // Getters and setters
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

    public boolean isAllowMultipleAttempts() { return allowMultipleAttempts; }
    public void setAllowMultipleAttempts(boolean allowMultipleAttempts) { this.allowMultipleAttempts = allowMultipleAttempts; }

    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public static class QuestionDto {
        @NotBlank
        private String text;

        @NotEmpty
        private List<String> options;

        @NotNull
        private Integer correctOption;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }

        public Integer getCorrectOption() { return correctOption; }
        public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }
    }
}
