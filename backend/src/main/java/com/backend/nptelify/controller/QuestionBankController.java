package com.backend.nptelify.controller;

import com.backend.nptelify.dto.QuestionBankResponse;
import com.backend.nptelify.entity.Question;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.entity.UserQuestionBank;
import com.backend.nptelify.repository.QuestionRepository;
import com.backend.nptelify.service.QuestionBankService;
import com.backend.nptelify.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/question-bank")
public class QuestionBankController {

    @Autowired
    private QuestionBankService questionBankService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Add a question to user's question bank
     */
    @PostMapping("/add/{questionId}")
    public ResponseEntity<Map<String, String>> addToQuestionBank(@PathVariable Long questionId) {
        User user = userDetailsService.getCurrentUser();
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        questionBankService.addToQuestionBank(user, question);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Question added to question bank");
        return ResponseEntity.ok(response);
    }

    /**
     * Remove a question from user's question bank
     */
    @PostMapping("/remove/{questionId}")
    public ResponseEntity<Map<String, String>> removeFromQuestionBank(@PathVariable Long questionId) {
        User user = userDetailsService.getCurrentUser();
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        questionBankService.removeFromQuestionBank(user, question);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Question removed from question bank");
        return ResponseEntity.ok(response);
    }

    /**
     * Get all questions in user's question bank
     */
    @GetMapping
    public ResponseEntity<List<QuestionBankResponse>> getQuestionBank() {
        User user = userDetailsService.getCurrentUser();
        List<UserQuestionBank> userQuestions = questionBankService.getUserQuestionBank(user);
        List<QuestionBankResponse> response = userQuestions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Check if question is in user's question bank
     */
    @GetMapping("/check/{questionId}")
    public ResponseEntity<Map<String, Boolean>> checkInQuestionBank(@PathVariable Long questionId) {
        User user = userDetailsService.getCurrentUser();
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        boolean isInBank = questionBankService.isInQuestionBank(user, question);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("isInQuestionBank", isInBank);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of questions in user's question bank
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getQuestionBankCount() {
        User user = userDetailsService.getCurrentUser();
        long count = questionBankService.getQuestionBankSize(user);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Clear all questions from user's question bank
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearQuestionBank() {
        User user = userDetailsService.getCurrentUser();
        questionBankService.clearQuestionBank(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Question bank cleared");
        return ResponseEntity.ok(response);
    }

    // Helper method to convert entity to DTO
    private QuestionBankResponse toResponse(UserQuestionBank userQuestion) {
        Question question = userQuestion.getQuestion();
        QuestionBankResponse dto = new QuestionBankResponse();
        dto.setQuestionId(question.getId());
        dto.setText(question.getText());
        dto.setOptions(question.getOptions());
        dto.setCorrectOption(question.getCorrectOption());
        dto.setAddedAt(userQuestion.getAddedAt());
        dto.setQuizId(question.getQuiz().getId());
        dto.setQuizTitle(question.getQuiz().getTitle());
        return dto;
    }
}
