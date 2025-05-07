const express = require('express');
const facultyController = require('../controllers/facultyController');
const router = express.Router();
const upload = require("../config/multerconfig"); // Multer configuration for file uploads

// Faculty Data Management Routes
// Routes for saving, retrieving, updating, and deleting faculty data
router.post('/save', upload.single("photograph"), facultyController.saveFaculty); // Save new or update existing faculty with photo upload
router.get('/getAllFaculties', facultyController.getAllFaculties);                // Retrieve all faculty records
router.get('/search/:id', facultyController.getFacultyById);                      // Get faculty details by ID
router.put('/update/:id', facultyController.updateFaculty);                      // Update specific faculty fields
router.delete('/delete/:id', facultyController.deleteFaculty);                    // Delete faculty by ID

// Auto-Save Functionality Routes
// Routes for managing auto-saved faculty drafts
router.get('/getAutoSavedFaculty', facultyController.getAutoSavedFacultyData);    // Retrieve auto-saved faculty data by staff ID
router.post('/autoSaveFaculty', facultyController.autoSaveFacultyData);           // Auto-save faculty data
router.delete('/deleteAutoSaveFaculty/:staffid', facultyController.deleteAutoSavedFaculty); // Delete auto-saved faculty data

// Faculty Verification and Approval Routes
// Routes for verifying and approving faculty records
router.put('/verifyFaculty/:id', facultyController.verifyFaculty);                // Verify a faculty member
router.post('/approve/:id', facultyController.approveFaculty);                    // Approve a verified faculty member
router.post('/rejectFacultyVerification/:id', facultyController.rejectFacultyVerification); // Reject faculty verification
router.post('/rejectFacultyApproval/:id', facultyController.rejectFacultyApproval); // Reject faculty approval
router.get('/rejected-approvals', facultyController.getRejectedFacultyApprovals);  // Get recently rejected approvals
router.get('/rejected-verifications', facultyController.getRejectedFacultyVerifications); // Get recently rejected verifications

// Faculty Filtering and Reporting Routes
// Routes for filtering faculty and generating reports
router.post("/filterFaculties", facultyController.getFilteredFaculty);            // Filter faculty based on criteria (Note: Duplicate route removed)
router.get('/monthly', facultyController.getFacultyEntriesByMonth);               // Get faculty entries by month/year
router.get('/sessions', facultyController.getSessionsHandled);                    // Get session counts by year/month

// Faculty Notification Routes
// Routes for managing faculty notifications and acknowledgments
router.post('/notify/:id', facultyController.notifyFaculty);                      // Notify faculty and move to notification collection
router.get('/notifyhoo-false', facultyController.getNotifyHooFalse);              // Get notifications not acknowledged by HOO
router.put('/acknowledge-hoo/:id', facultyController.acknowledgeHoo);             // Acknowledge notification by HOO
router.get('/notify-si-pending', facultyController.getNotifySIPending);           // Get notifications pending SI acknowledgment
router.put('/acknowledge-si/:id', facultyController.acknowledgeSI);               // Acknowledge notification by SI
router.get('/notify-all-true', facultyController.getNotifyAllTrue);               // Get fully acknowledged notifications



router.delete('/rejected-approvals/:id', facultyController.deleteRejectedFacultyApproval); // Delete rejected approval
router.delete('/rejected-verifications/:id', facultyController.deleteRejectedFacultyVerification); // Delete rejected verification
router.delete('/notifications/:id', facultyController.deleteFacultyNotification); // Delete notification
module.exports = router;