const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'venue_owner'],
    default: 'user',
  },
  profileImage: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },

}
{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);
