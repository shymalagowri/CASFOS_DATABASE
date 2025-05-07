const mongoose = require('mongoose');

// Define domainOptions
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

const rejectedFacultySchema = new mongoose.Schema({
  verified: {
    type: Boolean,
    default: false
  },
  facultyType: { 
    type: String, 
    required: true,
    trim: true,
    enum: ['internal', 'external', 'contract']
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
    type: String
  },
  presentPlaceOfWorking: { 
    type: String,
    trim: true
  },
  status: { 
    type: String,
    trim: true,
    enum: ['retired', 'serving'],
    default: 'serving'
  },
  conduct: { 
    type: String,
    trim: true,
    default: ''
  },
  modulesHandled: [{ 
    type: String,
    trim: true
  }],
  majorDomains: [{
    type: String,
    trim: true,
    enum: Object.keys(domainOptions)
  }],
  minorDomains: [{
    type: String,
    trim: true,
    enum: Object.values(domainOptions).flat()
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
  examiner: [{
    batchNo: Number,
    year: Number,
    batchType: String,
    date: Date,
    paperCorrected: String
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
    date: Date,
    feedbackRating: Number,
    feedbackRating1: String
  }],
  institution: { 
    type: String,
    trim: true
  },
  otherResponsibilities: [{
    responsibility: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  joined: { 
    type: Date, 
    default: () => {
      let date = new Date();
      let istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(date.getTime() + istOffset);
    } 
  },
  staffid: {
    type: String,
    required: true,
    trim: true,
    default: () => `FAC${Date.now()}`
  },
  verificationRejection: {
    type: Boolean,
    default: false
  },
  approvalRejection: {
    type: Boolean,
    default: false
  },
  rejectionRemarks: {
    type: String,
    trim: true,
    default: ""
  }
}, { timestamps: true }); // Added timestamps option

module.exports = mongoose.model('RejectedFaculty', rejectedFacultySchema);