/**
 * This file defines the Express routes for user-related operations.
 * It includes endpoints for:
 *   - Fetching all temporary user registrations
 *   - Approving a user registration
 *   - Registering a new user
 *   - Rejecting a user registration
 *   - Logging in a user
 * The routes delegate logic to the corresponding controller functions in UserController.
 */

const express = require('express');
const router = express.Router();
const {
    getTemporaryUsers,
    approveUser,
    registerUser,
    loginUser,
    rejectUser,
} = require('../controllers/UserController');

// Route for getting all temporary users
router.get('/registrations', getTemporaryUsers);

// Route for approving a user (move to confirmed)
router.post('/approve/:id', approveUser);

// Route for user registration
router.post('/register', registerUser);

// Route for rejecting a user registration
router.post('/reject/:id', rejectUser);

// Route for user login
router.post('/login', loginUser);

module.exports = router;