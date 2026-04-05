const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendOTPEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'skillassess_secret_2024';
const ADMIN_KEY = process.env.ADMIN_REGISTER_KEY || 'skillassess_admin_2024';

function todayStr() { return new Date().toISOString().slice(0, 10); }

async function updateStreak(user) {
  const today = todayStr();
  if (user.lastActiveDate === today) return user.streak || 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const newStreak = user.lastActiveDate === yStr ? (user.streak || 0) + 1 : 1;
  await User.findByIdAndUpdate(user._id, {
    streak: newStreak, maxStreak: Math.max(newStreak, user.maxStreak || 0),
    lastActiveDate: today, totalDaysActive: (user.totalDaysActive || 0) + 1,
  });
  return newStreak;
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;
    const lowerEmail = email.toLowerCase();
    const existing = await User.findOne({ email: lowerEmail });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // If user is trying to register as admin, validate the key cleanly.
    let isAdmin = false;
    if (adminKey) {
      if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ message: 'Invalid Admin Secret Key.' });
      }
      isAdmin = true;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email: lowerEmail, password: hashed, isAdmin });
    await user.save();

    sendWelcomeEmail(lowerEmail);
    const newStreak = await updateStreak(user);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email, userId: user._id, isAdmin: user.isAdmin, streak: newStreak || 0, maxStreak: user.maxStreak || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const newStreak = await updateStreak(user);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email, userId: user._id, isAdmin: user.isAdmin || false, streak: newStreak || user.streak || 0, maxStreak: user.maxStreak || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { resetOTP: otp, resetOTPExpiry: expiry });
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOTP) return res.status(400).json({ message: 'OTP not found. Please request again.' });
    if (user.resetOTP !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (new Date() > user.resetOTPExpiry) return res.status(400).json({ message: 'OTP has expired. Please request again.' });
    const resetToken = jwt.sign({ userId: user._id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ message: 'OTP verified.', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    let decoded;
    try { decoded = jwt.verify(resetToken, JWT_SECRET); } catch { return res.status(400).json({ message: 'Reset token invalid or expired.' }); }
    if (decoded.purpose !== 'reset') return res.status(400).json({ message: 'Invalid token.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.userId, { password: hashed, resetOTP: null, resetOTPExpiry: null });
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/streak
exports.getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('streak maxStreak lastActiveDate totalDaysActive');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ streak: user.streak || 0, maxStreak: user.maxStreak || 0, lastActiveDate: user.lastActiveDate, totalDaysActive: user.totalDaysActive || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};