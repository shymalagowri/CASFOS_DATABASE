/**
 * This file defines the Mongoose schema for the Rejected Faculty model.
 * It represents the structure of data related to faculty members whose verification or approval
 * has been rejected, including details such as personal information, professional details,
 * domains of expertise, courses handled, publications, tours attended, and rejection-related information.
 * The schema is used to interact with the corresponding collection in the database.
 */

const mongoose = require('mongoose');

// Define domain options for faculty expertise
const domainOptions = {
  "Forest & Wildlife": [
    "Silviculture",
    "Mensuration and Biometry",
    "Non – Timber Forest Products and Medicinal plants",
    "Tree Harvesting, Wood Science and Technology",
    "Forest Survey & Engineering",
    "Forest Health and Disaster Management",
    "Forest-People Interface",
    "Forest Policy and Law",
    "Forest Resource Management",
    "Wildlife Conservation & Management",
    "Land Resources and Conservation",
    "Economics of Forests and Natural Resources",
    "Environmental Laws & Management",
    "Applied Ecology and Biodiversity Conservation",
    "Forest Administration and Accounts",
    "General Biology/ Forest Botany & Taxonomy",
    "Forest Statistics/Mathematics",
    "Computer Application, Remote Sensing and GIS in Forestry",
    "Urban Forestry/Recreation Forestry & Land Scaping"
  ],
  "Environment": [
    "Environmental Laws & Management",
    "Climate Change: Adaptation & Mitigation",
    "Wasteland Management",
    "Environmental Economics & Accounting",
    "Coastal Regulation Zone",
    "Environmental Impact Assessment & Auditing",
    "Ecosystem Services Valuation",
    "Sustainable Development Goals",
    "Green Energy",
    "Ecosystem Health",
    "Others"
  ],
  "Disaster Management": [
    "Forest Fire Management & Damage assessment",
    "Cyclone",
    "Flood",
    "Desertification",
    "Others"
  ],
  "Human Resource Development": [
    "Time Management",
    "Leadership Management",
    "Effective Leadership and Conflict Resolution",
    "Communication Skills and Management",
    "Crowd Management",
    "Delegation and Interdepartmental Coordination",
    "Emotional Intelligence",
    "Gender Sensitization",
    "Building competencies for personal Excellence",
    "Others"
  ],
  "Health and Fitness": [
    "First Aid",
    "Counselling",
    "Physical, mental and Social Health",
    "Stress Management",
    "Yoga and Meditation",
    "Others"
  ],
  "Ethics and Public Governance": [
    "Public administration, Public Grievance and Public Finance",
    "Decision Making",
    "Ethics in Governance",
    "Anti-corruption Measures",
    "Conflict Management",
    "Transparency in working",
    "Accountability",
    "Public Relations, Crisis control",
    "E-governance",
    "Project Implementation and Management",
    "Others"
  ],
  "Jurisprudence (Acts and Rules)": [
    "The Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    "Bharatiya Nyaya Sanhita (BNS)",
    "Bharatiya Sakshya Adhiniyam (BSA)",
    "POSH Act, 2013",
    "Right to Information (RTI) Act, 2005",
    "Cyber Security Laws",
    "Others"
  ],
  "CCS Rules and Regulation": [
    "Service Rules and matters",
    "Conduct Rules",
    "Disciplinary Proceedings",
    "Others"
  ],
  "Media Management": [
    "The Art of Interacting with Print and Electronic Media",
    "Role of Media",
    "Media Relations and Image Management",
    "Proactive Media Engagement",
    "Social Media Management",
    "Others"
  ]
};

// Define the schema for Rejected Faculty
const rejectedFacultySchema = new mongoose.Schema({
  // Whether the faculty is verified
  verified: {
    type: Boolean,
    default: false
  },
  // Type of faculty (internal, external, or contract)
  facultyType: { 
    type: String, 
    required: true,
    trim: true,
    enum: ['internal', 'external', 'contract']
  },
  // Name of the faculty
  name: { 
    type: String,
    required: true,
    trim: true
  },
  // Cadre of the faculty
  cadre: { 
    type: String,
    trim: true
  },
  // Year of allotment (must be a 4-digit year)
  yearOfAllotment: { 
    type: String,
    match: /^[0-9]{4}$/,
    trim: true
  },
  // Date of joining the service
  rrSfsDate: { 
    type: Date 
  },
  dateOfJoining: { 
    type: Date 
  },
  dateOfRelieve: { 
    type: Date 
  },
  dateOfBirth: { 
    type: Date 
  },
  // Mobile number (must match Indian mobile number format)
  mobileNumber: { 
    type: String,
    match: /^[6-9]\d{9}$/,
    trim: true
  },
  // Communication address of the faculty
  communicationAddress: { 
    type: String,
    trim: true
  },
  // Permanent address of the faculty
  permanentAddress: {
    type: String,
    trim: true
  },
  // Email address (validated for proper email format)
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  },
  // Photograph URL
  photograph: { 
    type: String
  },
  // Current place of working
  presentPlaceOfWorking: { 
    type: String,
    trim: true
  },
  // Status of the faculty (retired or serving)
  status: { 
    type: String,
    trim: true,
    enum: ['retired', 'serving'],
    default: 'serving'
  },
  // Conduct remarks
  conduct: { 
    type: String,
    trim: true,
    default: ''
  },
  // Modules handled by the faculty
  modulesHandled: [{ 
    type: String,
    trim: true
  }],
  // Major domains of expertise
  majorDomains: [{
    type: String,
    trim: true,
    enum: Object.keys(domainOptions)
  }],
  // Minor domains of expertise
  minorDomains: [{
    type: String,
    trim: true,
    enum: Object.values(domainOptions).flat()
  }],
  // Areas of expertise
  areasOfExpertise: { 
    type: String,
    trim: true
  },
  // Awards received by the faculty
  awardsReceived: { 
    type: String,
    trim: true
  },
  // In-service training handled
  inServiceTrainingHandled: { 
    type: String,
    trim: true
  },
  // Publications by the faculty
  publications: [{
    typeOfPublication: {
      type: String,
      enum: ['Books Published', 'Articles Published', 'Manuals', 'Others'],
      default: 'Others'
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    dateOfPublication: {
      type: Date,
      default: null
    },
    additionalDetails: {
      type: String,
      trim: true
    }
  }],
  // Education details of the faculty
  educationDetails: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    institutionName: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // Courses handled by the faculty
  coursesHandled: [{
    courseType: {
      type: String,
      enum: [
        'InductionTraining',
        'InserviceTraining',
        'OtherStakeholder',
        'SpecialTraining',
        'SpecialLecture',
        'Tours',
        'Others',
        ''
      ],
      default: ''
    },
    batchno: {
      type: Number,
      default: null
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 10
    },
    feedbackRatings: {
      type: String,
      enum: ['poor', 'good', 'verygood', 'excellent', ''],
      default: ''
    },
    otherCourseType: {
      type: String,
      trim: true
    }
  }],
  // Tours attended by the faculty
  toursAttended: [{
    activityType: {
      type: String,
      enum: ['FieldExercise', 'StudyTour']
    },
    days: Number,
    startDate: Date,
    endDate: Date,
    fieldExerciseName: String,
    batchNumber: {
      type: Number,
      required: true
    },
    location: String,
    remarks: String,
    region: String
  }],
  // Examiner details
  examiner: [{
    batchNo: Number,
    year: Number,
    batchType: String,
    date: Date,
    paperCorrected: String
  }],
  // Special sessions handled by the faculty
  specialSessions: [{
    institutionname: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    date: Date,
    feedbackRating: Number,
    feedbackRating1: String
  }],
  // Institution details
  institution: { 
    type: String,
    trim: true
  },
  // Other responsibilities of the faculty
  otherResponsibilities: [{
    responsibility: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  // Date when the faculty joined (default to current date in IST)
  joined: { 
    type: Date, 
    default: () => {
      let date = new Date();
      let istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(date.getTime() + istOffset);
    } 
  },
  // Unique staff ID for the faculty
  staffid: {
    type: String,
    required: true,
    trim: true,
    default: () => `FAC${Date.now()}`
  },
  // Whether the faculty's verification was rejected
  verificationRejection: {
    type: Boolean,
    default: false
  },
  // Whether the faculty's approval was rejected
  approvalRejection: {
    type: Boolean,
    default: false
  },
  // Remarks for rejection
  rejectionRemarks: {
    type: String,
    trim: true,
    default: ""
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Export the Mongoose model for use in other parts of the application
module.exports = mongoose.model('RejectedFaculty', rejectedFacultySchema);