package com.backend.nptelify.service;

import com.backend.nptelify.dto.AttemptDetailResponse;
import com.backend.nptelify.dto.AttemptRequest;
import com.backend.nptelify.dto.AttemptResponse;
import com.backend.nptelify.entity.Attempt;
import com.backend.nptelify.entity.Question;
import com.backend.nptelify.entity.Quiz;
import com.backend.nptelify.entity.User;
import com.backend.nptelify.repository.AttemptRepository;
import com.backend.nptelify.repository.QuizRepository;
import com.backend.nptelify.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizTimerService quizTimerService;

    public AttemptService(AttemptRepository attemptRepository,
                          QuizRepository quizRepository,
                          UserRepository userRepository,
                          QuizTimerService quizTimerService) {
        this.attemptRepository = attemptRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.quizTimerService = quizTimerService;
    }

    @Transactional
    public AttemptResponse submitAttempt(Long quizId, AttemptRequest request, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        LocalDateTime now = LocalDateTime.now();

        // Validate that the quiz can be started using the timer service
        if (!quizTimerService.canStartQuiz(quiz, now)) {
            throw new IllegalArgumentException("This quiz is not available at this time");
        }

        // Check if quiz has ended
        if (quizTimerService.hasQuizEnded(quiz, now)) {
            throw new IllegalArgumentException("This quiz has ended");
        }

        // Prevent duplicate attempts ONLY if multiple attempts are NOT allowed
        if (!quiz.isAllowMultipleAttempts()) {
            attemptRepository.findByCandidateAndQuiz(candidate, quiz).ifPresent(a -> {
                throw new IllegalArgumentException("You have already attempted this quiz");
            });
        }

        List<Question> questions = quiz.getQuestions();
        List<Integer> answers = request.getAnswers();

        if (answers.size() != questions.size()) {
            throw new IllegalArgumentException("Answer count does not match question count");
        }

        int score = 0;
        for (int i = 0; i < questions.size(); i++) {
            if (answers.get(i) != null && answers.get(i) == questions.get(i).getCorrectOption()) {
                score++;
            }
        }

        Attempt attempt = new Attempt();
        attempt.setCandidate(candidate);
        attempt.setQuiz(quiz);
        attempt.setAnswers(answers);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());

        Attempt saved = attemptRepository.save(attempt);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttemptResponse> getMyAttempts(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        return attemptRepository.findByCandidate(candidate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttemptResponse> getAttemptsForQuiz(Long quizId, String examinerEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        if (!quiz.getExaminer().getEmail().equals(examinerEmail)) {
            throw new IllegalArgumentException("Access denied");
        }
        return attemptRepository.findByQuiz(quiz).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all attempts by a candidate for a specific quiz.
     * Used to retrieve attempt history for a candidate.
     */
    @Transactional(readOnly = true)
    public List<AttemptResponse> getCandidateAttemptsForQuiz(Long quizId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        return attemptRepository.findAllByCandidateAndQuiz(candidate, quiz).stream()
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt())) // Most recent first
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get the best score for a candidate in a specific quiz.
     * Returns 0 if no attempts exist.
     */
    @Transactional(readOnly = true)
    public int getBestScore(Long quizId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        List<Attempt> attempts = attemptRepository.findAllByCandidateAndQuiz(candidate, quiz);
        return attempts.stream()
                .mapToInt(Attempt::getScore)
                .max()
                .orElse(0);
    }

    private AttemptResponse toResponse(Attempt attempt) {
        return new AttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getQuiz().getSubject(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                attempt.getSubmittedAt()
        );
    }

            @Transactional(readOnly = true)
    public AttemptDetailResponse getAttemptDetail(Long attemptId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
        if (!attempt.getCandidate().getEmail().equals(candidate.getEmail())) {
            throw new IllegalArgumentException("Access denied");
        }

        List<Question> questions = attempt.getQuiz().getQuestions();
        List<Integer> answers = attempt.getAnswers();
        List<AttemptDetailResponse.QuestionResult> results = new ArrayList<>();

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            int candidateAnswer = (i < answers.size() && answers.get(i) != null) ? answers.get(i) : -1;
            results.add(new AttemptDetailResponse.QuestionResult(
                    i + 1,
                    q.getText(),
                    new ArrayList<>(q.getOptions()),
                    q.getCorrectOption(),
                    candidateAnswer
            ));
        }

        double pct = attempt.getTotalQuestions() > 0
                ? Math.round((double) attempt.getScore() / attempt.getTotalQuestions() * 1000.0) / 10.0
                : 0.0;

        return new AttemptDetailResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getQuiz().getSubject(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                pct,
                attempt.getSubmittedAt(),
                results
        );
    }
}
