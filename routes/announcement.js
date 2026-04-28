const express = require('express');
const router = express.Router();

const Announcement = require('../models/Announcement');

// ✅ SAVE / UPDATE ANNOUNCEMENT
router.post('/save', async (req, res) => {
  try {

    let existing = await Announcement.findOne();

    if (existing) {
      existing.text = req.body.text;
      await existing.save();
      return res.json(existing);
    }

    const newAnnouncement = new Announcement(req.body);
    await newAnnouncement.save();

    res.json(newAnnouncement);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ANNOUNCEMENT
router.get('/get', async (req, res) => {
  const data = await Announcement.findOne();
  res.json(data);
});

module.exports = router;