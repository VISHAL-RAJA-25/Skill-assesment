const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getQuestions,
    getPlacementQuestions,
    checkMCQ,
    runSQL,
    runDSA,
    getHint,
    rateQuestion,
} = require('../controllers/testController');

router.get('/questions', auth, getQuestions);
router.get('/placement-questions', auth, getPlacementQuestions);
router.post('/check-mcq', auth, checkMCQ);
router.post('/run-sql', auth, runSQL);
router.post('/run-dsa', auth, runDSA);
router.post('/hint', auth, getHint);
router.post('/rate', auth, rateQuestion);

module.exports = router;