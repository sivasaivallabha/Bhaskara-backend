const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');

// 📸 multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ✅ GET images
router.get('/', async (req, res) => {
  const images = await Gallery.find().sort({ createdAt: -1 });
  res.json(images);
});


// ✅ POST upload (ADMIN ONLY)
router.post('/', upload.single('image'), async (req, res) => {

  const newImage = new Gallery({
    image: req.file.filename
  });

  await newImage.save();

  res.json(newImage);
});


// ✅ DELETE image
router.delete('/:id', async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;