const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);