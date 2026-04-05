import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../ThemeContext';
import Themetoggle from '../components/Themetoggle';

const TABS = ['📊 Dashboard', '❓ Questions', '👥 Students', '📈 Analytics'];

export default function AdminPanel() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [tab, setTab] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [students, setStudents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editQ, setEditQ] = useState(null);
    const [filterTopic, setFilterTopic] = useState('');
    const [msg, setMsg] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.88)';
    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
    const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';
    const inp = { padding: '10px 14px', borderRadius: 8, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.08)' : '#fff', color: text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };

    useEffect(() => { loadAll(); }, []);
    useEffect(() => { if (tab === 1) loadQuestions(); }, [tab, filterTopic]);

    async function loadAll() {
        setLoading(true);
        try {
            const [qRes, sRes, aRes] = await Promise.all([
                api.get('/admin/questions'),
                api.get('/admin/students'),
                api.get('/admin/analytics'),
            ]);
            setQuestions(qRes.data.questions);
            setStudents(sRes.data.students);
            setAnalytics(aRes.data);
        } catch (err) {
            if (err.response?.status === 403) navigate('/dashboard');
        } finally { setLoading(false); }
    }

    async function loadQuestions() {
        const params = filterTopic ? `?topic=${filterTopic}` : '';
        const { data } = await api.get(`/admin/questions${params}`);
        setQuestions(data.questions);
    }

    async function handleDelete(id) {
        if (!confirm('Delete this question?')) return;
        await api.delete(`/admin/questions/${id}`);
        showMsg('✅ Question deleted'); loadQuestions();
    }

    async function handleSave(formData) {
        try {
            if (editQ) { await api.put(`/admin/questions/${editQ._id}`, formData); showMsg('✅ Question updated'); }
            else { await api.post('/admin/questions', formData); showMsg('✅ Question created'); }
            setShowForm(false); setEditQ(null); loadQuestions();
        } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Error')); }
    }

    // ── CSV export using fetch with auth token ──────────────────────────────
    async function handleExportCSV() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/admin/export-csv', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) { showMsg('❌ Export failed'); return; }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'skillassess_results.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMsg('✅ CSV downloaded!');
        } catch (err) {
            showMsg('❌ Export failed: ' + err.message);
        }
    }

    function showMsg(m) { setMsg(m); setTimeout(() => setMsg(''), 3000); }
    const getColor = p => p >= 70 ? '#43e97b' : p >= 50 ? '#ffd93d' : '#ff6b6b';

    const filteredStudents = students.filter(s =>
        searchEmail ? s.email.toLowerCase().includes(searchEmail.toLowerCase()) : true
    );

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', fontWeight: 600 }}>ADMIN</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Themetoggle />
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Dashboard</button>
                    <button style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(67,233,123,0.4)', background: 'rgba(67,233,123,0.1)', color: '#43e97b', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        onClick={handleExportCSV}>⬇ Export CSV</button>
                </div>
            </nav>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 28px', borderBottom: `1px solid ${border}`, background: navBg, overflowX: 'auto' }}>
                {TABS.map((t, i) => (
                    <button key={i} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: tab === i ? 'rgba(102,126,234,0.25)' : 'transparent', color: tab === i ? '#667eea' : muted, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onClick={() => setTab(i)}>{t}</button>
                ))}
            </div>

            {msg && <div style={{ padding: '12px 28px', background: msg.startsWith('✅') ? 'rgba(67,233,123,0.1)' : 'rgba(255,107,107,0.1)', borderBottom: `1px solid ${border}`, fontSize: 14, color: msg.startsWith('✅') ? '#43e97b' : '#ff6b6b' }}>{msg}</div>}

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

                {/* ── Tab 0: Dashboard ── */}
                {tab === 0 && analytics && (
                    <div>
                        <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>Platform Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
                            {[
                                { label: 'Total Students', value: analytics.totalStudents, icon: '👥', color: '#667eea' },
                                { label: 'Total Tests Taken', value: analytics.totalTests, icon: '📝', color: '#f093fb' },
                                { label: 'Class Avg Score', value: `${analytics.avgOverall}%`, icon: '📊', color: '#4facfe' },
                                { label: 'Questions in DB', value: questions.length, icon: '❓', color: '#43e97b' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: 32, margin: '0 0 8px' }}>{s.icon}</p>
                                    <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
                                    <p style={{ margin: 0, fontSize: 13, color: muted }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 600 }}>Class Average by Skill</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginBottom: 28 }}>
                            {Object.entries(analytics.skillAvg || {}).map(([skill, avg]) => (
                                <div key={skill} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize', color: text }}>{skill}</span>
                                        <span style={{ fontWeight: 700, color: getColor(avg) }}>{avg}%</span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(128,128,128,0.15)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', borderRadius: 99, background: getColor(avg), width: `${avg}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 600 }}>Tests Taken — Last 7 Days</h3>
                        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                                {analytics.testsPerDay?.map((d, i) => {
                                    const maxCount = Math.max(...analytics.testsPerDay.map(x => x.count), 1);
                                    const h = Math.max((d.count / maxCount) * 100, 4);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 11, color: '#667eea', fontWeight: 700 }}>{d.count || ''}</span>
                                            <div style={{ width: '100%', background: 'linear-gradient(180deg,#667eea,#764ba2)', borderRadius: '4px 4px 0 0', height: `${h}%`, minHeight: 4 }} />
                                            <span style={{ fontSize: 10, color: muted, whiteSpace: 'nowrap' }}>{d.date?.slice(5)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab 1: Questions ── */}
                {tab === 1 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Questions ({questions.length})</h2>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <select style={{ ...inp, width: 'auto' }} value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
                                    <option value="">All Topics</option>
                                    {['aptitude', 'dsa', 'sql', 'networks'].map(t => <option key={t}>{t}</option>)}
                                </select>
                                <button style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}
                                    onClick={() => { setEditQ(null); setShowForm(true); }}>+ Add Question</button>
                            </div>
                        </div>

                        {showForm && <QuestionForm q={editQ} onSave={handleSave} onCancel={() => { setShowForm(false); setEditQ(null); }} isDark={isDark} text={text} muted={muted} border={border} inp={inp} />}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {questions.map(q => (
                                <div key={q._id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(102,126,234,0.2)', color: '#667eea', fontWeight: 600 }}>{q.topic}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: q.difficulty === 'easy' ? 'rgba(67,233,123,0.15)' : q.difficulty === 'medium' ? 'rgba(255,217,61,0.15)' : 'rgba(240,147,251,0.15)', color: q.difficulty === 'easy' ? '#43e97b' : q.difficulty === 'medium' ? '#ffd93d' : '#f093fb', fontWeight: 600 }}>{q.difficulty}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: muted }}>{q.type}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13, color: text, lineHeight: 1.5 }}>{q.question?.slice(0, 120)}...</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${border}`, background: 'transparent', color: '#4facfe', cursor: 'pointer', fontSize: 12, fontWeight: 600 }} onClick={() => { setEditQ(q); setShowForm(true); }}>Edit</button>
                                        <button style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }} onClick={() => handleDelete(q._id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 2: Students ── */}
                {tab === 2 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Students ({filteredStudents.length})</h2>
                            <input style={{ ...inp, width: 260 }} placeholder="🔍 Search by email..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: cardBg, borderRadius: 16, border: `1px solid ${border}` }}>
                                <p style={{ fontSize: 40, margin: '0 0 12px' }}>👥</p>
                                <p style={{ color: muted }}>No students found. Students will appear here after they register.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
                                    <thead>
                                        <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                                            {['#', 'Email', 'Tests Taken', 'Avg Score', 'Last Score', 'Streak 🔥', 'Strong Skills', 'Weak Skills', 'Joined'].map(h => (
                                                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: muted, fontWeight: 600, borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((s, i) => (
                                            <tr key={s._id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                                <td style={{ padding: '12px 14px', color: muted }}>{i + 1}</td>
                                                <td style={{ padding: '12px 14px', color: text, fontWeight: 500 }}>{s.email}</td>
                                                <td style={{ padding: '12px 14px', color: muted, textAlign: 'center' }}>
                                                    <span style={{ padding: '2px 10px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: text }}>{s.testsCount}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: getColor(s.avgScore), fontSize: 15 }}>{s.avgScore}%</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: getColor(s.lastScore) }}>{s.lastScore}%</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center', color: '#ffd93d', fontWeight: 700 }}>{s.streak} days</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    {s.strongSkills?.length > 0
                                                        ? s.strongSkills.map((sk, j) => <span key={j} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(67,233,123,0.15)', color: '#43e97b', marginRight: 4 }}>{sk}</span>)
                                                        : <span style={{ color: muted, fontSize: 12 }}>—</span>}
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    {s.weakSkills?.length > 0
                                                        ? s.weakSkills.map((sk, j) => <span key={j} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', marginRight: 4 }}>{sk}</span>)
                                                        : <span style={{ color: '#43e97b', fontSize: 12 }}>✓ No weak skills</span>}
                                                </td>
                                                <td style={{ padding: '12px 14px', color: muted, fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(s.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab 3: Analytics ── */}
                {tab === 3 && analytics && (
                    <div>
                        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Question Analytics</h2>
                        <p style={{ color: muted, marginBottom: 20, fontSize: 14 }}>Based on student difficulty ratings — sorted by hardest first</p>
                        {(!analytics.questionRatings || analytics.questionRatings.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: cardBg, borderRadius: 16, border: `1px solid ${border}` }}>
                                <p style={{ fontSize: 40, margin: '0 0 12px' }}>📊</p>
                                <p style={{ color: muted }}>No ratings yet. Students will rate questions after answering them.</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {analytics.questionRatings?.map((q) => (
                                <div key={q.questionId} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(102,126,234,0.2)', color: '#667eea', fontWeight: 600 }}>{q.topic}</span>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: muted }}>{q.difficulty}</span>
                                        <span style={{ fontSize: 11, color: muted }}>({q.total} ratings)</span>
                                    </div>
                                    <p style={{ margin: '0 0 12px', fontSize: 13, color: text }}>{q.question}</p>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        {[['😴 Too Easy', 'too_easy', '#43e97b'], ['👌 Just Right', 'just_right', '#4facfe'], ['🔥 Too Hard', 'too_hard', '#f093fb']].map(([label, key, color]) => (
                                            <div key={key} style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <span style={{ fontSize: 12, color: muted }}>{label}</span>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{q[key]} ({q.total > 0 ? Math.round((q[key] / q.total) * 100) : 0}%)</span>
                                                </div>
                                                <div style={{ height: 6, background: 'rgba(128,128,128,0.15)', borderRadius: 99 }}>
                                                    <div style={{ height: '100%', borderRadius: 99, background: color, width: `${q.total > 0 ? (q[key] / q.total) * 100 : 0}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function QuestionForm({ q, onSave, onCancel, isDark, text, muted, border, inp }) {
    const [form, setForm] = useState({
        topic: q?.topic || 'aptitude', type: q?.type || 'mcq', difficulty: q?.difficulty || 'easy',
        question: q?.question || '', options: q?.options?.join('\n') || '', correctAnswer: q?.correctAnswer || '',
        starterCode: q?.starterCode || '', explanation: q?.explanation || '',
    });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    function handleSubmit(e) {
        e.preventDefault();
        const data = { ...form };
        if (form.type === 'mcq') data.options = form.options.split('\n').map(o => o.trim()).filter(Boolean);
        onSave(data);
    }

    return (
        <form onSubmit={handleSubmit} style={{ background: isDark ? 'rgba(102,126,234,0.1)' : 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 14, padding: '22px', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: text }}>{q ? 'Edit Question' : 'Add New Question'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div><label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Topic</label>
                    <select style={{ ...inp, width: 'auto' }} value={form.topic} onChange={e => set('topic', e.target.value)}>
                        {['aptitude', 'dsa', 'sql', 'networks'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                <div><label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Type</label>
                    <select style={{ ...inp, width: 'auto' }} value={form.type} onChange={e => set('type', e.target.value)}>
                        {['mcq', 'code', 'sql'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                <div><label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Difficulty</label>
                    <select style={{ ...inp, width: 'auto' }} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                        {['easy', 'medium', 'hard'].map(d => <option key={d}>{d}</option>)}
                    </select></div>
            </div>
            <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Question</label>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.question} onChange={e => set('question', e.target.value)} required />
            </div>
            {form.type === 'mcq' && <>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Options (one per line)</label>
                    <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.options} onChange={e => set('options', e.target.value)} />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Correct Answer</label>
                    <input style={inp} value={form.correctAnswer} onChange={e => set('correctAnswer', e.target.value)} />
                </div>
            </>}
            {(form.type === 'code' || form.type === 'sql') && (
                <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Starter Code / Table Setup</label>
                    <textarea style={{ ...inp, minHeight: 100, fontFamily: 'monospace', resize: 'vertical' }} value={form.starterCode} onChange={e => set('starterCode', e.target.value)} />
                </div>
            )}
            <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: muted, display: 'block', marginBottom: 4 }}>Explanation</label>
                <input style={inp} value={form.explanation} onChange={e => set('explanation', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>{q ? 'Update' : 'Create'}</button>
                <button type="button" style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: text, cursor: 'pointer', fontSize: 14 }} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

const gBtn = (isDark, text) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });