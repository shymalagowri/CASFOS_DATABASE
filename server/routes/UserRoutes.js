const express = require('express');
const router = express.Router();
const {
    getTemporaryUsers,
    approveUser,
    registerUser,
    loginUser,
    rejectUser,
    changePassword,
} = require('../controllers/userController');

// Route for getting all temporary users
router.get('/registrations', getTemporaryUsers);

// Route for approving a user (move to confirmed)
router.post('/approve/:id', approveUser);

// Route for user registration
router.post('/register', registerUser);

router.post('/reject/:id', rejectUser);

// Route for user login
router.post('/login', loginUser);

// change password for HOO
router.put('/change-password', changePassword);

module.exports = router;
