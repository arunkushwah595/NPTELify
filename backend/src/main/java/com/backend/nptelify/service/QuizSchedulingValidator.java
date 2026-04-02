package com.backend.nptelify.service;

import com.backend.nptelify.entity.Quiz;
import com.backend.nptelify.entity.SchedulingMode;
import com.backend.nptelify.dto.QuizRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Service for validating quiz scheduling configurations.
 * Ensures that quizzes are configured correctly based on their scheduling mode.
 */
@Service
public class QuizSchedulingValidator {

    /**
     * Validate a quiz request based on its scheduling mode.
     * Throws an exception if validation fails.
     * 
     * @param request The quiz request containing scheduling details
     * @throws IllegalArgumentException if validation fails
     */
    public void validateQuizRequest(QuizRequest request) throws IllegalArgumentException {
        if (request.getSchedulingMode() == null) {
            throw new IllegalArgumentException("Scheduling mode is required");
        }

        if (request.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }

        if (request.getSchedulingMode() == SchedulingMode.FIXED_TIME) {
            validateFixedTimeMode(request);
        } else if (request.getSchedulingMode() == SchedulingMode.WINDOW) {
            validateWindowMode(request);
        }
    }

    /**
     * Validate FIXED_TIME mode configuration.
     * In FIXED_TIME mode:
     * - scheduledDateTime is required (the global start time)
     * - windowEndDateTime must be null
     * 
     * @param request The quiz request
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFixedTimeMode(QuizRequest request) throws IllegalArgumentException {
        if (request.getScheduledDateTime() == null) {
            throw new IllegalArgumentException("Scheduled start time is required for FIXED_TIME mode");
        }

        if (request.getWindowEndDateTime() != null) {
            throw new IllegalArgumentException("Window end time should not be set for FIXED_TIME mode");
        }

        // Start time should be in the future
        if (request.getScheduledDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Quiz start time cannot be in the past");
        }
    }

    /**
     * Validate WINDOW mode configuration.
     * In WINDOW mode:
     * - scheduledDateTime is required (window start time)
     * - windowEndDateTime is required (window end time)
     * - Duration must be <= (window end - window start)
     * 
     * @param request The quiz request
     * @throws IllegalArgumentException if validation fails
     */
    private void validateWindowMode(QuizRequest request) throws IllegalArgumentException {
        if (request.getScheduledDateTime() == null) {
            throw new IllegalArgumentException("Window start time is required for WINDOW mode");
        }

        if (request.getWindowEndDateTime() == null) {
            throw new IllegalArgumentException("Window end time is required for WINDOW mode");
        }

        // Window start should not be before now
        if (request.getScheduledDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Window start time cannot be in the past");
        }

        // Window end must be after window start
        if (request.getWindowEndDateTime().isBefore(request.getScheduledDateTime()) ||
            request.getWindowEndDateTime().isEqual(request.getScheduledDateTime())) {
            throw new IllegalArgumentException("Window end time must be after window start time");
        }

        // Duration must not exceed window duration
        long windowDurationMinutes = ChronoUnit.MINUTES.between(
            request.getScheduledDateTime(),
            request.getWindowEndDateTime()
        );

        if (request.getDurationMinutes() > windowDurationMinutes) {
            throw new IllegalArgumentException(
                String.format("Quiz duration (%d min) cannot exceed window duration (%d min)",
                    request.getDurationMinutes(),
                    windowDurationMinutes)
            );
        }

        // Window should be at least as long as duration
        if (windowDurationMinutes < request.getDurationMinutes()) {
            throw new IllegalArgumentException(
                "Window duration must be at least equal to quiz duration"
            );
        }
    }

    /**
     * Validate a quiz entity.
     * 
     * @param quiz The quiz entity
     * @throws IllegalArgumentException if validation fails
     */
    public void validateQuiz(Quiz quiz) throws IllegalArgumentException {
        if (quiz.getSchedulingMode() == null) {
            throw new IllegalArgumentException("Quiz scheduling mode cannot be null");
        }

        if (quiz.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Quiz duration must be greater than 0");
        }

        if (quiz.getSchedulingMode() == SchedulingMode.FIXED_TIME) {
            if (quiz.getScheduledDateTime() == null) {
                throw new IllegalArgumentException("Scheduled start time is required for FIXED_TIME mode quiz");
            }
            if (quiz.getWindowEndDateTime() != null) {
                throw new IllegalArgumentException("FIXED_TIME mode quiz should not have window end time");
            }
        } else if (quiz.getSchedulingMode() == SchedulingMode.WINDOW) {
            if (quiz.getScheduledDateTime() == null || quiz.getWindowEndDateTime() == null) {
                throw new IllegalArgumentException("Both window start and end times are required for WINDOW mode quiz");
            }

            long windowDurationMinutes = ChronoUnit.MINUTES.between(
                quiz.getScheduledDateTime(),
                quiz.getWindowEndDateTime()
            );

            if (quiz.getDurationMinutes() > windowDurationMinutes) {
                throw new IllegalArgumentException(
                    "Quiz duration exceeds window duration for WINDOW mode quiz"
                );
            }
        }
    }
}
