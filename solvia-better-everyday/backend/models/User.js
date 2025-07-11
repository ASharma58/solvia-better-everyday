const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
  type: String,
  required: true,
  minlength: 8,
  validate: {
    validator: function (value) {
      // Must contain at least one lowercase letter, one uppercase letter, one number, and one special character
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
    },
    message:
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
  }
}

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
