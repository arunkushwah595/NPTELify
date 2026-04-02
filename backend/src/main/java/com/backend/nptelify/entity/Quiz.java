package com.backend.nptelify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String subject;

    @Column(nullable = false)
    private int durationMinutes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Scheduling Mode: FIXED_TIME or WINDOW
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private SchedulingMode schedulingMode = SchedulingMode.FIXED_TIME;

    // For FIXED_TIME mode: the global start time
    // For WINDOW mode: the window start time
    @Column
    private LocalDateTime scheduledDateTime;

    // For WINDOW mode only: the window end time
    // For FIXED_TIME mode: this should be null
    @Column
    private LocalDateTime windowEndDateTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examiner_id", nullable = false)
    private User examiner;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @Column(nullable = false)
    private boolean allowMultipleAttempts = false;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public SchedulingMode getSchedulingMode() { return schedulingMode; }
    public void setSchedulingMode(SchedulingMode schedulingMode) { this.schedulingMode = schedulingMode; }

    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }

    public LocalDateTime getWindowEndDateTime() { return windowEndDateTime; }
    public void setWindowEndDateTime(LocalDateTime windowEndDateTime) { this.windowEndDateTime = windowEndDateTime; }

    public User getExaminer() { return examiner; }
    public void setExaminer(User examiner) { this.examiner = examiner; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public boolean isAllowMultipleAttempts() { return allowMultipleAttempts; }
    public void setAllowMultipleAttempts(boolean allowMultipleAttempts) { this.allowMultipleAttempts = allowMultipleAttempts; }
}
