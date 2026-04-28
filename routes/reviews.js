const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Review = require('../models/Review');
const verifyAdmin = require('../middleware/auth');

router.delete('/:id', verifyAdmin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted by admin ✅" });
});


// ✅ FIRST: multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ✅ GET reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ POST review
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newReview = new Review({
      name: req.body.name,
      course: req.body.course,
      comment: req.body.comment,
      rating: req.body.rating,
      image: req.file ? req.file.filename : ''
    });

    const savedReview = await newReview.save();
    res.json(savedReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// DELETE by name
router.delete('/name/:name', async (req, res) => {
  try {
    const deleted = await Review.findOneAndDelete({ name: req.params.name });

    if (!deleted) {
      return res.status(404).json({ message: "No review found" });
    }

    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;