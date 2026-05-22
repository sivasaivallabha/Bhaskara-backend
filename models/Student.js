const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 👤 BASIC
  name: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  admissionNumber: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  fatherPhone: { type: String, default: '' },
  phoneNumber2: { type: String, default: '' },
  aadhaarNumber: { type: String, default: '' },

  dateOfBirth: { type: String, default: '' },

  address: { type: String, default: '' },

  // 🎓 SCHOOL / COLLEGE
  institutionType: {
    type: String,
    enum: ['school', 'college'],
    default: 'school'
  },

  institutionName: {
    type: String,
    default: ''
  },

  class: { type: String, default: '' },
  section: { type: String, default: '' },
  group: { type: String, default: '' },

  attendance: { type: Number, default: 0 },

  // 🔥 OLD (keep for now if already used)
  subjects: [
    {
      name: { type: String, default: '' },
      marks: { type: Number, default: 0 }
    }
  ],

  // 🔥 NEW: EXAMS SYSTEM (IMPORTANT)
  exams: [
  {
    examId: mongoose.Schema.Types.ObjectId,
    examName: String,
    subjects: [
      {
        name: String,
        maxMarks: Number,
        marksObtained: Number
      }
    ]
  }
],
attendanceRecords: [
  {
    date: String,   // "2026-04-18"
    period: Number, // 1–7
    status: String  // "Present" | "Absent"
  }
],

  // 💰 FEES
  fees: {
    schoolFee: { type: Number, default: 0 },
    busFee: { type: Number, default: 0 },
    concession1: { type: Number, default: 0 },
    concession2: { type: Number, default: 0 }
  },

  feesPaid: { type: Number, default: 0 },

  // 📸 PHOTO
  photo: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);