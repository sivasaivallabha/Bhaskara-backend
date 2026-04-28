const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({

  name: String, // Mid-1, Final, Unit Test

  class: String,
  section: String,
  group: String,

  subjects: [
    {
      name: String,
      maxMarks: Number
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);