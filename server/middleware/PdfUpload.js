/**
 * This middleware configures file uploads using Multer for Express.
 * It allows uploading PDF, JPEG, and PNG files up to 5MB in size.
 * Uploaded files are stored in the 'uploads/' directory with a unique filename.
 * The middleware restricts uploads to only the allowed file types and extensions.
 * Use this middleware in your routes to handle file uploads from forms or API requests.
 */

const multer = require("multer");
const path = require("path");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Set the destination directory for uploads
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // Set the filename for the uploaded file
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// Filter to allow only PDF, JPEG, and PNG files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
  const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, and PNG files are allowed!"), false);
  }
};

// Configure Multer upload middleware
const pdfUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("file");

// Export the middleware for use in routes
module.exports = pdfUpload;