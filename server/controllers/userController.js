/**
 * Overview:
 * This module provides backend API endpoints for user management in an asset management system.
 * It handles user registration, login, approval, rejection, and username checks.
 * The module uses Mongoose for MongoDB interactions and bcrypt for password hashing.
 * Users are stored in a TemporaryUser collection initially and moved to role-specific collections upon approval.
 * The module exports functions for:
 * - Registering new users with username uniqueness checks.
 * - Authenticating users with role-based access.
 * - Approving or rejecting temporary users.
 * - Checking username availability across all collections.
 * - Fetching temporary users for administrative purposes.
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const TemporaryUser = require('../model/UserModel');
const RejectedUser = require('../model/RejectedUserModel');
const HeadOfOfficeModel = require('../model/HeadOfOfficeModel');
const PrincipalModel = require('../model/PrincipalModel');
const AssetManagerModel = require('../model/AssetManagerModel');
const storekeeperModel = require('../model/storekeeperModel');
const FacultyEntryStaffModel = require('../model/FacultyEntryStaffModel');
const facultyverifierModel = require('../model/facultyverifierModel');
const ViewerModel = require('../model/ViewerModel');

/**
 * Handles user login by validating credentials and role
 * @param {Object} req - Express request object containing name, password, and role
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
  const { name, password, role } = req.body;

  // Validate required fields
  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
    // Select the appropriate model based on role
    let Model;
    switch (role) {
      case 'headofoffice':
        Model = HeadOfOfficeModel;
        break;
      case 'principal':
        Model = PrincipalModel;
        break;
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'storekeeper':
        Model = storekeeperModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'facultyverifier':
        Model = facultyverifierModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user by username
    const user = await Model.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json("success"); // Return success response
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle server errors
  }
};

/**
 * Registers a new user in the TemporaryUser collection after checking for username uniqueness
 * @param {Object} req - Express request object containing user details
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  const { name, password, role, dob, designation, phone, organization, ministry } = req.body;

  // Validate required fields
  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
    // List of all collections to check for username uniqueness
    const models = [
      TemporaryUser,
      HeadOfOfficeModel,
      PrincipalModel,
      AssetManagerModel,
      storekeeperModel,
      FacultyEntryStaffModel,
      facultyverifierModel,
      ViewerModel,
    ];

    // Check if username exists in any collection
    for (const Model of models) {
      const existingUser = await Model.findOne({ name });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new temporary user
    const newUser = new TemporaryUser({
      name,
      password: hashedPassword,
      role,
      dob: dob || undefined,
      designation: designation || undefined,
      phone: phone || undefined,
      organization: organization || undefined,
      ministry: ministry || undefined,
    });

    // Save user to TemporaryUser collection
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message }); // Handle other errors
  }
};

/**
 * Approves a temporary user and moves them to a role-specific collection
 * @param {Object} req - Express request object containing user ID and optional access/specificRole
 * @param {Object} res - Express response object
 */
const approveUser = async (req, res) => {
  const { id } = req.params;
  const { access, specificRole } = req.body;

  try {
    // Find user in TemporaryUser collection
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Select the appropriate model based on role
    let Model;
    let finalRole = specificRole || user.role; // Use specificRole if provided, else user.role

    switch (finalRole) {
      case 'headofoffice':
        Model = HeadOfOfficeModel;
        break;
      case 'principal':
        Model = PrincipalModel;
        break;
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'storekeeper':
        Model = storekeeperModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'facultyverifier':
        Model = facultyverifierModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Create new user in role-specific collection
    const approvedUser = new Model({
      name: user.name,
      password: user.password,
      role: finalRole,
      dob: user.dob || undefined,
      designation: user.designation || undefined,
      phone: user.phone || undefined,
      organization: user.organization || undefined,
      ministry: user.ministry || undefined,
      access: finalRole === 'headofoffice' || finalRole === 'principal' ? ['all'] : (access || []),
    });

    // Save approved user and delete from TemporaryUser
    await approvedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User approved and moved to role-specific collection' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
};

/**
 * Rejects a temporary user and moves them to the RejectedUser collection
 * @param {Object} req - Express request object containing user ID and rejection remark
 * @param {Object} res - Express response object
 */
const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  // Validate remark
  if (!remark) {
    return res.status(400).json({ message: 'Remark is required for rejection' });
  }

  try {
    // Find user in TemporaryUser collection
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create rejected user record
    const rejectedUser = new RejectedUser({
      name: user.name,
      password: user.password,
      role: user.role,
      dob: user.dob || undefined,
      designation: user.designation || undefined,
      phone: user.phone || undefined,
      organization: user.organization || undefined,
      ministry: user.ministry || undefined,
      remark,
    });

    // Save rejected user and delete from TemporaryUser
    await rejectedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting user', error: error.message });
  }
};

/**
 * Fetches all temporary users for administrative review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTemporaryUsers = async (req, res) => {
  try {
    // Fetch all users from TemporaryUser collection
    const users = await TemporaryUser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temporary users', error: error.message });
  }
};

// Export all controller functions
module.exports = {
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  getTemporaryUsers,
};