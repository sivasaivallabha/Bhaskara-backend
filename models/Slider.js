const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({

  type: {
    type: String,
    required: true
  },

  image: {
    type: String,
    default: ''
  }

});

module.exports = mongoose.model('Slider', sliderSchema);