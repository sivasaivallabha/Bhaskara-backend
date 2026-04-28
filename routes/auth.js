const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


// ✅ REGISTER (optional)
const verifyAdmin = require('../middleware/auth');


const Student = require('../models/Student'); // 🔥 ADD THIS

router.post('/register', verifyAdmin, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // 🔥 AUTO CREATE STUDENT RECORD
    if (role === 'student') {

      const student = new Student({
        userId: user._id,

        // EMPTY DATA (ADMIN WILL FILL)
        name: '',
        rollNo: '',
        fatherName: '',
        fatherPhone: '',

        class: '',
        section: '',
        group: '',

        attendance: 0,

        subjects: [],

        fees: {
          schoolFee: 0,
          busFee: 0,
          concession1: 0,
          concession2: 0
        },

        feesPaid: 0
      });

      await student.save();
    }

    res.json({ message: "User + Student created ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "User not found ❌" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Wrong password ❌" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    "secretkey",
    { expiresIn: "1d" }
  );

  res.json({
    token,
    role: user.role
  });
});


// 🔐 RESET STUDENT PASSWORD (ADMIN ONLY)
router.put('/reset-password/:studentId', verifyAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Password required ❌" });
    }

    // 🔍 Find student
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found ❌" });
    }

    // 🔍 Find user linked to student
    const user = await User.findById(student.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;