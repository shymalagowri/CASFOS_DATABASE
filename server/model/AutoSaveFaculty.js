// This file defines a Mongoose schema for an AutoSaveFaculty model.
// It includes various fields related to faculty information, such as staff ID, faculty type, personal details,
// education details, courses handled, tours attended, publications, and other responsibilities.
// The schema also includes validation for certain fields, such as email format and mobile number format.
// The model is exported for use in other parts of the application.
// This schema is used to manage faculty data in a MongoDB database.

const mongoose = require('mongoose');

// Domain options for faculty expertise
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

// Define the schema for AutoSaveFaculty
const AutoSaveFacultySchema = new mongoose.Schema({
  // Unique staff ID for the faculty
  staffid: {
    type: String,
    required: true,
    trim: true,
  },
  // Type of faculty (internal, external, or contract)
  facultyType: {
    type: String,
    required: true,
    trim: true,
    enum: ['internal', 'external', 'contract'],
  },
  // Faculty name
  name: { type: String, trim: true, default: '' },
  // Cadre of the faculty
  cadre: { type: String, trim: true, default: '' },
  // Year of allotment (must be a 4-digit year)
  yearOfAllotment: { type: String, match: /^[0-9]{4}$/, trim: true, default: '' },
  // Date of joining the service
  rrSfsDate: { type: Date, default: null },
  dateOfJoining: { type: Date, default: null },
  dateOfRelieve: { type: Date, default: null },
  dateOfBirth: { type: Date, default: null },
  // Mobile number (must match Indian mobile number format)
  mobileNumber: { type: String, match: /^[6-9]\d{9}$/, trim: true, default: '' },
  // Communication address of the faculty
  communicationAddress: { type: String, trim: true, default: '' },
  // Permanent address of the faculty
  permanentAddress: { type: String, trim: true, default: '' },
  // Email address (validated for proper email format)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    default: '',
  },
  // Photograph URL
  photograph: { type: String, default: null },
  // Current place of working
  presentPlaceOfWorking: { type: String, trim: true, default: '' },
  // Status of the faculty (retired or serving)
  status: { type: String, enum: ['retired', 'serving'], default: 'serving' },
  // Conduct remarks
  conduct: { type: String, trim: true, default: '' },
  // Modules handled by the faculty
  modulesHandled: { type: [String], default: [] },
  // Major domains of expertise
  majorDomains: { type: [String], enum: Object.keys(domainOptions), default: [] },
  // Minor domains of expertise
  minorDomains: { type: [String], enum: Object.values(domainOptions).flat(), default: [] },
  // Areas of expertise
  areasOfExpertise: { type: String, trim: true, default: '' },
  // Awards received by the faculty
  awardsReceived: { type: String, trim: true, default: '' },
  // In-service training handled
  inServiceTrainingHandled: { type: String, trim: true, default: '' },
  // Publications by the faculty
  publications: [{
    typeOfPublication: {
      type: String,
      enum: ['Books Published', 'Articles Published', 'Manuals', 'Others'],
      default: 'Others',
    },
    title: { type: String, trim: true, default: '' },
    dateOfPublication: { type: Date, default: null },
    additionalDetails: { type: String, trim: true, default: '' },
  }],
  // Education details of the faculty
  educationDetails: [{
    degree: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' },
    institutionName: { type: String, trim: true, default: '' },
  }],
  // Courses handled by the faculty
  coursesHandled: [{
    courseType: {
      type: String,
      enum: ['InductionTraining', 'InserviceTraining', 'OtherStakeholder', 'SpecialTraining', 'SpecialLecture', 'Tours', 'Others', ''],
      default: '',
    },
    batchno: { type: Number, default: null },
    title: { type: String, trim: true, default: '' },
    feedbackRating: { type: Number, min: 1, max: 10, default: null },
    feedbackRatings: { type: String, enum: ['poor', 'good', 'verygood', 'excellent', ''], default: '' },
    otherCourseType: { type: String, trim: true, default: '' },
  }],
  // Tours attended by the faculty
  toursAttended: [{
    activityType: { type: String, enum: ['FieldExercise', 'StudyTour'], default: null },
    days: { type: Number, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    fieldExerciseName: { type: String, trim: true, default: '' },
    batchNumber: { type: Number, default: null },
    location: { type: String, trim: true, default: '' },
    remarks: { type: String, trim: true, default: '' },
    region: { type: String, trim: true, default: '' },
  }],
  // Examiner details
  examiner: [{
    batchNo: { type: Number, default: null },
    year: { type: Number, default: null },
    batchType: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    paperCorrected: { type: String, trim: true, default: '' },
  }],
  // Special sessions handled by the faculty
  specialSessions: [{
    institutionname: { type: String, trim: true, default: '' },
    topic: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    feedbackRating: { type: Number, default: null },
    feedbackRating1: { type: String, trim: true, default: '' },
  }],
  // Institution details
  institution: { type: String, trim: true, default: '' },
  // Other responsibilities of the faculty
  otherResponsibilities: [{
    responsibility: { type: String, trim: true, default: '' },
  }],
  // Date when the faculty joined (default to current date in IST)
  joined: {
    type: Date,
    default: () => {
      let date = new Date();
      let istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(date.getTime() + istOffset);
    },
  },
});

// Export the model for use in other parts of the application
module.exports = mongoose.model('AutoSaveFaculty', AutoSaveFacultySchema);