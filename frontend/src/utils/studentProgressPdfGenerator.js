import jsPDF from 'jspdf';

const COLORS = {
  navy: "#1a3a6b",
  blue: "#2563eb",
  orange: "#f97316",
  green: "#16a34a",
  red: "#dc2626",
  purple: "#7c3aed",
  gray: "#7a8faf",
  lightGray: "#f5f8ff",
  border: "#dce8fb",
};

const createGradient = (pdf, x, y, width, height, color1, color2) => {
  const steps = 100; // Increased for smoother gradient
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    pdf.setFillColor(r, g, b);
    const stepHeight = height / steps;
    pdf.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
  }
};

export const generateStudentProgressPDF = async (studentData, classStats) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add text with styling
  const addText = (text, x, y, size = 12, weight = 'normal', color = COLORS.navy) => {
    pdf.setFontSize(size);
    if (weight === 'bold') {
      pdf.setFont('Helvetica', 'bold');
    } else {
      pdf.setFont('Helvetica', 'normal');
    }
    pdf.setTextColor(...hexToRgb(color));
    pdf.text(text, x, y);
  };

  const addLine = (x1, y1, x2, y2, color = COLORS.border, width = 0.5) => {
    pdf.setDrawColor(...hexToRgb(color));
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const addPageBreak = () => {
    pdf.addPage();
    yPos = 20;
  };

  const checkPageBreak = (space = 30) => {
    if (yPos + space > pageHeight - 10) {
      addPageBreak();
    }
  };

  // Header with smooth professional light gradient
  createGradient(pdf, 0, 0, pageWidth, 28, '#e0f2fe', '#f0e7fe');
  
  // Load and add the exact logo button from examiner dashboard top-left
  try {
    const logoImg = await fetch('/logo_half.png').then(r => r.blob()).then(blob => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });
    
    // Add logo image at top left with exact dimensions from dashboard button (36x36 in pixels, scaled to PDF)
    // 36px in browser = ~9.5mm in PDF (approximately)
    pdf.addImage(logoImg, 'PNG', 15, 3, 9.5, 9.5);
    
    // Add NPTELify branding text with exact styling from dashboard button
    // fontWeight: 900, fontSize: 22, letterSpacing: -0.5px
    pdf.setFontSize(16); // Scale down 22 for PDF
    pdf.setFont('Helvetica', 'bold');
    
    // Position for text next to logo (gap: 9px in browser, ~2.4mm in PDF)
    let textX = 25.5;
    
    // Add "NPTEL" in navy color with exact color (#1a3a6b)
    pdf.setTextColor(...hexToRgb('#1a3a6b'));
    pdf.text('NPTEL', textX, 10);
    
    // Calculate the width of "NPTEL" to position "ify" immediately after it
    const nptelWidth = pdf.getStringUnitWidth('NPTEL') * 16 / pdf.internal.scaleFactor;
    
    // Add "ify" in orange color with exact color (#f97316) - positioned right after NPTEL with proper letter spacing
    pdf.setTextColor(...hexToRgb('#f97316'));
    pdf.text('ify', textX + nptelWidth - 0.5, 10);
  } catch (err) {
    // Silently continue if dashboard button fails to load
  }
  
  // Add centered title with professional, attractive heading style (positioned below logo/branding)
  pdf.setFontSize(26);
  pdf.setFont('Times', 'bold');
  pdf.setTextColor(...hexToRgb('#0f3460'));
  
  // Center the heading
  const headingText = 'Student Progress Report';
  const textWidth = pdf.getStringUnitWidth(headingText) * 26 / pdf.internal.scaleFactor;
  const centeredX = (pageWidth - textWidth) / 2;
  pdf.text(headingText, centeredX, 22);

  yPos = 42;

  // Student Information Section
  checkPageBreak();
  pdf.setFillColor(...hexToRgb(COLORS.lightGray));
  pdf.rect(15, yPos - 8, pageWidth - 30, 30, 'F');
  
  addText('Student Information', 20, yPos, 14, 'bold');
  yPos += 8;
  addText(`Name: ${studentData.candidateName}`, 20, yPos, 11);
  yPos += 6;
  addText(`Email: ${studentData.email}`, 20, yPos, 11);
  yPos += 6;
  addText(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos, 11);
  
  yPos += 20;

  // Performance Metrics
  checkPageBreak();
  addText('Performance Summary', 15, yPos, 14, 'bold');
  yPos += 12;

  const metrics = [
    { label: 'Average Score', value: `${Math.round(studentData.averageScore)}%`, color: COLORS.blue },
    { label: 'Status', value: Math.round(studentData.averageScore) >= 60 ? 'On Track' : 'Needs Help', color: Math.round(studentData.averageScore) >= 60 ? COLORS.green : COLORS.red },
    { label: 'Trend', value: studentData.trend, color: studentData.trend.startsWith('+') ? COLORS.green : COLORS.red },
    { label: 'Attempts', value: studentData.scoresTrend.length, color: COLORS.purple },
  ];

  const metricWidth = (pageWidth - 40) / 2;
  const boxWidth = metricWidth - 5;
  const totalBoxesWidth = boxWidth * 2;
  const centeredStartX = (pageWidth - totalBoxesWidth) / 2;
  
  let metricX = centeredStartX;
  let metricY = yPos;
  let metricsPerRow = 0;

  metrics.forEach((metric, idx) => {
    if (metricsPerRow === 2) {
      metricY += 26;
      metricX = centeredStartX;
      metricsPerRow = 0;
      checkPageBreak(30);
    }

    // Metric box
    pdf.setFillColor(...hexToRgb(COLORS.lightGray));
    pdf.rect(metricX, metricY, boxWidth, 22, 'F');
    addLine(metricX, metricY, metricX + boxWidth, metricY, metric.color, 3);

    addText(metric.label, metricX + 8, metricY + 8, 10, 'normal', COLORS.gray);
    addText(String(metric.value), metricX + 8, metricY + 16, 16, 'bold', metric.color);

    metricX += metricWidth;
    metricsPerRow++;
  });

  yPos = metricY + 35;

  // Recommendations Section
  checkPageBreak(35);
  addText('Recommendations', 15, yPos, 12, 'bold');
  yPos += 8;

  const recommendations = Math.round(studentData.averageScore) >= 60 
    ? [
        '✓ Continue practicing with regular quizzes',
        '✓ Focus on maintaining consistency',
        '✓ Help other students as peer mentor'
      ]
    : [
        '• Review concepts from recent quizzes',
        '• Practice with additional exercises',
        '• Schedule session with instructor',
        '• Join study group for peer support'
      ];

  recommendations.forEach((rec) => {
    pdf.setFillColor(...hexToRgb('#fafbfc'));
    pdf.rect(15, yPos - 6, pageWidth - 30, 7, 'F');
    addText(rec, 20, yPos - 1, 10, 'normal', COLORS.navy);
    yPos += 8;
  });

  yPos += 5;

  // Class Comparison
  if (classStats) {
    checkPageBreak(40);
    addText('Class Comparison', 15, yPos, 14, 'bold');
    yPos += 12;

    const comparisons = [
      { label: 'Student Average', value: `${Math.round(studentData.averageScore)}%` },
      { label: 'Class Average', value: `${Math.round(classStats.classAverage)}%` },
      { label: 'Class Pass Rate', value: `${Math.round(classStats.passRate)}%` },
    ];

    const boxHeight = 10;
    comparisons.forEach((comp) => {
      pdf.setFillColor(...hexToRgb(COLORS.lightGray));
      pdf.rect(15, yPos - 5, pageWidth - 30, boxHeight, 'F');
      
      // Center text vertically in the box
      const centerY = yPos + (boxHeight / 2) - 1;
      addText(comp.label, 20, centerY, 11, 'normal');
      addText(comp.value, pageWidth - 25, centerY, 11, 'bold', COLORS.blue);
      yPos += boxHeight + 2;
    });

    yPos += 8;
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(...hexToRgb(COLORS.gray));
  pdf.text(
    `This is an automatically generated report. For more information, contact your instructor.`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `${studentData.candidateName.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
