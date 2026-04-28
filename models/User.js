const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'staff', 'student'], // ✅ added staff
    default: 'student'
  }
});

module.exports = mongoose.model('User', userSchema);