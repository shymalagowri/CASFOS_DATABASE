/**
 * This file configures Multer for handling file uploads in Express.
 * Files are stored in the 'uploads/' directory with a unique filename.
 * The configuration limits file size to 5MB.
 * No file type restrictions are enforced here (all file types are accepted).
 * Use this module to handle file uploads in your routes.
 */

const multer = require("multer");
const path = require("path");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Set the destination directory for uploads
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the "uploads" folder
  },
  // Set the filename for the uploaded file
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Get file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Generate unique filename
  },
});

// Initialize Multer with the configuration (no file type restriction)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;