import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const SKILL_META = {
    aptitude: { label: 'Aptitude', icon: '🧮', color: '#667eea' },
    dsa: { label: 'DSA', icon: '💻', color: '#f093fb' },
    sql: { label: 'SQL', icon: '🗄️', color: '#4facfe' },
    networks: { label: 'Networks', icon: '🌐', color: '#43e97b' },
};

const JOB_MAP = [
    { title: 'Backend Software Engineer', icon: '⚙️', companies: ['Amazon', 'Flipkart', 'TCS', 'Infosys', 'Wipro'], strongSkill: 'dsa', requiredSkills: { dsa: 70, aptitude: 60 }, description: 'Build server-side systems, APIs and microservices.', roadmap: [{ label: 'NeetCode DSA Roadmap', url: 'https://neetcode.io/roadmap' }, { label: 'Backend Developer Roadmap', url: 'https://roadmap.sh/backend' }] },
    { title: 'Database Developer / DBA', icon: '🗄️', companies: ['Oracle', 'IBM', 'Accenture', 'Capgemini'], strongSkill: 'sql', requiredSkills: { sql: 70, aptitude: 50 }, description: 'Design, maintain and optimise relational databases.', roadmap: [{ label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' }, { label: 'SQLZoo Practice', url: 'https://sqlzoo.net/' }] },
    { title: 'Data Analyst', icon: '📊', companies: ['Mu Sigma', 'Fractal Analytics', 'Amazon', 'Walmart Labs'], strongSkill: 'sql', requiredSkills: { sql: 65, aptitude: 65 }, description: 'Analyse business data and generate insights using SQL and statistics.', roadmap: [{ label: 'Google Data Analytics Certificate', url: 'https://grow.google/certificates/data-analytics/' }] },
    { title: 'Network / Systems Engineer', icon: '🌐', companies: ['Cisco', 'Juniper', 'HCL', 'Tech Mahindra'], strongSkill: 'networks', requiredSkills: { networks: 70, aptitude: 55 }, description: 'Design and maintain computer networks and infrastructure.', roadmap: [{ label: 'Cisco Networking Academy', url: 'https://www.netacad.com/' }, { label: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network' }] },
    { title: 'DevOps / Cloud Engineer', icon: '☁️', companies: ['AWS', 'Google Cloud', 'Microsoft', 'Deloitte'], strongSkill: 'networks', requiredSkills: { networks: 65, dsa: 50 }, description: 'Automate deployments, manage cloud infrastructure and CI/CD pipelines.', roadmap: [{ label: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' }] },
    { title: 'Full Stack Developer', icon: '🖥️', companies: ['Zoho', 'Freshworks', 'Razorpay', 'Swiggy'], strongSkill: null, requiredSkills: { dsa: 60, sql: 55, networks: 50 }, description: 'Build end-to-end web applications — frontend, backend and databases.', roadmap: [{ label: 'Full Stack Roadmap', url: 'https://roadmap.sh/full-stack' }, { label: 'The Odin Project', url: 'https://www.theodinproject.com/' }] },
    { title: 'Campus Placement (General IT)', icon: '🎓', companies: ['TCS', 'Infosys', 'Cognizant', 'Wipro', 'HCL'], strongSkill: 'aptitude', requiredSkills: { aptitude: 50 }, description: 'Qualify for mass campus recruitment drives at top IT service companies.', roadmap: [{ label: 'IndiaBIX Aptitude', url: 'https://www.indiabix.com/' }, { label: 'GeeksForGeeks Placement Prep', url: 'https://www.geeksforgeeks.org/placement-preparation/' }] },
];

const WEAK_ROADMAP = {
    aptitude: { tips: 'Practice 20 questions daily. Focus on percentages, ratios, time & work.', resources: [{ label: 'IndiaBIX — All Aptitude Topics', url: 'https://www.indiabix.com/' }, { label: 'RS Aggarwal Quantitative Aptitude', url: 'https://www.geeksforgeeks.org/quantitative-aptitude/' }] },
    dsa: { tips: 'Master Arrays and Strings first. Then LinkedList, Trees, then DP.', resources: [{ label: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap' }, { label: 'Striver DSA Sheet', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' }, { label: 'LeetCode 75', url: 'https://leetcode.com/studyplan/leetcode-75/' }] },
    sql: { tips: 'Practice JOINs, GROUP BY, subqueries and window functions every day.', resources: [{ label: 'SQLZoo', url: 'https://sqlzoo.net/' }, { label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' }, { label: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/' }] },
    networks: { tips: 'Understand OSI model, TCP/IP, DNS, subnetting and routing protocols.', resources: [{ label: 'Cisco NetAcad', url: 'https://www.netacad.com/' }, { label: 'Gate Smashers Networks', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' }, { label: 'GFG Computer Networks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/' }] },
};

function computeJobs(skillPercentages) {
    const eligible = [], partial = [];
    for (const job of JOB_MAP) {
        const entries = Object.entries(job.requiredSkills);
        const metCount = entries.filter(([s, min]) => (skillPercentages[s] || 0) >= min).length;
        if (metCount === entries.length) eligible.push(job);
        else if (metCount > 0) {
            const missing = entries.filter(([s, min]) => (skillPercentages[s] || 0) < min).map(([s]) => s);
            partial.push({ ...job, matchPct: Math.round((metCount / entries.length) * 100), missing });
        }
    }
    return { eligible, partial };
}

export default function Results() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [saving, setSaving] = useState(true);
    const [saveErr, setSaveErr] = useState('');

    const skillResults = state?.skillResults || [];
    const testType = state?.testType || 'individual';
    const reviewHistory = state?.reviewHistory || [];

    const skillPercentages = {};
    skillResults.forEach(s => { skillPercentages[s.topic] = s.percentage; });
    const strongSkills = skillResults.filter(s => s.percentage >= 70).map(s => s.topic);
    const weakSkills = skillResults.filter(s => s.percentage < 50).map(s => s.topic);
    const overall = skillResults.length ? Math.round(skillResults.reduce((a, b) => a + b.percentage, 0) / skillResults.length) : 0;
    const { eligible, partial } = computeJobs(skillPercentages);

    const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
    const border = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
    const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';

    useEffect(() => {
        api.post('/result/save', { skillResults, testType })
            .catch(() => setSaveErr('Result not saved to history.'))
            .finally(() => setSaving(false));
    }, []);

    const getColor = p => p >= 70 ? '#43e97b' : p >= 50 ? '#ffd93d' : '#ff6b6b';
    const getLabel = p => p >= 70 ? '💪 Strong' : p >= 50 ? '📈 Average' : '⚠️ Weak';

    return (
        <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)' }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
                <div style={{ display: 'flex', gap: 10 }}>
                    <ThemeToggle />
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/history')}>📋 History</button>
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>{testType === 'placement' ? '🎯 Placement Mock Test Results' : '📊 Skill Assessment Results'}</h1>
                    <p style={{ margin: 0, color: muted, fontSize: 13 }}>Full breakdown of your performance and personalised career recommendations</p>
                    {saveErr && <p style={{ color: '#ffd93d', fontSize: 12, marginTop: 4 }}>⚠️ {saveErr}</p>}
                </div>

                {/* Overall score */}
                <div style={{ display: 'flex', gap: 28, alignItems: 'center', background: cardBg, borderRadius: 20, padding: '24px 28px', marginBottom: 28, border: `1px solid ${border}`, flexWrap: 'wrap' }}>
                    <svg viewBox="0 0 120 120" width={110} height={110} style={{ flexShrink: 0 }}>
                        <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth={10} />
                        <circle cx={60} cy={60} r={50} fill="none" stroke={getColor(overall)} strokeWidth={10} strokeDasharray={`${overall * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <text x={60} y={56} textAnchor="middle" fill={text} fontSize={22} fontWeight={700}>{overall}%</text>
                        <text x={60} y={73} textAnchor="middle" fill={muted} fontSize={11}>Overall</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            {strongSkills.length > 0 && <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.2)', borderRadius: 12, padding: '12px 16px' }}><span style={{ fontSize: 18 }}>💪</span><div><p style={{ margin: 0, fontSize: 10, color: '#43e97b', fontWeight: 700, letterSpacing: 0.8 }}>STRONG SKILLS</p><p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: text }}>{strongSkills.map(s => SKILL_META[s]?.label).join(', ')}</p></div></div>}
                            {weakSkills.length > 0 && <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 12, padding: '12px 16px' }}><span style={{ fontSize: 18 }}>⚠️</span><div><p style={{ margin: 0, fontSize: 10, color: '#ff6b6b', fontWeight: 700, letterSpacing: 0.8 }}>WEAK SKILLS</p><p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: text }}>{weakSkills.map(s => SKILL_META[s]?.label).join(', ')}</p></div></div>}
                            {weakSkills.length === 0 && strongSkills.length > 0 && <p style={{ color: '#43e97b', fontSize: 14, margin: 0 }}>🎉 No weak skills! You are well-rounded.</p>}
                        </div>
                    </div>
                </div>

                {/* ── Sprint 4: Review button ── */}
                {reviewHistory.length > 0 && (
                    <div style={{ marginBottom: 28, background: isDark ? 'rgba(102,126,234,0.08)' : 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: 16, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: text }}>📝 Review Your Answers</p>
                            <p style={{ margin: 0, fontSize: 13, color: muted }}>See every question, your answer vs correct answer, and AI feedback</p>
                        </div>
                        <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}
                            onClick={() => navigate('/review', { state: { reviewHistory } })}>
                            Review {reviewHistory.length} Questions →
                        </button>
                    </div>
                )}

                {/* Skill breakdown */}
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, paddingLeft: 14, borderLeft: '3px solid #667eea' }}>Skill Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginTop: 16 }}>
                        {skillResults.map((sr, i) => {
                            const meta = SKILL_META[sr.topic] || { label: sr.topic, icon: '📌', color: '#fff' };
                            return (
                                <div key={i} style={{ background: cardBg, borderRadius: 14, padding: 18, border: `1px solid ${meta.color}33` }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 26 }}>{meta.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: text }}>{meta.label}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: muted }}>{sr.difficulty} • {sr.score}/{sr.total} correct</p>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${getColor(sr.percentage)}22`, color: getColor(sr.percentage) }}>{getLabel(sr.percentage)}</span>
                                    </div>
                                    <div style={{ height: 8, background: 'rgba(128,128,128,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                                        <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${meta.color},${getColor(sr.percentage)})`, width: `${sr.percentage}%`, transition: 'width 1s ease' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: muted }}>0%</span>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: getColor(sr.percentage) }}>{sr.percentage}%</span>
                                        <span style={{ fontSize: 12, color: muted }}>100%</span>
                                    </div>
                                    <div style={{ borderRadius: 8, padding: '8px 10px', background: sr.percentage >= 70 ? 'rgba(67,233,123,0.07)' : sr.percentage < 50 ? 'rgba(255,107,107,0.07)' : 'rgba(255,217,61,0.07)' }}>
                                        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: getColor(sr.percentage) }}>
                                            {sr.topic === 'sql' && sr.percentage >= 70 && '✅ Strong SQL → Great fit for Database Developer, Data Analyst roles.'}
                                            {sr.topic === 'sql' && sr.percentage >= 50 && sr.percentage < 70 && '📈 Average SQL → Practice JOINs and window functions to qualify for DB roles.'}
                                            {sr.topic === 'sql' && sr.percentage < 50 && '⚠️ Weak SQL → Focus on SELECT, WHERE, GROUP BY and JOINs first.'}
                                            {sr.topic === 'dsa' && sr.percentage >= 70 && '✅ Strong DSA → Great fit for Software Engineer, Backend Developer roles.'}
                                            {sr.topic === 'dsa' && sr.percentage >= 50 && sr.percentage < 70 && '📈 Average DSA → Practice Arrays and Hash Maps to reach Engineer level.'}
                                            {sr.topic === 'dsa' && sr.percentage < 50 && '⚠️ Weak DSA → Start with Arrays and Strings on LeetCode, then Trees.'}
                                            {sr.topic === 'networks' && sr.percentage >= 70 && '✅ Strong Networks → Great fit for Network Engineer, DevOps, Cloud roles.'}
                                            {sr.topic === 'networks' && sr.percentage >= 50 && sr.percentage < 70 && '📈 Average Networks → Deep dive into subnetting and routing protocols.'}
                                            {sr.topic === 'networks' && sr.percentage < 50 && '⚠️ Weak Networks → Study OSI model, TCP/IP, DNS and subnetting basics.'}
                                            {sr.topic === 'aptitude' && sr.percentage >= 70 && '✅ Strong Aptitude → You qualify for most campus placement drives.'}
                                            {sr.topic === 'aptitude' && sr.percentage >= 50 && sr.percentage < 70 && '📈 Average Aptitude → Improve speed on percentages and time & work.'}
                                            {sr.topic === 'aptitude' && sr.percentage < 50 && '⚠️ Weak Aptitude → Practice daily on IndiaBIX to clear campus cutoffs.'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Eligible jobs */}
                {eligible.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingLeft: 14, borderLeft: '3px solid #667eea' }}>🎯 Jobs You Are Eligible For</h3>
                        <p style={{ fontSize: 13, color: muted, marginBottom: 16, paddingLeft: 14 }}>You meet the skill thresholds for these roles right now</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {eligible.map((job, i) => (
                                <div key={i} style={{ background: cardBg, border: '1px solid rgba(102,126,234,0.25)', borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: 16, flex: 1, minWidth: 240 }}>
                                        <span style={{ fontSize: 34 }}>{job.icon}</span>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: 17, color: text }}>{job.title}</h4>
                                            <p style={{ margin: '0 0 10px', fontSize: 13, color: muted }}>{job.description}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                <span style={{ fontSize: 11, color: muted }}>Companies:</span>
                                                {job.companies?.map((c, ci) => <span key={ci} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: muted }}>{c}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Required skills</p>
                                        {Object.entries(job.requiredSkills).map(([skill, min]) => {
                                            const actual = skillPercentages[skill] || 0;
                                            const met = actual >= min;
                                            return (
                                                <div key={skill} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                                    <span style={{ color: met ? '#43e97b' : '#ff6b6b', fontSize: 14 }}>{met ? '✓' : '✗'}</span>
                                                    <span style={{ fontSize: 13, color: text }}>{SKILL_META[skill]?.label || skill}</span>
                                                    <span style={{ fontSize: 12, color: muted, marginLeft: 'auto' }}>{actual}% / {min}% needed</span>
                                                </div>
                                            );
                                        })}
                                        <div style={{ marginTop: 10 }}>
                                            {job.roadmap.map((r, ri) => <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#7fdbff', textDecoration: 'none', marginBottom: 4 }}>↗ {r.label}</a>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Partial jobs */}
                {partial.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingLeft: 14, borderLeft: '3px solid #667eea' }}>📈 Almost There — Improve to Qualify</h3>
                        <p style={{ fontSize: 13, color: muted, marginBottom: 16, paddingLeft: 14 }}>Strengthen these skills to unlock more job roles</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                            {partial.slice(0, 4).map((job, i) => (
                                <div key={i} style={{ background: isDark ? 'rgba(255,200,50,0.05)' : 'rgba(255,200,50,0.08)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 14, padding: 16 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                                        <span style={{ fontSize: 24 }}>{job.icon}</span>
                                        <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: text }}>{job.title}</p><p style={{ margin: 0, fontSize: 12, color: muted }}>{job.matchPct}% match</p></div>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(128,128,128,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                                        <div style={{ height: '100%', background: 'linear-gradient(90deg,#ffd93d,#f6a623)', borderRadius: 99, width: `${job.matchPct}%` }} />
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: '#ffd93d' }}>Improve: {job.missing?.map(s => SKILL_META[s]?.label || s).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {eligible.length === 0 && (
                    <div style={{ textAlign: 'center', background: cardBg, border: `1px solid ${border}`, borderRadius: 18, padding: '36px 28px', marginBottom: 32 }}>
                        <p style={{ fontSize: 36, margin: '0 0 12px' }}>🚀</p>
                        <h3 style={{ margin: '0 0 8px', fontSize: 18, color: text }}>Keep Practicing!</h3>
                        <p style={{ margin: 0, color: muted, fontSize: 14, lineHeight: 1.6 }}>You haven't hit the threshold for specific job roles yet. Work on your weak skills and retake the test.</p>
                    </div>
                )}

                {/* Weak skill roadmaps */}
                {weakSkills.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingLeft: 14, borderLeft: '3px solid #667eea' }}>📚 Study Roadmap for Weak Skills</h3>
                        <p style={{ fontSize: 13, color: muted, marginBottom: 16, paddingLeft: 14 }}>Follow these resources to improve and unlock more job opportunities</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                            {weakSkills.map(skill => {
                                const meta = SKILL_META[skill];
                                const rm = WEAK_ROADMAP[skill];
                                if (!rm) return null;
                                return (
                                    <div key={skill} style={{ background: isDark ? 'rgba(255,200,50,0.06)' : 'rgba(255,200,50,0.08)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                                            <span style={{ fontSize: 24 }}>{meta?.icon}</span>
                                            <div><p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#ffd93d' }}>{meta?.label}</p><p style={{ margin: 0, fontSize: 12, color: muted, lineHeight: 1.5 }}>{rm.tips}</p></div>
                                        </div>
                                        {rm.resources.map((r, ri) => <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#7fdbff', textDecoration: 'none', marginBottom: 4 }}>↗ {r.label}</a>)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', paddingBottom: 48, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button style={{ padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 15, fontWeight: 600 }} onClick={() => navigate('/dashboard')}>Practice More Skills →</button>
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/test/placement/medium')}>🔄 Retake Mock Test</button>
                    {reviewHistory.length > 0 && <button style={gBtn(isDark, text)} onClick={() => navigate('/review', { state: { reviewHistory } })}>📝 Review Answers</button>}
                </div>
            </div>
        </div>
    );
}

const gBtn = (isDark, text) => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });