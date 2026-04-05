const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    register,
    login,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getStreak,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/streak', auth, getStreak);

module.exports = router;