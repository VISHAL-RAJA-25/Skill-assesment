import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const SKILLS = [
    { key: 'overall', label: 'Overall', color: '#667eea' },
    { key: 'aptitude', label: 'Aptitude', color: '#ffd93d' },
    { key: 'dsa', label: 'DSA', color: '#f093fb' },
    { key: 'sql', label: 'SQL', color: '#4facfe' },
    { key: 'networks', label: 'Networks', color: '#43e97b' },
];

export default function Progress() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSkills, setActiveSkills] = useState(['overall', 'dsa', 'sql']);

    const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
    const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';

    useEffect(() => {
        api.get('/admin/my-progress')
            .then(r => setData(r.data.progress || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleSkill = (key) => setActiveSkills(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

    const W = 680, H = 280, PAD = { top: 20, right: 20, bottom: 40, left: 44 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const getX = i => PAD.left + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const getY = v => PAD.top + chartH - (v / 100) * chartH;
    const makePath = key => {
        const pts = data.map((d, i) => d[key] != null ? `${getX(i)},${getY(d[key])}` : null).filter(Boolean);
        return pts.length >= 2 ? 'M ' + pts.join(' L ') : null;
    };
    const getColor = p => p >= 70 ? '#43e97b' : p >= 50 ? '#ffd93d' : '#ff6b6b';
    const latest = data[data.length - 1] || {};
    const first = data[0] || {};

    return (
        <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)' }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
                <div style={{ display: 'flex', gap: 10 }}>
                    <ThemeToggle />
                    <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Dashboard</button>
                </div>
            </nav>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700 }}>📈 My Progress</h1>
                <p style={{ margin: '0 0 28px', color: muted, fontSize: 14 }}>Your skill scores across {data.length} test sessions</p>

                {loading && <p style={{ color: muted, textAlign: 'center', marginTop: 60 }}>Loading...</p>}

                {!loading && data.length === 0 && (
                    <div style={{ textAlign: 'center', background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '60px 32px' }}>
                        <p style={{ fontSize: 48, margin: '0 0 12px' }}>📊</p>
                        <p style={{ color: text, fontSize: 16, margin: '0 0 8px' }}>No progress data yet</p>
                        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>Take some tests to see your improvement over time!</p>
                        <button style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Start Practicing →</button>
                    </div>
                )}

                {!loading && data.length > 0 && (
                    <>
                        {/* Toggle buttons */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {SKILLS.map(s => (
                                <button key={s.key}
                                    style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${activeSkills.includes(s.key) ? s.color : border}`, background: activeSkills.includes(s.key) ? `${s.color}22` : 'transparent', color: activeSkills.includes(s.key) ? s.color : muted, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}
                                    onClick={() => toggleSkill(s.key)}>{s.label}</button>
                            ))}
                        </div>

                        {/* SVG Chart */}
                        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '20px', marginBottom: 24, overflowX: 'auto' }}>
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 320 }}>
                                {[0, 25, 50, 75, 100].map(v => (
                                    <g key={v}>
                                        <line x1={PAD.left} y1={getY(v)} x2={W - PAD.right} y2={getY(v)} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />
                                        <text x={PAD.left - 6} y={getY(v) + 4} textAnchor="end" fontSize={10} fill={muted}>{v}%</text>
                                    </g>
                                ))}
                                {data.map((d, i) => (
                                    <text key={i} x={getX(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={muted}>{d.date?.slice(5)}</text>
                                ))}
                                {SKILLS.filter(s => activeSkills.includes(s.key)).map(s => {
                                    const pathD = makePath(s.key);
                                    if (!pathD) return null;
                                    return (
                                        <g key={s.key}>
                                            <path d={pathD} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                            {data.map((d, i) => d[s.key] != null && (
                                                <circle key={i} cx={getX(i)} cy={getY(d[s.key])} r={4} fill={s.color} stroke={isDark ? '#0f0c29' : '#fff'} strokeWidth={2} />
                                            ))}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
                            {SKILLS.filter(s => s.key !== 'overall').map(s => {
                                const cur = latest[s.key], prev = first[s.key];
                                const diff = cur != null && prev != null ? cur - prev : null;
                                if (cur == null) return null;
                                return (
                                    <div key={s.key} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 12, color: muted }}>{s.label}</p>
                                        <p style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: getColor(cur) }}>{cur}%</p>
                                        {diff != null && <p style={{ margin: 0, fontSize: 12, color: diff > 0 ? '#43e97b' : diff < 0 ? '#ff6b6b' : muted }}>{diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff)}% since start</p>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Table */}
                        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>All Test Sessions</h3>
                        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                                        {['Date', 'Type', 'Overall', 'Aptitude', 'DSA', 'SQL', 'Networks'].map(h => (
                                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: muted, fontWeight: 600, borderBottom: `1px solid ${border}` }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...data].reverse().map((d, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                                            <td style={{ padding: '10px 14px', color: text }}>{d.date}</td>
                                            <td style={{ padding: '10px 14px', color: muted, fontSize: 12 }}>{d.testType}</td>
                                            {['overall', 'aptitude', 'dsa', 'sql', 'networks'].map(k => (
                                                <td key={k} style={{ padding: '10px 14px' }}>
                                                    {d[k] != null ? <span style={{ color: getColor(d[k]), fontWeight: 600 }}>{d[k]}%</span> : <span style={{ color: muted }}>—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const gBtn = (isDark, text) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });