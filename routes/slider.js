const express = require('express');
const router = express.Router();
const multer = require('multer');

const Slider = require('../models/Slider');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


// ✅ GET ALL SLIDES
router.get('/all', async (req, res) => {

  const slides = await Slider.find();

  res.json(slides);

});


// ✅ UPDATE SLIDE IMAGE
router.post('/upload/:type', upload.single('image'), async (req, res) => {

  const { type } = req.params;

  let slide = await Slider.findOne({ type });

  if (!slide) {
    slide = new Slider({
      type,
      image: req.file.filename
    });
  } else {
    slide.image = req.file.filename;
  }

  await slide.save();

  res.json(slide);

});

module.exports = router;