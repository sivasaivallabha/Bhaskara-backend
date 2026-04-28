const express = require('express');
const router = express.Router();

const Exam = require('../models/Exam');
const Student = require('../models/Student'); // ✅ ADD THIS

// ✅ CREATE EXAM
router.post('/create', async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET EXAMS
router.get('/all', async (req, res) => {
  const { class: cls, section, group } = req.query;

  const exams = await Exam.find({
    class: cls,
    section,
    group
  });

  res.json(exams);
});






// ✅ SAVE ALL MARKS (BULK)
router.post('/marks/bulk', async (req, res) => {
  try {

    const { examId, examName, students } = req.body;

    if (!examId || !students || !students.length) {
      return res.status(400).json({ error: "Invalid data" });
    }

    for (const s of students) {

      // ❌ skip invalid students
      if (!s.studentId) continue;

      const student = await Student.findById(s.studentId);

      if (!student) {
        console.log("❌ Student not found:", s.studentId);
        continue;
      }

      if (!student.exams) student.exams = [];

      const existing = student.exams.find(
        e => e.examId?.toString() === examId
      );

      if (existing) {
        existing.subjects = s.subjects;
      } else {
        student.exams.push({
          examId,
          examName,
          subjects: s.subjects
        });
      }

      await student.save();
    }

    res.json({ message: "All Marks Saved ✅" });

  } catch (err) {
    console.error("🔥 BULK ERROR:", err); // 👈 VERY IMPORTANT
    res.status(500).json({ error: err.message });
  }
});



// ✅ SAVE MARKS
router.post('/marks/:studentId', async (req, res) => {
  try {

    const { examId, examName, subjects } = req.body;

    const student = await Student.findById(req.params.studentId);

    if (!student.exams) student.exams = []; // safety

    const existing = student.exams.find(
      e => e.examId?.toString() === examId
    );

    if (existing) {
      existing.subjects = subjects;
    } else {
      student.exams.push({
        examId,
        examName,
        subjects
      });
    }

    await student.save();

    res.json({ message: "Marks Saved ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;