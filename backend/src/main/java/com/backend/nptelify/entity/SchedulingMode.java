package com.backend.nptelify.entity;

/**
 * Enum to define quiz scheduling modes
 */
public enum SchedulingMode {
    /**
     * FIXED_TIME: Quiz has a fixed start time and global duration
     * Candidate gets remaining time based on when they join
     */
    FIXED_TIME,
    
    /**
     * WINDOW: Quiz is available within a time window
     * Candidate can start anytime within window and gets full duration
     */
    WINDOW
}
