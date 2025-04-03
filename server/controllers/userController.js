const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const TemporaryUser = require('../model/UserModel');
const RejectedUser = require('../model/RejectedUserModel');
const HeadOfOfficeModel = require('../model/HeadOfOfficeModel');
const PrincipalModel = require('../model/PrincipalModel');
const AssetManagerModel = require('../model/AssetManagerModel');
const AssetEntryStaffModel = require('../model/AssetEntryStaffModel');
const FacultyEntryStaffModel = require('../model/FacultyEntryStaffModel');
const SuperintendentModel = require('../model/SuperintendentModel');
const ViewerModel = require('../model/ViewerModel');

const loginUser = async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
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
      case 'assetentrystaff':
        Model = AssetEntryStaffModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'superintendent':
        Model = SuperintendentModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json("success");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, password, role, dob, designation, phone, organization, ministry } = req.body;

  // Validate required fields
  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
    const existingUser = await TemporaryUser.findOne({ name });
    if (existingUser) {
      console.log("hiii")
      return res.status(400).json({ message: "Username already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new TemporaryUser({
      name,
      password: hashedPassword,
      role,
      dob: dob || undefined,           // Optional
      designation: designation || undefined,
      phone: phone || undefined,
      organization: organization || undefined,
      ministry: ministry || undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.name === "ValidationError") {
      console.log(err);
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

const approveUser = async (req, res) => {
  const { id } = req.params;
  const { access, specificRole } = req.body;

  try {
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let Model;
    let finalRole = user.role;

    if (user.role === 'assetmanagerentry') {
      finalRole = specificRole === 'assetmanager' ? 'assetmanager' : 'assetentrystaff';
      Model = finalRole === 'assetmanager' ? AssetManagerModel : AssetEntryStaffModel;
    } else if (user.role === 'facultyentrysuper') {
      finalRole = specificRole === 'facultyentrystaff' ? 'facultyentrystaff' : 'superintendent';
      Model = finalRole === 'facultyentrystaff' ? FacultyEntryStaffModel : SuperintendentModel;
    } else {
      switch (user.role) {
        case 'headofoffice':
          Model = HeadOfOfficeModel;
          break;
        case 'principal':
          Model = PrincipalModel;
          break;
        case 'viewer':
          Model = ViewerModel;
          break;
        default:
          return res.status(400).json({ message: 'Invalid role' });
      }
    }

    const approvedUser = new Model({
      name: user.name,
      password: user.password,
      role: finalRole,
      dob: user.dob || undefined,           // Optional
      designation: user.designation || undefined,
      phone: user.phone || undefined,
      organization: user.organization || undefined,
      ministry: user.ministry || undefined,
      access: finalRole === 'headofoffice' || finalRole === 'principal' ? ['all'] : (access || []),
    });

    await approvedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User approved and moved to role-specific collection' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark) {
    return res.status(400).json({ message: 'Remark is required for rejection' });
  }

  try {
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    await rejectedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting user', error: error.message });
  }
};

const checkUser = async (req, res) => {
  console.log("enterd");
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required' });
  }

  try {
    let Model;
    switch (role) {
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'headofoffice':
        Model = HeadOfOfficeModel; // Added for Approval.js check
        break;
      default:
        return res.status(400).json({ message: 'Invalid role for checking' });
    }

    const user = await Model.findOne({ name });
    console.log("found",user)
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assuming these are existing functions you might have
const getTemporaryUsers = async (req, res) => {
  try {
    const users = await TemporaryUser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temporary users', error: error.message });
  }
};

// Export all functions
module.exports = {
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  checkUser,
  getTemporaryUsers,
  // Add other existing exports here if any
};