const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // Forgot password OTP
  resetOTP: { type: String, default: null },
  resetOTPExpiry: { type: Date, default: null },

  // Streak tracking
  streak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null },
  totalDaysActive: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);