import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../ThemeContext';

export default function History() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)';
    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
    const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';

    useEffect(() => {
        api.get('/result/history').then(r => setHistory(r.data.results)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const getColor = p => p >= 70 ? '#43e97b' : p >= 50 ? '#ffd93d' : '#ff6b6b';
    const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)' }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
                <div style={{ display: 'flex', gap: 10 }}>
                    <ThemeToggle />
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: text }}>📋 Test History</h1>
                <p style={{ margin: '0 0 28px', color: muted, fontSize: 14 }}>Your last 10 assessment sessions</p>

                {loading && <p style={{ color: muted, textAlign: 'center', marginTop: 60 }}>Loading...</p>}

                {!loading && history.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 40px', background: cardBg, borderRadius: 20, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <p style={{ fontSize: 48, margin: 0 }}>📭</p>
                        <p style={{ margin: 0, fontSize: 16, color: muted }}>No tests taken yet. Start your first assessment!</p>
                        <button style={{ padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 14, fontWeight: 600 }}
                            onClick={() => navigate('/dashboard')}>Start Assessment →</button>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {history.map((result, i) => (
                        <div key={result._id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(102,126,234,0.2)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                        #{history.length - i}
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 6px', fontSize: 13, color: muted }}>{fmt(result.takenAt)}</p>
                                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: result.testType === 'placement' ? 'rgba(255,200,50,0.15)' : 'rgba(102,126,234,0.15)', color: result.testType === 'placement' ? '#d4a017' : '#667eea' }}>
                                            {result.testType === 'placement' ? '🎯 Placement Mock' : '📝 Individual Test'}
                                        </span>
                                    </div>
                                </div>
                                <svg viewBox="0 0 80 80" width={70} height={70}>
                                    <circle cx={40} cy={40} r={32} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth={7} />
                                    <circle cx={40} cy={40} r={32} fill="none" stroke={getColor(result.overallPercentage)} strokeWidth={7}
                                        strokeDasharray={`${result.overallPercentage * 2.01} 201`} strokeLinecap="round" transform="rotate(-90 40 40)" />
                                    <text x={40} y={45} textAnchor="middle" fill={text} fontSize={15} fontWeight={700}>{result.overallPercentage}%</text>
                                </svg>
                            </div>

                            {/* Skill bars */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                {result.skillResults?.map((sr, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, width: 76, color: muted, flexShrink: 0 }}>{sr.topic.toUpperCase()}</span>
                                        <div style={{ flex: 1, height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 99, background: getColor(sr.percentage), width: `${sr.percentage}%` }} />
                                        </div>
                                        <span style={{ color: getColor(sr.percentage), fontSize: 12, fontWeight: 700, width: 36, textAlign: 'right' }}>{sr.percentage}%</span>
                                        <span style={{ fontSize: 10, color: muted, width: 40 }}>{sr.difficulty}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                {result.strongSkills?.length > 0 && <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(67,233,123,0.12)', color: '#43e97b' }}>💪 Strong: {result.strongSkills.join(', ')}</span>}
                                {result.weakSkills?.length > 0 && <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }}>⚠️ Weak: {result.weakSkills.join(', ')}</span>}
                            </div>

                            {result.jobRecommendations?.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: muted }}>🎯 Eligible for:</span>
                                    {result.jobRecommendations.slice(0, 3).map((job, k) => (
                                        <span key={k} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', color: muted }}>{job}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const gBtn = (isDark, text) => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });