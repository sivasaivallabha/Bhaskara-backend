const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/100'
  },
  comment: {
    type: String,
    required: true
  },
  rating: {
  type: Number,
  required: true,
  min: 1,
  max: 5
}
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);