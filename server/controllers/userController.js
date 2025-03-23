const bcrypt = require('bcryptjs');
const AdminModel = require('../model/AdminModel');
const DataEntryModel = require('../model/DataEntryModel');
const ViewerModel = require('../model/ViewerModel');
const { TemporaryUser } = require('../model/UserModel'); 
const RejectedUser = require('../model/RejectedUserModel');

const registerUser = async (req, res) => {
  const { name, password, role, dob, designation, phone, organization, ministry } = req.body;

  try {
      // Check if user already exists
      let existingUser;
      if(role=='admin')
      {
        existingUser = await AdminModel.findOne({ $or: [{ name }, { phone }] });
      }
      else if(role=='dataentry')
      {
        existingUser = await DataEntryModel.findOne({ $or: [{ name }, { phone }] });
      }
      else
      {
        existingUser = await ViewerModel.findOne({ $or: [{ name }, { phone }] });
      }
      if (existingUser) {
          return res.status(400).json({ message: "Name or phone number already in use." });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new TemporaryUser({
          name,
          password: hashedPassword,
          role,
          dob,
          designation,
          phone,
          organization,
          ministry,
      });

      // Save user to the database
      await newUser.save();
      res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
      // Handle validation errors
      if (err.name === "ValidationError") {
          const messages = Object.values(err.errors).map((error) => error.message);
          return res.status(400).json({ message: messages.join(", ") });
      }
      // Handle other errors
      res.status(500).json({ message: err.message });
  }
};
const getUserAccess = async (req, res) => {
    const { username, role } = req.params;
    console.log(username, role);
  
    try {
      let user;
      if (role === "dataentry") {
        user = await DataEntryModel.findOne({ name: username });
      } else {
        user = await ViewerModel.findOne({ name: username });
      }
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ access: user.access });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user data', error });
    }
  };
  
// 🔹 Approve a user and move them to the respective role collection
const approveUser = async (req, res) => {
    const { id } = req.params;
    const { access } = req.body;  // Get access types from the frontend request
    console.log(access);
    try {
      const user = await TemporaryUser.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      let Model;
      switch (user.role) {
        case 'admin':
          Model = AdminModel;
          break;
        case 'dataentry':
          Model = DataEntryModel;
          break;
        case 'viewer':
          Model = ViewerModel;
          break;
        default:
          return res.status(400).json({ message: 'Invalid role' });
      }
  
      const approvedUser = new Model({
        name: user.name,
        password: user.password,
        role: user.role,
        dob: user.dob,
        designation: user.designation,
        phone: user.phone,
        organization: user.organization,
        ministry: user.ministry,
        access: access  // Save selected access types here
      });
      console.log(approvedUser);
      try {
        await approvedUser.save();
        console.log("User saved successfully");
      } catch (error) {
        console.error("Error saving user:", error);
      }
  
      await TemporaryUser.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'User approved and moved to role-specific collection' });
    } catch (error) {
      res.status(500).json({ message: 'Error approving user', error });
    }
  };
  const updateAccess = async (req, res) => {
    try {
        const { userId, role, newAccess } = req.body;
        console.log(userId, role, newAccess);

        // Define the full list of access options
        const fullAccessOptions = ["IT", "Electrical", "Store", "Furniture"];

        // If "All" is included in newAccess, replace it with the full list
        const updatedAccess = newAccess.includes("All") ? fullAccessOptions : newAccess;

        // Determine the correct model based on the role
        let userModel = role === "dataentry" ? DataEntryModel : ViewerModel;

        // Find the user by ID
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update the user's access level
        user.access = updatedAccess;
        await user.save();

        res.status(200).json({ message: "Access updated successfully", user });
    } catch (error) {
        console.error("Error updating access:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const loginUser = async (req, res) => {
    const { name, password, role } = req.body;
    console.log(name,password,role);
    try {
        let Model;
        switch (role) {
            case 'admin':
                Model = AdminModel;
                break;
            case 'dataentry':
                Model = DataEntryModel;
                break;
            case 'viewer':
                Model = ViewerModel;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findOne({ name });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Securely compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("wrong");
            return res.status(401).json({ message: 'Wrong password' });
        }

        res.json("success"); // Ensure this matches frontend's expected response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTemporaryUsers = async (req, res) => {
    try {
        const users = await TemporaryUser.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
const getConfirmedUsers = async (req, res) => {
  try {
    const admins = await AdminModel.find();
    const dataEntries = await DataEntryModel.find();
    const viewers = await ViewerModel.find();

    // Combine all users into a single array
    const users = [...admins, ...dataEntries, ...viewers];      
    res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
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
            ...user.toObject(),
            remark
        });

        await rejectedUser.save();
        await TemporaryUser.findByIdAndDelete(id);

        res.status(200).json({ message: 'User rejected successfully with remark' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user', error });
    }
};

const getUserCounts = async (req, res) => {
    try {
        const adminCount = await AdminModel.countDocuments();
        const dataEntryCount = await DataEntryModel.countDocuments();
        const viewerCount = await ViewerModel.countDocuments();

        res.json({
            data: { adminCount, dataEntryCount, viewerCount }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user counts' });
    }
};

const temporaryUsersCount = async (req, res) => {
    try {
        const count = await TemporaryUser.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching new users count' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getTemporaryUsers,
    approveUser,
    rejectUser,
    getUserCounts,
    temporaryUsersCount,
    getUserAccess,
    getConfirmedUsers,
    updateAccess
};
