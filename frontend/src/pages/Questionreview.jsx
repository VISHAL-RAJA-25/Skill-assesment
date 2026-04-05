import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Themetoggle from '../Components/Themetoggle';

const SKILL_META = {
    aptitude: { label: 'Aptitude', icon: '🧮', color: '#667eea' },
    dsa: { label: 'DSA', icon: '💻', color: '#f093fb' },
    sql: { label: 'SQL', icon: '🗄️', color: '#4facfe' },
    networks: { label: 'Networks', icon: '🌐', color: '#43e97b' },
};

export default function QuestionReview() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const history = state?.reviewHistory || [];

    const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
    const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';

    const correct = history.filter(h => h.correct).length;
    const total = history.length;

    return (
        <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)' }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Themetoggle />
                    <button style={gBtn(isDark, text)} onClick={() => navigate(-1)}>← Back to Results</button>
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700 }}>📝 Question Review</h1>
                    <p style={{ margin: 0, color: muted, fontSize: 14 }}>
                        You got <strong style={{ color: '#43e97b' }}>{correct}</strong> out of <strong>{total}</strong> questions correct
                    </p>
                </div>

                {history.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: cardBg, borderRadius: 16, border: `1px solid ${border}` }}>
                        <p style={{ fontSize: 40, margin: '0 0 12px' }}>📭</p>
                        <p style={{ color: muted }}>No review data available.</p>
                    </div>
                )}

                {/* Question cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {history.map((item, i) => {
                        const meta = SKILL_META[item.topic] || { label: item.topic, icon: '📌', color: '#fff' };
                        const isMCQ = item.type === 'mcq';

                        return (
                            <div key={i} style={{ background: cardBg, border: `1.5px solid ${item.correct ? 'rgba(67,233,123,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 16, overflow: 'hidden' }}>

                                {/* Card header */}
                                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: item.correct ? 'rgba(67,233,123,0.06)' : 'rgba(255,107,107,0.06)' }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 22 }}>{item.correct ? '✅' : '❌'}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: text }}>Question {i + 1}</span>
                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${meta.color}22`, color: meta.color, fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                                        {item.hintUsed && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,200,50,0.15)', color: '#d4a017', fontWeight: 600 }}>💡 Hint used</span>}
                                        {item.timedOut && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', fontWeight: 600 }}>⏱ Timed out</span>}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: item.correct ? '#43e97b' : '#ff6b6b' }}>
                                        {item.correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>

                                <div style={{ padding: '20px' }}>
                                    {/* Question text */}
                                    <pre style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Segoe UI',sans-serif", color: text }}>{item.question}</pre>

                                    {/* MCQ answer comparison */}
                                    {isMCQ && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                                                <span style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>Your answer:</span>
                                                <span style={{ fontSize: 14, color: text }}>{item.userAnswer || '(No answer — timed out)'}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 10, background: 'rgba(67,233,123,0.08)', border: '1px solid rgba(67,233,123,0.2)' }}>
                                                <span style={{ color: '#43e97b', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>Correct answer:</span>
                                                <span style={{ fontSize: 14, color: text }}>{item.correctAnswer}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* SQL / DSA: show user's code */}
                                    {!isMCQ && item.userAnswer && (
                                        <div style={{ marginBottom: 16 }}>
                                            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your code/query:</p>
                                            <pre style={{ margin: 0, padding: '12px 14px', background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)', borderRadius: 10, fontSize: 13, fontFamily: 'monospace', color: isDark ? '#e0e0e0' : '#1a1a2e', overflowX: 'auto', border: `1px solid ${border}`, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                {item.userAnswer}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {item.explanation && (
                                        <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(102,126,234,0.08)' : 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.2)', marginBottom: item.aiEvaluation ? 12 : 0 }}>
                                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>💡 Explanation</p>
                                            <p style={{ margin: 0, fontSize: 13, color: text, lineHeight: 1.6 }}>{item.explanation}</p>
                                        </div>
                                    )}

                                    {/* AI Evaluation */}
                                    {item.aiEvaluation?.usedAI && (
                                        <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(102,126,234,0.08)' : 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.2)', marginTop: 12 }}>
                                            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#667eea', textTransform: 'uppercase', letterSpacing: 0.5 }}>🤖 AI Evaluation</p>
                                            {item.aiEvaluation.feedback && <p style={{ margin: '0 0 4px', fontSize: 13, color: text, lineHeight: 1.6 }}>{item.aiEvaluation.feedback}</p>}
                                            {item.aiEvaluation.suggestion && <p style={{ margin: 0, fontSize: 13, color: '#ffd93d' }}>💡 {item.aiEvaluation.suggestion}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center', marginTop: 36, paddingBottom: 48 }}>
                    <button style={{ padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 15, fontWeight: 600 }}
                        onClick={() => navigate('/dashboard')}>
                        Practice More →
                    </button>
                </div>
            </div>
        </div>
    );
}

const gBtn = (isDark, text) => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });