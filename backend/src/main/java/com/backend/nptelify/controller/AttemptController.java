package com.backend.nptelify.controller;

import com.backend.nptelify.dto.AttemptDetailResponse;
import com.backend.nptelify.dto.AttemptRequest;
import com.backend.nptelify.dto.AttemptResponse;
import com.backend.nptelify.service.AttemptService;
import com.backend.nptelify.service.PdfReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;
    private final PdfReportService pdfReportService;

    public AttemptController(AttemptService attemptService, PdfReportService pdfReportService) {
        this.attemptService = attemptService;
        this.pdfReportService = pdfReportService;
    }

    @PostMapping("/{quizId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<AttemptResponse> submitAttempt(@PathVariable Long quizId,
                                                          @Valid @RequestBody AttemptRequest request,
                                                          Principal principal) {
        return ResponseEntity.ok(attemptService.submitAttempt(quizId, request, principal.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<AttemptResponse>> getMyAttempts(Principal principal) {
        return ResponseEntity.ok(attemptService.getMyAttempts(principal.getName()));
    }

    @GetMapping("/quiz/{quizId}")
    @PreAuthorize("hasRole('EXAMINER')")
    public ResponseEntity<List<AttemptResponse>> getAttemptsForQuiz(@PathVariable Long quizId,
                                                                      Principal principal) {
        return ResponseEntity.ok(attemptService.getAttemptsForQuiz(quizId, principal.getName()));
    }

    @GetMapping("/{attemptId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<AttemptDetailResponse> getAttemptDetail(@PathVariable Long attemptId,
                                                                    Principal principal) {
        return ResponseEntity.ok(attemptService.getAttemptDetail(attemptId, principal.getName()));
    }

    @GetMapping("/{attemptId}/download-pdf")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<byte[]> downloadAttemptPdf(@PathVariable Long attemptId,
                                                      Principal principal) {
        try {
            AttemptDetailResponse attemptDetail = attemptService.getAttemptDetail(attemptId, principal.getName());
            byte[] pdfBytes = pdfReportService.generateAttemptReportPdf(attemptDetail);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "Quiz_Report_Attempt_" + attemptId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
