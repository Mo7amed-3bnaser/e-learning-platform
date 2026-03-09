import { PDFDocument, rgb, StandardFonts, LineCapStyle } from "pdf-lib";
import cloudinary from "../config/cloudinary.js";

/**
 * Generate certificate ID
 * Format: CERT-YYYY-XXXXXXXX (e.g., CERT-2026-A3F5D892)
 */
export const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CERT-${year}-${random}`;
};

/**
 * Generate PDF certificate
 * @param {Object} data - { studentName, courseName, completionDate, certificateId }
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateCertificatePDF = async (data) => {
  const { studentName, courseName, completionDate, certificateId } = data;

  const pageWidth = 842;
  const pageHeight = 595;

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]); // A4 landscape

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Helper: draw centered text
  const drawCentered = (text, y, size, font, color = rgb(0.1, 0.1, 0.1)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (pageWidth - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Background fill (light cream)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.99, 0.98, 0.95),
  });

  // Outer border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: pageWidth - 50,
    height: pageHeight - 50,
    borderColor: rgb(0.15, 0.35, 0.75),
    borderWidth: 4,
  });

  // Inner border
  page.drawRectangle({
    x: 35,
    y: 35,
    width: pageWidth - 70,
    height: pageHeight - 70,
    borderColor: rgb(0.15, 0.35, 0.75),
    borderWidth: 1,
  });

  // Top accent line
  page.drawRectangle({
    x: 35,
    y: pageHeight - 35,
    width: pageWidth - 70,
    height: -6,
    color: rgb(0.15, 0.35, 0.75),
  });

  // Bottom accent line
  page.drawRectangle({
    x: 35,
    y: 35,
    width: pageWidth - 70,
    height: 6,
    color: rgb(0.15, 0.35, 0.75),
  });

  // Logo — SVG paths from Logo.tsx drawn natively via pdf-lib
  const s = 0.45;
  const logoX = (pageWidth - 130 * s) / 2;
  const logoY = 547;

  const navyBlue = rgb(0.117, 0.227, 0.373); // #1e3a5f
  const logoOrange = rgb(0.976, 0.451, 0.086); // #f97316

  // M shape
  page.drawSvgPath("M12 20V85", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 14 * s,
    borderLineCap: LineCapStyle.Round,
  });
  page.drawSvgPath("M12 20L45 60", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 14 * s,
    borderLineCap: LineCapStyle.Round,
  });
  page.drawSvgPath("M45 60L75 15", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 14 * s,
    borderLineCap: LineCapStyle.Round,
  });
  page.drawSvgPath("M75 15L75 50", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 14 * s,
    borderLineCap: LineCapStyle.Round,
  });
  // Arrow shaft
  page.drawSvgPath("M75 15L105 15", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 12 * s,
    borderLineCap: LineCapStyle.Round,
  });
  // Arrow head
  page.drawSvgPath("M95 5L108 15L95 25", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: navyBlue,
    borderWidth: 3 * s,
    borderLineCap: LineCapStyle.Round,
  });
  // Orange dashed road overlay
  page.drawSvgPath("M14 80V22L46 56L78 16H104", {
    x: logoX,
    y: logoY,
    scale: s,
    borderColor: logoOrange,
    borderWidth: 5 * s,
    borderDashArray: [5.4, 4.5],
    borderLineCap: LineCapStyle.Round,
  });

  // Divider line under logo
  page.drawLine({
    start: { x: 200, y: pageHeight - 95 },
    end: { x: pageWidth - 200, y: pageHeight - 95 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Main title
  drawCentered(
    "Certificate of Completion",
    pageHeight - 155,
    38,
    boldFont,
    rgb(0.15, 0.35, 0.75),
  );

  // Subtitle
  drawCentered(
    "This is to certify that",
    pageHeight - 220,
    15,
    italicFont,
    rgb(0.4, 0.4, 0.4),
  );

  // Student name
  drawCentered(
    studentName,
    pageHeight - 270,
    28,
    boldFont,
    rgb(0.08, 0.15, 0.45),
  );

  // Underline for student name
  const nameWidth = boldFont.widthOfTextAtSize(studentName, 28);
  page.drawLine({
    start: { x: (pageWidth - nameWidth) / 2, y: pageHeight - 278 },
    end: { x: (pageWidth + nameWidth) / 2, y: pageHeight - 278 },
    thickness: 1,
    color: rgb(0.15, 0.35, 0.75),
  });

  // Course completion text
  drawCentered(
    "has successfully completed the course",
    pageHeight - 315,
    15,
    italicFont,
    rgb(0.4, 0.4, 0.4),
  );

  // Course name
  drawCentered(
    courseName,
    pageHeight - 360,
    22,
    boldFont,
    rgb(0.15, 0.35, 0.75),
  );

  // Date
  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  drawCentered(
    `Issued on: ${formattedDate}`,
    pageHeight - 420,
    13,
    regularFont,
    rgb(0.35, 0.35, 0.35),
  );

  // Certificate ID
  drawCentered(
    `Certificate ID: ${certificateId}`,
    60,
    10,
    regularFont,
    rgb(0.55, 0.55, 0.55),
  );

  // Return PDF as buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/**
 * Upload certificate PDF to Cloudinary
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {String} certificateId - Unique certificate ID
 * @returns {Promise<String>} - Cloudinary URL
 */
export const uploadCertificateToCloudinary = async (
  pdfBuffer,
  certificateId,
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "e-learning/certificates",
        resource_type: "raw",
        public_id: certificateId,
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );

    // Write buffer to stream
    uploadStream.end(pdfBuffer);
  });
};
