const Question = require('../models/Question');
const TestResult = require('../models/Result');
const QuestionRating = require('../models/QuestionRating');
const User = require('../models/User');

// ── GET /api/admin/questions ───────────────────────────────────────────────
exports.getQuestions = async (req, res) => {
    try {
        const { topic, difficulty } = req.query;
        const filter = {};
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        const questions = await Question.find(filter).sort({ topic: 1, difficulty: 1 });
        res.json({ questions, total: questions.length });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── POST /api/admin/questions ──────────────────────────────────────────────
exports.createQuestion = async (req, res) => {
    try {
        const q = new Question(req.body);
        await q.save();
        res.json({ question: q, message: 'Question created' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PUT /api/admin/questions/:id ───────────────────────────────────────────
exports.updateQuestion = async (req, res) => {
    try {
        const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!q) return res.status(404).json({ message: 'Not found' });
        res.json({ question: q, message: 'Updated' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── DELETE /api/admin/questions/:id ───────────────────────────────────────
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/admin/students ────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select('email streak maxStreak totalDaysActive createdAt').sort({ createdAt: -1 });
        const results = await TestResult.find({ userId: { $in: users.map(u => u._id) } });

        const studentData = users.map(user => {
            const userResults = results.filter(r => r.userId.toString() === user._id.toString());
            const avgScore = userResults.length ? Math.round(userResults.reduce((a, b) => a + b.overallPercentage, 0) / userResults.length) : 0;
            const latest = userResults[0];
            return {
                _id: user._id, email: user.email, streak: user.streak,
                totalDays: user.totalDaysActive, joinedAt: user.createdAt,
                testsCount: userResults.length, avgScore,
                lastScore: latest?.overallPercentage || 0,
                strongSkills: latest?.strongSkills || [],
                weakSkills: latest?.weakSkills || [],
            };
        });
        res.json({ students: studentData });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/admin/analytics ───────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    try {
        const ratings = await QuestionRating.find().populate('questionId', 'question topic difficulty');
        const ratingMap = {};
        for (const r of ratings) {
            if (!r.questionId) continue;
            const key = r.questionId._id.toString();
            if (!ratingMap[key]) ratingMap[key] = { questionId: key, question: r.questionId.question?.slice(0, 80) + '...', topic: r.questionId.topic, difficulty: r.questionId.difficulty, too_easy: 0, just_right: 0, too_hard: 0, total: 0 };
            ratingMap[key][r.rating]++;
            ratingMap[key].total++;
        }

        const allResults = await TestResult.find();
        const totalStudents = await User.countDocuments({ isAdmin: false });
        const totalTests = allResults.length;
        const avgOverall = totalTests ? Math.round(allResults.reduce((a, b) => a + b.overallPercentage, 0) / totalTests) : 0;

        const skillSummary = { aptitude: [], dsa: [], sql: [], networks: [] };
        for (const r of allResults) {
            for (const sr of r.skillResults || []) {
                if (skillSummary[sr.topic]) skillSummary[sr.topic].push(sr.percentage);
            }
        }
        const skillAvg = {};
        for (const [skill, scores] of Object.entries(skillSummary)) {
            skillAvg[skill] = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        }

        const now = new Date();
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
        const testsPerDay = days.map(day => ({ date: day, count: allResults.filter(r => r.takenAt?.toISOString().slice(0, 10) === day).length }));

        res.json({ totalStudents, totalTests, avgOverall, skillAvg, testsPerDay, questionRatings: Object.values(ratingMap).sort((a, b) => b.too_hard - a.too_hard) });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/admin/export-csv ──────────────────────────────────────────────
exports.exportCSV = async (req, res) => {
    try {
        const results = await TestResult.find().populate('userId', 'email');
        const rows = ['Email,Test Type,Overall %,Aptitude %,DSA %,SQL %,Networks %,Strong Skills,Weak Skills,Date'];
        for (const r of results) {
            const email = r.userId?.email || 'unknown';
            const skills = {};
            for (const sr of r.skillResults || []) skills[sr.topic] = sr.percentage;
            rows.push([email, r.testType, r.overallPercentage, skills.aptitude || '', skills.dsa || '', skills.sql || '', skills.networks || '', `"${(r.strongSkills || []).join(', ')}"`, `"${(r.weakSkills || []).join(', ')}"`, r.takenAt?.toISOString().slice(0, 10) || ''].join(','));
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="skillassess_results.csv"');
        res.send(rows.join('\n'));
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/admin/progress/:userId ───────────────────────────────────────
exports.getStudentProgress = async (req, res) => {
    try {
        const userId = req.params.userId;
        const results = await TestResult.find({ userId }).sort({ takenAt: 1 }).limit(20);
        const progress = results.map(r => ({
            date: r.takenAt?.toISOString().slice(0, 10),
            overall: r.overallPercentage,
            aptitude: r.skillResults?.find(s => s.topic === 'aptitude')?.percentage || null,
            dsa: r.skillResults?.find(s => s.topic === 'dsa')?.percentage || null,
            sql: r.skillResults?.find(s => s.topic === 'sql')?.percentage || null,
            networks: r.skillResults?.find(s => s.topic === 'networks')?.percentage || null,
            testType: r.testType,
        }));
        res.json({ progress });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/admin/my-progress (for student self-view) ────────────────────
exports.getMyProgress = async (req, res) => {
    try {
        const results = await TestResult.find({ userId: req.userId }).sort({ takenAt: 1 }).limit(20);
        const progress = results.map(r => ({
            date: r.takenAt?.toISOString().slice(0, 10),
            overall: r.overallPercentage,
            aptitude: r.skillResults?.find(s => s.topic === 'aptitude')?.percentage || null,
            dsa: r.skillResults?.find(s => s.topic === 'dsa')?.percentage || null,
            sql: r.skillResults?.find(s => s.topic === 'sql')?.percentage || null,
            networks: r.skillResults?.find(s => s.topic === 'networks')?.percentage || null,
            testType: r.testType,
        }));
        res.json({ progress });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};