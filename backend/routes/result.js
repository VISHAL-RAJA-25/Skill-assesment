const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { saveResult, getHistory, getJobs } = require('../controllers/resultController');

router.post('/save', auth, saveResult);
router.get('/history', auth, getHistory);
router.get('/jobs', getJobs);

module.exports = router;

