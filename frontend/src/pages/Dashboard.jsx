import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Themetoggle from '../components/Themetoggle';
import Streakwidget from '../components/Streakwidget';
import { useTheme } from '../ThemeContext';

const SKILLS = [
  { id: 'aptitude', label: 'Aptitude', icon: '🧮', desc: 'Quantitative, logical & verbal reasoning', type: 'mcq', color: '#667eea' },
  { id: 'dsa', label: 'DSA', icon: '💻', desc: 'Write code to solve algorithmic problems', type: 'code', color: '#f093fb' },
  { id: 'sql', label: 'SQL', icon: '🗄️', desc: 'Write SQL queries against live test databases', type: 'sql', color: '#4facfe' },
  { id: 'networks', label: 'Networks', icon: '🌐', desc: 'OSI, TCP/IP, protocols & networking', type: 'mcq', color: '#43e97b' },
];
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', emoji: '🟢', color: '#43e97b', desc: 'Basic concepts' },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: '#ffd93d', desc: 'Moderate challenge' },
  { id: 'hard', label: 'Hard', emoji: '🔴', color: '#f093fb', desc: 'Advanced problems' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const email = localStorage.getItem('email') || 'User';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)';
  const border = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.1)';
  const text = isDark ? '#fff' : '#1a1a2e';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';
  const navBdr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Segoe UI',sans-serif", color: text }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${navBdr}`, background: navBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>⚡ SkillAssess</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Themetoggle />
          <button style={gBtn(isDark, text)} onClick={() => navigate('/progress')}>📈 Progress</button>
          <button style={gBtn(isDark, text)} onClick={() => navigate('/history')}>📋 History</button>
          {isAdmin && <button style={{ ...gBtn(isDark, text), color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }} onClick={() => navigate('/admin')}>🛡 Admin</button>}
          <button style={{ ...gBtn(isDark, text), color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }} onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <Streakwidget />

        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 6, color: text }}>Choose a Skill to Practice</h2>
        <p style={{ textAlign: 'center', color: muted, marginBottom: 28, fontSize: 14 }}>Select a skill and difficulty to begin your assessment</p>

        {/* Skill cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 14, marginBottom: 28 }}>
          {SKILLS.map(skill => (
            <div key={skill.id}
              style={{ background: selected?.id === skill.id ? `${skill.color}14` : cardBg, border: `1.5px solid ${selected?.id === skill.id ? skill.color : border}`, borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s', position: 'relative' }}
              onClick={() => { setSelected(skill); setDifficulty(null); }}>
              <div style={{ borderRadius: 12, padding: 11, background: `${skill.color}22`, flexShrink: 0 }}>
                <span style={{ fontSize: 28 }}>{skill.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: text }}>{skill.label}</h3>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: muted, lineHeight: 1.4 }}>{skill.desc}</p>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${skill.color}22`, color: skill.color }}>
                  {skill.type === 'mcq' ? 'Multiple Choice' : skill.type === 'sql' ? 'SQL Query' : 'Code Editor'}
                </span>
              </div>
              {selected?.id === skill.id && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: skill.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>✓</div>}
            </div>
          ))}
        </div>

        {/* Difficulty picker */}
        {selected && (
          <div style={{ background: cardBg, borderRadius: 16, padding: 22, border: `1px solid ${border}`, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, textAlign: 'center', color: text }}>
              Select Difficulty for <span style={{ color: selected.color }}>{selected.label}</span>
            </h3>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              {DIFFICULTIES.map(d => (
                <div key={d.id}
                  style={{ flex: 1, maxWidth: 180, border: `1.5px solid ${difficulty === d.id ? d.color : border}`, borderRadius: 12, padding: '18px 14px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.2s', background: difficulty === d.id ? `${d.color}18` : 'transparent' }}
                  onClick={() => setDifficulty(d.id)}>
                  <span style={{ fontSize: 24 }}>{d.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: d.color }}>{d.label}</span>
                  <span style={{ fontSize: 12, color: muted }}>{d.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && difficulty && (
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <button style={{ padding: '13px 36px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 15, fontWeight: 600 }}
              onClick={() => navigate(`/test/${selected.id}/${difficulty}`)}>
              Start {selected.label} — {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} →
            </button>
          </div>
        )}

        {/* Placement mock test */}
        <div style={{ background: isDark ? 'rgba(255,200,50,0.07)' : 'rgba(255,200,50,0.12)', border: `1px solid rgba(255,200,50,0.25)`, borderRadius: 16, padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 19, color: text }}>🎯 Placement Mock Test</h3>
            <p style={{ margin: '0 0 3px', color: muted, fontSize: 13 }}>All 4 skills — Aptitude + DSA + SQL + Networks</p>
            <p style={{ margin: 0, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', fontSize: 12 }}>12 questions • Job recommendations at the end</p>
          </div>
          <button style={{ flexShrink: 0, padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,200,50,0.5)', background: 'rgba(255,200,50,0.15)', color: '#d4a017', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/test/placement/medium')}>
            Start Mock Test →
          </button>
        </div>
      </div>
    </div>
  );
}

const gBtn = (isDark, text) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#1a1a2e', cursor: 'pointer', fontSize: 13 });