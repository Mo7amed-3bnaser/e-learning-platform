import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import cloudinary from '../config/cloudinary.js';

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

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Draw certificate border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: 782,
    height: 535,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 3,
  });

  // Inner border
  page.drawRectangle({
    x: 40,
    y: 40,
    width: 762,
    height: 515,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 1,
  });

  // Title
  page.drawText('Certificate of Completion', {
    x: 260,
    y: 460,
    size: 36,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Student name label
  page.drawText('This is to certify that', {
    x: 330,
    y: 380,
    size: 16,
    font: regularFont,
  });

  // Student name
  page.drawText(studentName, {
    x: 400 - (studentName.length * 4),
    y: 340,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Course completion text
  page.drawText('has successfully completed', {
    x: 310,
    y: 290,
    size: 16,
    font: regularFont,
  });

  // Course name
  const courseNameWidth = courseName.length * 3.5;
  page.drawText(courseName, {
    x: 421 - courseNameWidth,
    y: 250,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Date
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  page.drawText(`Completion Date: ${formattedDate}`, {
    x: 300,
    y: 180,
    size: 14,
    font: regularFont,
  });

  // Certificate ID (for verification)
  page.drawText(`Certificate ID: ${certificateId}`, {
    x: 300,
    y: 100,
    size: 12,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Platform name at bottom
  page.drawText('E-Learning Platform', {
    x: 350,
    y: 60,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });

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
export const uploadCertificateToCloudinary = async (pdfBuffer, certificateId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'e-learning/certificates',
        resource_type: 'raw',
        public_id: certificateId,
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(pdfBuffer);
  });
};
