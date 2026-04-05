const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getStudents, getAnalytics, exportCSV, getStudentProgress, getMyProgress,
} = require('../controllers/adminController');

// Student self-view (no admin required)
router.get('/my-progress', auth, getMyProgress);

// Admin only routes
router.get('/questions', auth, adminAuth, getQuestions);
router.post('/questions', auth, adminAuth, createQuestion);
router.put('/questions/:id', auth, adminAuth, updateQuestion);
router.delete('/questions/:id', auth, adminAuth, deleteQuestion);
router.get('/students', auth, adminAuth, getStudents);
router.get('/analytics', auth, adminAuth, getAnalytics);
router.get('/export-csv', auth, adminAuth, exportCSV);
router.get('/progress/:userId', auth, adminAuth, getStudentProgress);

module.exports = router;