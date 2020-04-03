const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true
  },
  date: Date,
  likes: Number,
  like_users: [mongoose.ObjectId]
});

module.exports = mongoose.model('Photo', PhotoSchema);
