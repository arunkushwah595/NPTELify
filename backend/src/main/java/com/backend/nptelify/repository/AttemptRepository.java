package com.backend.nptelify.repository;

import com.backend.nptelify.entity.Attempt;
import com.backend.nptelify.entity.Quiz;
import com.backend.nptelify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByCandidate(User candidate);
    List<Attempt> findByQuiz(Quiz quiz);
    Optional<Attempt> findByCandidateAndQuiz(User candidate, Quiz quiz);
    List<Attempt> findAllByCandidateAndQuiz(User candidate, Quiz quiz);
}
