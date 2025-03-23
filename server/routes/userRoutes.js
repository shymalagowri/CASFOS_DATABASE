const express = require('express');
const router = express.Router();
const {
    getTemporaryUsers,
    approveUser,
    registerUser,
    loginUser,
    rejectUser,
    getUserCounts,
    temporaryUsersCount,
    getUserAccess,
    getConfirmedUsers,
    updateAccess
} = require('../controllers/userController');

// Route for getting all temporary users
router.get('/registrations', getTemporaryUsers);
router.get('/confirmedregistrations', getConfirmedUsers);

router.get('/count',getUserCounts)
// Route for approving a user (move to confirmed)
router.post('/approve/:id', approveUser);

// Route for user registration
router.post('/register', registerUser);

router.post('/reject/:id', rejectUser);
router.get('/access/:username/:role', getUserAccess);
router.put("/update-access", updateAccess);

// Route for user login
router.post('/login', loginUser);
router.get('/temporaryuserscount',temporaryUsersCount);

module.exports = router;
