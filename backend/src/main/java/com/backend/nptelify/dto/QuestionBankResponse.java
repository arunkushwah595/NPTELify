package com.backend.nptelify.dto;

import java.time.LocalDateTime;

public class QuestionBankResponse {
    private Long questionId;
    private String text;
    private java.util.List<String> options;
    private int correctOption;
    private LocalDateTime addedAt;
    private Long quizId;
    private String quizTitle;

    public QuestionBankResponse() {}

    // Getters and Setters
    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public java.util.List<String> getOptions() {
        return options;
    }

    public void setOptions(java.util.List<String> options) {
        this.options = options;
    }

    public int getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(int correctOption) {
        this.correctOption = correctOption;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
}
