package com.backend.nptelify.service;

import com.backend.nptelify.dto.AttemptDetailResponse;
import com.backend.nptelify.dto.AttemptResponse;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfReportService {

    // Professional color palette
    private static final DeviceRgb PRIMARY_BLUE = new DeviceRgb(37, 99, 235);
    private static final DeviceRgb DARK_NAVY = new DeviceRgb(26, 58, 107);
    private static final DeviceRgb SUCCESS_GREEN = new DeviceRgb(34, 197, 94);
    private static final DeviceRgb ERROR_RED = new DeviceRgb(239, 68, 68);
    private static final DeviceRgb WARNING_ORANGE = new DeviceRgb(251, 146, 60);
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(245, 248, 255);
    private static final DeviceRgb BORDER_COLOR = new DeviceRgb(220, 232, 251);
    private static final DeviceRgb MUTED_TEXT = new DeviceRgb(122, 143, 175);

    public byte[] generateAttemptReportPdf(AttemptDetailResponse attemptDetail) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // Title
        Paragraph title = new Paragraph("Quiz Attempt Report")
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Quiz Summary Section
        document.add(new Paragraph("Quiz Summary")
                .setFontSize(14)
                .setBold()
                .setMarginTop(15)
                .setMarginBottom(10));

        Table summaryTable = new Table(2)
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        addTableRow(summaryTable, "Quiz Title:", attemptDetail.getQuizTitle(), true);
        addTableRow(summaryTable, "Subject:", attemptDetail.getSubject(), false);
        addTableRow(summaryTable, "Score:", attemptDetail.getScore() + " / " + attemptDetail.getTotalQuestions(), true);
        addTableRow(summaryTable, "Percentage:", String.format("%.1f%%", attemptDetail.getPercentage()), false);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String submittedDate = attemptDetail.getSubmittedAt() != null 
            ? attemptDetail.getSubmittedAt().format(formatter) 
            : "N/A";
        addTableRow(summaryTable, "Submitted At:", submittedDate, true);

        document.add(summaryTable);

        // Correct Answers Section
        document.add(new Paragraph("Correct Answers")
                .setFontSize(14)
                .setBold()
                .setMarginTop(20)
                .setMarginBottom(10));

        // Answers Table
        Table answersTable = new Table(5)
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        // Header row
        addAnswerHeaderCell(answersTable, "Q#");
        addAnswerHeaderCell(answersTable, "Your Answer");
        addAnswerHeaderCell(answersTable, "Correct Answer");
        addAnswerHeaderCell(answersTable, "Status");
        addAnswerHeaderCell(answersTable, "");

        // Data rows
        for (AttemptDetailResponse.QuestionResult q : attemptDetail.getQuestions()) {
            addAnswerDataCell(answersTable, String.valueOf(q.getQuestionNumber()));

            String candidateAns = q.getCandidateAnswer() >= 0 && q.getCandidateAnswer() < q.getOptions().size()
                    ? q.getOptions().get(q.getCandidateAnswer())
                    : "Not answered";
            addAnswerDataCell(answersTable, candidateAns);

            String correctAns = q.getCorrectOption() < q.getOptions().size()
                    ? q.getOptions().get(q.getCorrectOption())
                    : "N/A";
            addAnswerDataCell(answersTable, correctAns);

            String status = q.isCorrect() ? "✓ Correct" : "✗ Wrong";
            Cell statusCell = new Cell()
                    .add(new Paragraph(status))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .setBackgroundColor(q.isCorrect() ? new DeviceRgb(220, 253, 244) : new DeviceRgb(240, 240, 240));
            answersTable.addCell(statusCell);
            addAnswerDataCell(answersTable, "");
        }

        document.add(answersTable);

        // Questions & Answers Detail Section
        document.add(new Paragraph("Detailed Question Review")
                .setFontSize(14)
                .setBold()
                .setMarginTop(20)
                .setMarginBottom(10));

        for (AttemptDetailResponse.QuestionResult q : attemptDetail.getQuestions()) {
            Paragraph questionPara = new Paragraph("Question " + q.getQuestionNumber() + ": " + q.getText())
                    .setFontSize(11)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(5);
            document.add(questionPara);

            for (int i = 0; i < q.getOptions().size(); i++) {
                String option = q.getOptions().get(i);
                String prefix = "";

                if (i == q.getCorrectOption() && i == q.getCandidateAnswer()) {
                    prefix = "✓ [Correct & Selected] ";
                } else if (i == q.getCorrectOption()) {
                    prefix = "✓ [Correct] ";
                } else if (i == q.getCandidateAnswer()) {
                    prefix = "✗ [Your Answer] ";
                }

                Paragraph optionPara = new Paragraph("  " + (char) (65 + i) + ". " + prefix + option)
                        .setFontSize(10)
                        .setMarginLeft(10)
                        .setMarginBottom(3);
                document.add(optionPara);
            }
        }

        // Footer
        Paragraph footer = new Paragraph("--- End of Report ---")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setFontColor(ColorConstants.GRAY);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateQuizReportPdf(String quizTitle, String subject, LocalDateTime createdAt, 
                                        LocalDateTime scheduledDateTime, List<AttemptResponse> attempts) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);
        document.setMargins(30, 30, 30, 30);

        // Header
        Paragraph title = new Paragraph("QUIZ PERFORMANCE REPORT")
                .setFontSize(26)
                .setBold()
                .setFontColor(DARK_NAVY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph(quizTitle)
                .setFontSize(14)
                .setFontColor(PRIMARY_BLUE)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(subtitle);

        // Quiz metadata
        Table metaTable = new Table(2)
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(20);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy • HH:mm");
        String createdDate = createdAt != null ? createdAt.format(formatter) : "N/A";
        String scheduledDate = scheduledDateTime != null ? scheduledDateTime.format(formatter) : "N/A";

        addMetaRow(metaTable, "Subject", subject, true);
        addMetaRow(metaTable, "Report Generated", LocalDateTime.now().format(formatter), false);
        addMetaRow(metaTable, "Quiz Created", createdDate, true);
        addMetaRow(metaTable, "Quiz Scheduled", scheduledDate, false);

        document.add(metaTable);

        // Performance Summary
        if (!attempts.isEmpty()) {
            document.add(new Paragraph("PERFORMANCE SUMMARY")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(DARK_NAVY)
                    .setMarginTop(15)
                    .setMarginBottom(12));

            double avgScore = attempts.stream().mapToDouble(a -> a.getPercentage()).average().orElse(0);
            double maxScore = attempts.stream().mapToDouble(a -> a.getPercentage()).max().orElse(0);
            double minScore = attempts.stream().mapToDouble(a -> a.getPercentage()).min().orElse(0);
            long passCount = attempts.stream().filter(a -> a.getPercentage() >= 60).count();
            double passRate = (passCount * 100.0) / attempts.size();

            Table summaryTable = new Table(5)
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            addSummaryMetric(summaryTable, "Total Attempts", String.valueOf(attempts.size()), DARK_NAVY);
            addSummaryMetric(summaryTable, "Average Score", String.format("%.1f%%", avgScore), PRIMARY_BLUE);
            addSummaryMetric(summaryTable, "Highest Score", String.format("%.1f%%", maxScore), SUCCESS_GREEN);
            addSummaryMetric(summaryTable, "Lowest Score", String.format("%.1f%%", minScore), ERROR_RED);
            addSummaryMetric(summaryTable, "Pass Rate", String.format("%.0f%%", passRate), passRate >= 70 ? SUCCESS_GREEN : WARNING_ORANGE);

            document.add(summaryTable);

            // Candidate Results Table
            document.add(new Paragraph("CANDIDATE RESULTS")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(DARK_NAVY)
                    .setMarginTop(15)
                    .setMarginBottom(12));

            Table resultsTable = new Table(5)
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            // Headers
            String[] headers = {"S.No", "Score", "Percentage", "Status", "Submitted Date"};
            for (String header : headers) {
                Cell headerCell = new Cell()
                        .add(new Paragraph(header).setFontSize(10).setBold().setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(DARK_NAVY)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setVerticalAlignment(VerticalAlignment.MIDDLE)
                        .setPadding(10)
                        .setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f));
                resultsTable.addCell(headerCell);
            }

            // Data rows
            int rowNum = 1;
            for (AttemptResponse attempt : attempts) {
                boolean isEven = rowNum % 2 == 0;
                DeviceRgb bgColor = isEven ? LIGHT_BG : new DeviceRgb(255, 255, 255);
                int percentage = (int) attempt.getPercentage();
                boolean pass = percentage >= 60;

                // Serial number
                Cell snoCell = new Cell()
                        .add(new Paragraph(String.valueOf(rowNum)).setFontSize(10).setBold())
                        .setBackgroundColor(bgColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(9)
                        .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
                resultsTable.addCell(snoCell);

                // Score
                Cell scoreCell = new Cell()
                        .add(new Paragraph(attempt.getScore() + "/" + attempt.getTotalQuestions()).setFontSize(10).setBold())
                        .setBackgroundColor(bgColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(9)
                        .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
                resultsTable.addCell(scoreCell);

                // Percentage
                Cell percentCell = new Cell()
                        .add(new Paragraph(String.format("%d%%", percentage)).setFontSize(10).setBold().setFontColor(pass ? SUCCESS_GREEN : ERROR_RED))
                        .setBackgroundColor(bgColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(9)
                        .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
                resultsTable.addCell(percentCell);

                // Status
                Cell statusCell = new Cell()
                        .add(new Paragraph(pass ? "PASS" : "FAIL")
                                .setFontSize(9).setBold().setFontColor(pass ? SUCCESS_GREEN : ERROR_RED))
                        .setBackgroundColor(bgColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(9)
                        .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
                resultsTable.addCell(statusCell);

                // Date
                String dateStr = attempt.getSubmittedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
                Cell dateCell = new Cell()
                        .add(new Paragraph(dateStr).setFontSize(9))
                        .setBackgroundColor(bgColor)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(9)
                        .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));
                resultsTable.addCell(dateCell);

                rowNum++;
            }

            document.add(resultsTable);
        } else {
            document.add(new Paragraph("No attempts recorded for this quiz yet.")
                    .setFontSize(12)
                    .setFontColor(MUTED_TEXT)
                    .setMarginTop(20));
        }

        // Footer
        document.add(new Paragraph()
                .setMarginTop(30)
                .setMarginBottom(10));
        
        Paragraph footerText = new Paragraph("NPTELify • Examiner Quiz Report")
                .setFontSize(9)
                .setFontColor(MUTED_TEXT)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footerText);

        document.close();
        return baos.toByteArray();
    }

    private void addMetaRow(Table table, String label, String value, boolean isEven) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFontSize(10).setFontColor(MUTED_TEXT).setBold())
                .setBackgroundColor(isEven ? LIGHT_BG : new DeviceRgb(255, 255, 255))
                .setPadding(10)
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

        Cell valueCell = new Cell()
                .add(new Paragraph(value).setFontSize(10).setFontColor(DARK_NAVY).setBold())
                .setBackgroundColor(isEven ? LIGHT_BG : new DeviceRgb(255, 255, 255))
                .setPadding(10)
                .setBorder(new SolidBorder(BORDER_COLOR, 0.5f));

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addSummaryMetric(Table table, String label, String value, DeviceRgb color) {
        Cell cell = new Cell()
                .add(new Paragraph(label).setFontSize(9).setFontColor(MUTED_TEXT).setBold())
                .add(new Paragraph(value).setFontSize(14).setBold().setFontColor(color))
                .setBackgroundColor(LIGHT_BG)
                .setTextAlignment(TextAlignment.CENTER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setPadding(12)
                .setBorder(new SolidBorder(BORDER_COLOR, 1));
        table.addCell(cell);
    }

    private void addTableRow(Table table, String label, String value, boolean isEven) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label))
                .setBold()
                .setBackgroundColor(isEven ? new DeviceRgb(240, 240, 240) : new DeviceRgb(255, 255, 255))
                .setPadding(8);
        Cell valueCell = new Cell()
                .add(new Paragraph(value))
                .setBackgroundColor(isEven ? new DeviceRgb(240, 240, 240) : new DeviceRgb(255, 255, 255))
                .setPadding(8);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addAnswerHeaderCell(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text))
                .setBold()
                .setBackgroundColor(new DeviceRgb(50, 50, 50))
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setPadding(8)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 1.0f));
        table.addCell(cell);
    }

    private void addAnswerDataCell(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text))
                .setPadding(8)
                .setTextAlignment(TextAlignment.LEFT)
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
        table.addCell(cell);
    }
}
