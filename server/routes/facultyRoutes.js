const express = require('express');
const facultyController = require('../controllers/facultyController');
const router = express.Router();
const upload = require("../config/multerconfig"); // Import Multer configuration

router.post('/save',upload.single("photograph"), facultyController.saveFaculty);
router.get('/getAutoSavedFaculty', facultyController.getAutoSavedFacultyData);
router.post('/autoSaveFaculty', facultyController.autoSaveFacultyData);
router.delete('/deleteAutoSaveFaculty/:staffid', facultyController.deleteAutoSavedFaculty);
router.get('/getAllFaculties', facultyController.getAllFaculties);

router.post('/approve/:id', facultyController.approveFaculty);

router.post("/filterFaculties", facultyController.getFilteredFaculty);
router.get('/monthly',facultyController.getFacultyEntriesByMonth);
router.get('/sessions',facultyController.getSessionsHandled);
router.get('/search/:id',facultyController.getFacultyById);

module.exports = router;
