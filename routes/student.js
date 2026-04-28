const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const verifyAdmin = require('../middleware/auth');



// ✅ UPDATE STUDENT
router.put('/update/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE STUDENT
router.delete('/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD STUDENT (TEMP - FOR POSTMAN)
router.post('/add', async (req, res) => {
  try {

    const student = new Student(req.body);
    await student.save();

    res.json({ message: "Student added ✅", student });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET STUDENT DATA (by logged-in user)
// ✅ GET STUDENT DATA (by logged-in user)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, "secretkey");

    const student = await Student.findOne({ userId: decoded.id });

    if (!student) {
      return res.json(null);
    }

    // ✅ SAFE FEES
    const fees = student.fees || {
      schoolFee: 0,
      busFee: 0,
      concession1: 0,
      concession2: 0
    };

    const totalFees =
      (fees.schoolFee || 0) +
      (fees.busFee || 0) -
      (fees.concession1 || 0) -
      (fees.concession2 || 0);

    const feesPaid = student.feesPaid || 0;
    const due = totalFees - feesPaid;

    res.json({
      ...student.toObject(),

      subjects: student.subjects || [],
      exams: student.exams || [],
      fees,

      photo: student.photo || '',
      institutionType: student.institutionType || 'school',
      institutionName: student.institutionName || '',

      totalFees,
      feesPaid,
      due
    });

  } catch (err) {
    res.status(401).json({ message: "Unauthorized ❌" });
  }
});

module.exports = router;

router.get('/all', verifyAdmin, async (req, res) => {
  try {

    let query = {};

    if (req.query.class) query.class = req.query.class;
    if (req.query.section) query.section = req.query.section;
    if (req.query.group) query.group = req.query.group;

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { rollNo: { $regex: req.query.search, $options: 'i' } },
        { fatherPhone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 🔥 ADD populate
    const students = await Student.find(query).populate('userId', 'email');

    const result = students.map(s => {

      const fees = s.fees || {
        schoolFee: 0,
        busFee: 0,
        concession1: 0,
        concession2: 0
      };

      const total =
        (fees.schoolFee || 0) +
        (fees.busFee || 0) -
        (fees.concession1 || 0) -
        (fees.concession2 || 0);

      return {
        ...s.toObject(),

        // 🔥 SAFE STRUCTURE
        subjects: s.subjects || [],
        fees,

        totalFees: total,
        feesPaid: s.feesPaid || 0,
        due: total - (s.feesPaid || 0)
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ UPLOAD PHOTO
router.post('/upload/:id', upload.single('photo'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { photo: req.file.filename },
      { new: true }
    );

    res.json(student);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ SAVE ATTENDANCE (BULK)
router.post('/attendance/bulk', async (req, res) => {
  try {

    const { date, period, students } = req.body;

    if (!date || !period || !students) {
      return res.status(400).json({ error: "Missing data" });
    }

    for (const s of students) {

      if (!s.studentId) continue;

      const student = await Student.findById(s.studentId);

      if (!student) continue;

      // ✅ init if not exists
      if (!student.attendanceRecords) {
        student.attendanceRecords = [];
      }

      // ✅ check existing record
      const existing = student.attendanceRecords.find(
        a => a.date === date && a.period === period
      );

      if (existing) {
        existing.status = s.status;
      } else {
        student.attendanceRecords.push({
          date,
          period,
          status: s.status
        });
      }

      await student.save();
    }

    res.json({ message: "Attendance Saved ✅" });

  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});




router.get('/download/basic', async (req, res) => {
  try {
    const students = await Student.find().populate('userId');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Basic Details');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Roll No', key: 'rollNo', width: 15 },
      { header: 'Class', key: 'class', width: 10 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Group', key: 'group', width: 10 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Phone', key: 'fatherPhone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Institution', key: 'institutionName', width: 25 }
    ];

    students.forEach(s => {
      sheet.addRow({
        name: s.name,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        group: s.group,
        fatherName: s.fatherName,
        fatherPhone: s.fatherPhone,
        email: s.userId?.email || '',
        institutionName: s.institutionName
      });
    });

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.setHeader('Content-Disposition',
      'attachment; filename=basic_details.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ error: 'Download failed' });
  }
});

router.get('/download/fees', async (req, res) => {
  try {
    const students = await Student.find();

    const workbook = new ExcelJS.Workbook();

    // 👉 GROUP BY GROUP (MPC, BiPC...)
    const groups = {};

    students.forEach(s => {
      const group = s.group || 'Others';
      if (!groups[group]) groups[group] = [];
      groups[group].push(s);
    });

    // 👉 CREATE SHEET FOR EACH GROUP
    for (const group in groups) {

      const sheet = workbook.addWorksheet(group);

      sheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Roll No', key: 'rollNo', width: 15 },
        { header: 'Class', key: 'class', width: 10 },
        { header: 'Section', key: 'section', width: 10 },
        { header: 'School Fee', key: 'schoolFee', width: 15 },
        { header: 'Bus Fee', key: 'busFee', width: 15 },
        { header: 'Concession1', key: 'c1', width: 15 },
        { header: 'Concession2', key: 'c2', width: 15 },
        { header: 'Paid', key: 'paid', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Due', key: 'due', width: 15 }
      ];

      // 🔥 SORT BY SECTION
      groups[group].sort((a, b) => a.section.localeCompare(b.section));

      groups[group].forEach(s => {

        const total =
          (s.fees?.schoolFee || 0) +
          (s.fees?.busFee || 0) -
          (s.fees?.concession1 || 0) -
          (s.fees?.concession2 || 0);

        const due = total - (s.feesPaid || 0);

        sheet.addRow({
          name: s.name,
          rollNo: s.rollNo,
          class: s.class,
          section: s.section,
          schoolFee: s.fees?.schoolFee || 0,
          busFee: s.fees?.busFee || 0,
          c1: s.fees?.concession1 || 0,
          c2: s.fees?.concession2 || 0,
          paid: s.feesPaid || 0,
          total,
          due
        });
      });
    }

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.setHeader('Content-Disposition',
      'attachment; filename=fee_details.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ error: 'Fee Excel failed' });
  }
});




router.get('/exams/list', async (req, res) => {
  try {

    const { class: cls, section, group } = req.query;

    let match = {};

    if (cls) match.class = cls;
    if (section) match.section = section;
    if (group) match.group = group;

    const students = await Student.find(match);

    const examSet = new Set();

    students.forEach(s => {
      (s.exams || []).forEach(e => {
        if (e.examName) examSet.add(e.examName);
      });
    });

    res.json([...examSet]);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

router.get('/download/exams', async (req, res) => {
  try {

    const { class: cls, section, group, examName } = req.query;

    let query = {};

    if (cls) query.class = cls;
    if (section) query.section = section;
    if (group) query.group = group;

    const students = await Student.find(query);

    const workbook = new ExcelJS.Workbook();

    // 👉 GROUP BY GROUP
    const grouped = {};

    students.forEach(s => {
      const g = s.group || 'Others';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(s);
    });

    for (const groupName in grouped) {

      const sheet = workbook.addWorksheet(groupName);

      // 🔥 FIND SUBJECTS FROM FIRST STUDENT
      let subjects = [];

      const firstStudent = grouped[groupName].find(s =>
        s.exams?.some(e => e.examName === examName)
      );

      if (firstStudent) {
        const exam = firstStudent.exams.find(e => e.examName === examName);
        subjects = exam.subjects.map(s => s.name);
      }

      // 🔥 HEADERS
      const columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Roll No', key: 'rollNo', width: 15 },
        { header: 'Class', key: 'class', width: 10 },
        { header: 'Section', key: 'section', width: 10 }
      ];

      subjects.forEach(sub => {
        columns.push({
          header: sub,
          key: sub,
          width: 15
        });
      });

      sheet.columns = columns;

      // 🔥 SORT BY SECTION
      grouped[groupName].sort((a, b) =>
        a.section.localeCompare(b.section)
      );

      grouped[groupName].forEach(s => {

        const row = {
          name: s.name,
          rollNo: s.rollNo,
          class: s.class,
          section: s.section
        };

        const exam = s.exams?.find(e => e.examName === examName);

        if (exam) {
          exam.subjects.forEach(sub => {
            row[sub.name] = sub.marksObtained;
          });
        }

        sheet.addRow(row);
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${examName}_report.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Exam Excel failed' });
  }
});


