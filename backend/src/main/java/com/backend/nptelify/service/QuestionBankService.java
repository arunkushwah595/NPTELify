package com.backend.nptelify.service;

import com.backend.nptelify.entity.Question;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.entity.UserQuestionBank;
import com.backend.nptelify.repository.UserQuestionBankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionBankService {

    @Autowired
    private UserQuestionBankRepository userQuestionBankRepository;

    /**
     * Add a question to user's question bank
     */
    public UserQuestionBank addToQuestionBank(User user, Question question) {
        // Check if already exists
        if (userQuestionBankRepository.existsByUserAndQuestion(user, question)) {
            return userQuestionBankRepository.findByUserAndQuestion(user, question)
                    .orElse(new UserQuestionBank(user, question));
        }
        UserQuestionBank userQuestion = new UserQuestionBank(user, question);
        return userQuestionBankRepository.save(userQuestion);
    }

    /**
     * Remove a question from user's question bank
     */
    public void removeFromQuestionBank(User user, Question question) {
        userQuestionBankRepository.findByUserAndQuestion(user, question)
                .ifPresent(userQuestionBankRepository::delete);
    }

    /**
     * Get all questions in user's question bank
     */
    public List<UserQuestionBank> getUserQuestionBank(User user) {
        return userQuestionBankRepository.findByUserOrderByAddedAtDesc(user);
    }

    /**
     * Get all questions (without wrapper) in user's question bank
     */
    public List<Question> getUserQuestions(User user) {
        return getUserQuestionBank(user).stream()
                .map(UserQuestionBank::getQuestion)
                .collect(Collectors.toList());
    }

    /**
     * Check if question is in user's question bank
     */
    public boolean isInQuestionBank(User user, Question question) {
        return userQuestionBankRepository.existsByUserAndQuestion(user, question);
    }

    /**
     * Get count of questions in user's question bank
     */
    public long getQuestionBankSize(User user) {
        return userQuestionBankRepository.countByUser(user);
    }

    /**
     * Clear all questions from user's question bank
     */
    public void clearQuestionBank(User user) {
        List<UserQuestionBank> questions = getUserQuestionBank(user);
        userQuestionBankRepository.deleteAll(questions);
    }
}
