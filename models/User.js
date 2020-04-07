const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profile_url: {
    type: String,
    default: 'https://i.dlpng.com/static/png/6863421_preview.png'
  },
  photos: [mongoose.ObjectId],
  followers: [mongoose.ObjectId],
  followings: [mongoose.ObjectId]
});

module.exports = mongoose.model('User', UserSchema);
