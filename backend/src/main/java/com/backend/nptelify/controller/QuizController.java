package com.backend.nptelify.controller;

import com.backend.nptelify.dto.ExaminerStatsResponse;
import com.backend.nptelify.dto.QuizRequest;
import com.backend.nptelify.dto.QuizResponse;
import com.backend.nptelify.dto.AttemptResponse;
import com.backend.nptelify.dto.CandidateQuizDataResponse;
import com.backend.nptelify.dto.QuizStatusResponse;
import com.backend.nptelify.service.QuizService;
import com.backend.nptelify.service.PdfReportService;
import com.backend.nptelify.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final PdfReportService pdfReportService;
    private final AttemptService attemptService;

    public QuizController(QuizService quizService, PdfReportService pdfReportService, AttemptService attemptService) {
        this.quizService = quizService;
        this.pdfReportService = pdfReportService;
        this.attemptService = attemptService;
    }

    @PostMapping
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request,
                                                    Principal principal) {
        return ResponseEntity.ok(quizService.createQuiz(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<List<QuizResponse>> getMyQuizzes(Principal principal) {
        return ResponseEntity.ok(quizService.getMyQuizzes(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/{id}/candidate-data")
    public ResponseEntity<CandidateQuizDataResponse> getCandidateQuizData(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(quizService.getCandidateQuizData(id, principal.getName()));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<QuizStatusResponse> getQuizStatus(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(quizService.getQuizStatusForCandidate(id, principal.getName()));
    }

    @GetMapping("/upcoming/all")
    public ResponseEntity<List<QuizResponse>> getUpcomingQuizzes() {
        return ResponseEntity.ok(quizService.getUpcomingQuizzes());
    }

    @GetMapping("/upcoming/mine")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<List<QuizResponse>> getMyUpcomingQuizzes(Principal principal) {
        return ResponseEntity.ok(quizService.getMyUpcomingQuizzes(principal.getName()));
    }

    @GetMapping("/past/all")
    public ResponseEntity<List<QuizResponse>> getPastQuizzes() {
        return ResponseEntity.ok(quizService.getPastQuizzes());
    }

    @GetMapping("/past/mine")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<List<QuizResponse>> getMyPastQuizzes(Principal principal) {
        return ResponseEntity.ok(quizService.getMyPastQuizzes(principal.getName()));
    }

    @GetMapping("/stats/mine")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<ExaminerStatsResponse> getMyStats(Principal principal) {
        return ResponseEntity.ok(quizService.getExaminerStats(principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id,
                                                    @Valid @RequestBody QuizRequest request,
                                                    Principal principal) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id, Principal principal) {
        quizService.deleteQuiz(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{quizId}/download-pdf")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<byte[]> downloadQuizReportPdf(@PathVariable Long quizId, Principal principal) {
        try {
            QuizResponse quiz = quizService.getQuizById(quizId);
            List<AttemptResponse> attempts = attemptService.getAttemptsForQuiz(quizId, principal.getName());
            
            byte[] pdfBytes = pdfReportService.generateQuizReportPdf(
                    quiz.getTitle(),
                    quiz.getSubject(),
                    quiz.getCreatedAt(),
                    quiz.getScheduledDateTime(),
                    attempts
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    "Quiz_Report_" + quizId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
