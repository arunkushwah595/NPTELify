package com.backend.nptelify.repository;

import com.backend.nptelify.entity.Question;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.entity.UserQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserQuestionBankRepository extends JpaRepository<UserQuestionBank, Long> {
    List<UserQuestionBank> findByUserOrderByAddedAtDesc(User user);

    Optional<UserQuestionBank> findByUserAndQuestion(User user, Question question);

    boolean existsByUserAndQuestion(User user, Question question);

    long countByUser(User user);
}
