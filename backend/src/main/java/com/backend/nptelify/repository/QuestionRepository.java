package com.backend.nptelify.repository;

import com.backend.nptelify.entity.Question;
import com.backend.nptelify.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuiz(Quiz quiz);
    long countByQuiz(Quiz quiz);
}
