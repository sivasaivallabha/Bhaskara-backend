const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: String
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);