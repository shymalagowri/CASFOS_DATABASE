const mongoose = require('mongoose');

// Define domainOptions directly or import from a shared file
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

const AutoSaveFacultySchema = new mongoose.Schema({
  _id: { // Kept as staffid from frontend, renamed from previous _id
    type: String,
    required: true,
    trim: true
  },
  facultyType: { 
    type: String, 
    required: true,
    trim: true,
    enum: ['internal', 'external']
  },
  name: { 
    type: String,
    required: true,
    trim: true
  },
  cadre: { 
    type: String,
    trim: true
  },
  yearOfAllotment: { 
    type: String,
    match: /^[0-9]{4}$/,
    trim: true
  },
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
  mobileNumber: { 
    type: String,
    match: /^[6-9]\d{9}$/,
    trim: true
  },
  communicationAddress: { 
    type: String,
    trim: true
  },
  permanentAddress: {
    type: String,
    trim: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  },
  photograph: { 
    type: String,
    default: null // Consistent with controller handling
  },
  presentPlaceOfWorking: { 
    type: String,
    trim: true
  },
  status: { 
    type: String,
    trim: true,
    enum: ['retired', 'serving'],
    required: true,
    default: 'serving' // Added default per controller logic
  },
  conduct: { 
    type: String,
    trim: true,
    default: '' // Added default per controller logic
  },
  modulesHandled: [{ 
    type: String,
    trim: true,
    default: [] // Added default per controller logic
  }],
  majorDomains: [{
    type: String,
    trim: true,
    enum: Object.keys(domainOptions) // Use major domain keys
  }],
  minorDomains: [{
    type: String,
    trim: true,
    enum: Object.values(domainOptions).flat() // Use all minor domain values
  }],
  areasOfExpertise: { 
    type: String,
    trim: true
  },
  awardsReceived: { 
    type: String,
    trim: true
  },
  inServiceTrainingHandled: { 
    type: String,
    trim: true
  },
  publications: [{
    typeOfPublication: {
      type: String,
      required: true,
      enum: ['Books Published', 'Articles Published', 'Manuals', 'Others']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    dateOfPublication: {
      type: Date,
      required: true
    },
    additionalDetails: {
      type: String,
      trim: true
    }
  }],
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
  coursesHandled: [{
    courseType: {
      type: String,
      required: true,
      enum: [
        'InductionTraining',
        'InserviceTraining',
        'OtherStakeholder',
        'SpecialTraining',
        'SpecialLecture',
        'Tours',
        'Others'
      ]
    },
    batchno: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 10
    },
    feedbackRatings: {
      type: String,
      enum: ['poor', 'good', 'verygood', 'excellent', '']
    },
    otherCourseType: {
      type: String,
      trim: true
    }
  }],
  toursAttended: [{
    activityType: {
      type: String,
      enum: ['FieldExercise', 'StudyTour']
    },
    days: Number,
    startDate: Date,
    endDate: Date,
    fieldExerciseName: { type: String, trim: true },
    batchNumber: {
      type: Number,
      required: true
    },
    location: { type: String, trim: true },
    remarks: { type: String, trim: true },
    region: { type: String, trim: true }
  }],
  examiner: [{
    batchNo: { type: Number },
    year: { type: Number },
    batchType: { type: String, trim: true },
    date: { type: Date },
    paperCorrected: { type: String, trim: true }
  }],
  specialSessions: [{
    institutionname: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    date: { type: Date },
    feedbackRating: { type: Number },
    feedbackRating1: { type: String, trim: true }
  }],
  institution: { 
    type: String,
    trim: true
  },
  otherResponsibilities: [{
    responsibility: {
      type: String,
      trim: true
    }
  }],
  joined: { 
    type: Date, 
    default: () => {
      let date = new Date();
      let istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(date.getTime() + istOffset);
    } 
  }
  // Note: staffid is already represented as _id, so no separate field added
});

module.exports = mongoose.model('AutoSaveFaculty', AutoSaveFacultySchema);