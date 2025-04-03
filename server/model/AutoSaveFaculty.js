const mongoose = require('mongoose');

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
  staffid: {
    type: String,
    required: true,
    trim: true,
  },
  facultyType: {
    type: String,
    required: true,
    trim: true,
    enum: ['internal', 'external', 'contract'],
  },
  name: { type: String, trim: true, default: '' },
  cadre: { type: String, trim: true, default: '' },
  yearOfAllotment: { type: String, match: /^[0-9]{4}$/, trim: true, default: '' },
  rrSfsDate: { type: Date, default: null },
  dateOfJoining: { type: Date, default: null },
  dateOfRelieve: { type: Date, default: null },
  dateOfBirth: { type: Date, default: null },
  mobileNumber: { type: String, match: /^[6-9]\d{9}$/, trim: true, default: '' },
  communicationAddress: { type: String, trim: true, default: '' },
  permanentAddress: { type: String, trim: true, default: '' },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    default: '',
  },
  photograph: { type: String, default: null },
  presentPlaceOfWorking: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['retired', 'serving'], default: 'serving' },
  conduct: { type: String, trim: true, default: '' },
  modulesHandled: { type: [String], default: [] },
  majorDomains: { type: [String], enum: Object.keys(domainOptions), default: [] },
  minorDomains: { type: [String], enum: Object.values(domainOptions).flat(), default: [] },
  areasOfExpertise: { type: String, trim: true, default: '' },
  awardsReceived: { type: String, trim: true, default: '' },
  inServiceTrainingHandled: { type: String, trim: true, default: '' },
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
  educationDetails: [{
    degree: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' },
    institutionName: { type: String, trim: true, default: '' },
  }],
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
  examiner: [{
    batchNo: { type: Number, default: null },
    year: { type: Number, default: null },
    batchType: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    paperCorrected: { type: String, trim: true, default: '' },
  }],
  specialSessions: [{
    institutionname: { type: String, trim: true, default: '' },
    topic: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    feedbackRating: { type: Number, default: null },
    feedbackRating1: { type: String, trim: true, default: '' },
  }],
  institution: { type: String, trim: true, default: '' },
  otherResponsibilities: [{
    responsibility: { type: String, trim: true, default: '' },
  }],
  joined: {
    type: Date,
    default: () => {
      let date = new Date();
      let istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(date.getTime() + istOffset);
    },
  },
});

module.exports = mongoose.model('AutoSaveFaculty', AutoSaveFacultySchema);