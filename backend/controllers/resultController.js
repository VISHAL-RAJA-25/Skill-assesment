const TestResult = require('../models/Result');

// ─── Full Job Map with skill requirements ─────────────────────────────────
const JOB_MAP = [
    {
        title: 'Backend Software Engineer',
        icon: '⚙️',
        companies: ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Flipkart'],
        requiredSkills: { dsa: 70, aptitude: 60 },
        strongIn: 'dsa',
        description: 'Build server-side systems, APIs and microservices.',
        roadmap: [
            { label: 'NeetCode DSA Roadmap', url: 'https://neetcode.io/roadmap' },
            { label: 'Backend Developer Roadmap', url: 'https://roadmap.sh/backend' },
            { label: 'LeetCode Top 150', url: 'https://leetcode.com/studyplan/top-interview-150/' }
        ]
    },
    {
        title: 'Database Developer / DBA',
        icon: '🗄️',
        companies: ['Oracle', 'IBM', 'Accenture', 'Capgemini'],
        requiredSkills: { sql: 70, aptitude: 50 },
        strongIn: 'sql',
        description: 'Design, maintain and optimise relational databases.',
        roadmap: [
            { label: 'Mode SQL Tutorial (Advanced)', url: 'https://mode.com/sql-tutorial/' },
            { label: 'SQLZoo Practice', url: 'https://sqlzoo.net/' },
            { label: 'Database Design — Coursera', url: 'https://www.coursera.org/learn/database-design' }
        ]
    },
    {
        title: 'Data Analyst',
        icon: '📊',
        companies: ['Mu Sigma', 'Fractal Analytics', 'Amazon', 'Walmart Labs'],
        requiredSkills: { sql: 65, aptitude: 65 },
        strongIn: 'sql',
        description: 'Analyse business data and generate insights using SQL and statistics.',
        roadmap: [
            { label: 'Google Data Analytics Certificate', url: 'https://grow.google/certificates/data-analytics/' },
            { label: 'SQL for Data Science — Coursera', url: 'https://www.coursera.org/learn/sql-for-data-science' },
            { label: 'IndiaBIX Aptitude Practice', url: 'https://www.indiabix.com/' }
        ]
    },
    {
        title: 'Network / Systems Engineer',
        icon: '🌐',
        companies: ['Cisco', 'Juniper', 'HCL', 'Tech Mahindra', 'BSNL'],
        requiredSkills: { networks: 70, aptitude: 55 },
        strongIn: 'networks',
        description: 'Design, implement and maintain computer networks and infrastructure.',
        roadmap: [
            { label: 'Cisco Networking Academy (Free)', url: 'https://www.netacad.com/' },
            { label: 'CompTIA Network+ Certification', url: 'https://www.comptia.org/certifications/network' },
            { label: 'Computer Networks — Gate Smashers (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' }
        ]
    },
    {
        title: 'Full Stack Developer',
        icon: '🖥️',
        companies: ['Zoho', 'Freshworks', 'Razorpay', 'Swiggy', 'Zomato'],
        requiredSkills: { dsa: 60, sql: 55, networks: 50 },
        strongIn: null,
        description: 'Build end-to-end web applications covering frontend, backend and databases.',
        roadmap: [
            { label: 'Full Stack Roadmap', url: 'https://roadmap.sh/full-stack' },
            { label: 'The Odin Project (Free)', url: 'https://www.theodinproject.com/' },
            { label: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/' }
        ]
    },
    {
        title: 'DevOps / Cloud Engineer',
        icon: '☁️',
        companies: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Deloitte'],
        requiredSkills: { networks: 65, dsa: 50 },
        strongIn: 'networks',
        description: 'Automate deployments, manage cloud infrastructure and CI/CD pipelines.',
        roadmap: [
            { label: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' },
            { label: 'AWS Cloud Practitioner (Free)', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/' },
            { label: 'Linux & Networking Basics', url: 'https://linuxjourney.com/' }
        ]
    },
    {
        title: 'Campus Placement (General)',
        icon: '🎓',
        companies: ['TCS', 'Infosys', 'Cognizant', 'Wipro', 'HCL'],
        requiredSkills: { aptitude: 50 },
        strongIn: null,
        description: 'Qualify for mass campus recruitment drives at top IT companies.',
        roadmap: [
            { label: 'IndiaBIX Aptitude (Free)', url: 'https://www.indiabix.com/' },
            { label: 'GeeksForGeeks Placement Prep', url: 'https://www.geeksforgeeks.org/placement-preparation/' },
            { label: 'TCS NQT Preparation Guide', url: 'https://www.geeksforgeeks.org/tcs-nqt-2024/' }
        ]
    }
];

// ─── Roadmaps for weak skill improvement ─────────────────────────────────
const WEAK_SKILL_ROADMAP = {
    aptitude: {
        label: 'Aptitude',
        icon: '🧮',
        tips: 'Focus on speed and accuracy. Practice 20 questions daily.',
        resources: [
            { label: 'IndiaBIX — All Aptitude Topics', url: 'https://www.indiabix.com/' },
            { label: 'RS Aggarwal Quantitative Aptitude', url: 'https://www.geeksforgeeks.org/quantitative-aptitude/' },
            { label: 'Freshers World Aptitude Tests', url: 'https://www.fresherworld.com/placement-papers' }
        ]
    },
    dsa: {
        label: 'Data Structures & Algorithms',
        icon: '💻',
        tips: 'Master Arrays, Strings, Linked Lists first. Then move to Trees and DP.',
        resources: [
            { label: 'NeetCode Roadmap (Structured)', url: 'https://neetcode.io/roadmap' },
            { label: 'GeeksForGeeks DSA Tutorial', url: 'https://www.geeksforgeeks.org/dsa-tutorial/' },
            { label: 'LeetCode 75 (Essential)', url: 'https://leetcode.com/studyplan/leetcode-75/' },
            { label: 'Striver DSA Sheet', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' }
        ]
    },
    sql: {
        label: 'SQL',
        icon: '🗄️',
        tips: 'Practice JOINs, GROUP BY, subqueries and window functions.',
        resources: [
            { label: 'SQLZoo — Interactive Practice', url: 'https://sqlzoo.net/' },
            { label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
            { label: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/' },
            { label: 'W3Schools SQL (Basics)', url: 'https://www.w3schools.com/sql/' }
        ]
    },
    networks: {
        label: 'Computer Networks',
        icon: '🌐',
        tips: 'Understand OSI model, TCP/IP stack, DNS, subnetting thoroughly.',
        resources: [
            { label: 'Cisco NetAcad — Free Courses', url: 'https://www.netacad.com/' },
            { label: 'Gate Smashers Networks (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' },
            { label: 'GeeksForGeeks Computer Networks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/' },
            { label: 'CompTIA Network+ Study Guide', url: 'https://www.comptia.org/certifications/network' }
        ]
    }
};

// ─── Compute job recommendations from skill percentages ──────────────────
function computeRecommendations(skillPercentages) {
    const eligible = [];
    const partial = [];

    for (const job of JOB_MAP) {
        const entries = Object.entries(job.requiredSkills);
        const metCount = entries.filter(([skill, min]) => (skillPercentages[skill] || 0) >= min).length;

        if (metCount === entries.length) {
            // fully eligible
            eligible.push({ ...job, matchPercent: 100 });
        } else if (metCount >= 1) {
            // partially eligible — show as "almost there"
            const matchPercent = Math.round((metCount / entries.length) * 100);
            partial.push({ ...job, matchPercent, missingSkills: entries.filter(([s, m]) => (skillPercentages[s] || 0) < m).map(([s]) => s) });
        }
    }

    return { eligible, partial };
}

// ─── POST /api/result/save ────────────────────────────────────────────────
exports.saveResult = async (req, res) => {
    try {
        const { skillResults, testType } = req.body;
        const userId = req.userId;

        const skillPercentages = {};
        skillResults.forEach(sr => { skillPercentages[sr.topic] = sr.percentage; });

        const weakSkills = skillResults.filter(s => s.percentage < 50).map(s => s.topic);
        const strongSkills = skillResults.filter(s => s.percentage >= 70).map(s => s.topic);

        const { eligible, partial } = computeRecommendations(skillPercentages);
        const jobTitles = eligible.map(j => j.title);

        const totalScore = skillResults.reduce((a, b) => a + b.score, 0);
        const totalPossible = skillResults.reduce((a, b) => a + b.total, 0);
        const overallPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

        const result = new TestResult({
            userId,
            testType: testType || 'individual',
            skillResults,
            overallScore: totalScore,
            overallPercentage: overallPct,
            weakSkills,
            strongSkills,
            jobRecommendations: jobTitles,
            takenAt: new Date()
        });

        await result.save();

        res.json({
            result,
            eligibleJobs: eligible,
            partialJobs: partial,
            weakSkills,
            strongSkills,
            overallPercentage: overallPct,
            weakSkillRoadmaps: weakSkills.map(s => WEAK_SKILL_ROADMAP[s]).filter(Boolean)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /api/result/history ──────────────────────────────────────────────
exports.getHistory = async (req, res) => {
    try {
        const results = await TestResult.find({ userId: req.userId })
            .sort({ takenAt: -1 })
            .limit(10);
        res.json({ results });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /api/result/jobs ─────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
    res.json({ jobs: JOB_MAP });
};