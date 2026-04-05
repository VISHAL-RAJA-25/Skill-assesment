import { useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from '../ThemeContext';

export default function StreakWidget() {
    const { isDark } = useTheme();
    const [streak, setStreak] = useState(parseInt(localStorage.getItem('streak')) || 0);
    const [maxStreak, setMaxStreak] = useState(parseInt(localStorage.getItem('maxStreak')) || 0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/auth/streak')
            .then(r => {
                setStreak(r.data.streak);
                setMaxStreak(r.data.maxStreak);
                setTotal(r.data.totalDaysActive);
                localStorage.setItem('streak', r.data.streak);
                localStorage.setItem('maxStreak', r.data.maxStreak);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const bg = isDark ? 'rgba(255,200,50,0.07)' : 'rgba(255,180,0,0.1)';
    const border = isDark ? 'rgba(255,200,50,0.2)' : 'rgba(255,160,0,0.25)';
    const text = isDark ? '#fff' : '#1a1a2e';
    const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';

    const flameColor = streak >= 7 ? '#ff4444' : streak >= 3 ? '#ff8c00' : '#ffd93d';

    if (loading) return null;

    return (
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>

            {/* Flame + streak count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 36, animation: streak > 0 ? 'timerPulse 1.5s ease-in-out infinite' : 'none' }}>
                    {streak === 0 ? '💤' : streak >= 7 ? '🔥' : streak >= 3 ? '🔥' : '✨'}
                </span>
                <div>
                    <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: flameColor, lineHeight: 1 }}>
                        {streak}
                        <span style={{ fontSize: 14, fontWeight: 400, color: muted, marginLeft: 4 }}>day{streak !== 1 ? 's' : ''}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: muted }}>Current streak</p>
                </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 40, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', flexShrink: 0 }} />

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: text }}>🏆 {maxStreak}</p>
                    <p style={{ margin: 0, fontSize: 11, color: muted }}>Best streak</p>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: text }}>📅 {total}</p>
                    <p style={{ margin: 0, fontSize: 11, color: muted }}>Total days active</p>
                </div>
            </div>

            {/* Motivational message */}
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, color: muted, fontStyle: 'italic' }}>
                    {streak === 0 && 'Start your streak today!'}
                    {streak === 1 && 'Day 1 — great start! 💪'}
                    {streak === 2 && 'Two days in a row! 🌱'}
                    {streak >= 3 && streak < 7 && `${streak} days strong! Keep it up! 🔥`}
                    {streak >= 7 && streak < 14 && `${streak} day streak! You're on fire! 🔥🔥`}
                    {streak >= 14 && `${streak} days! Unstoppable! 🔥🔥🔥`}
                </p>
            </div>
        </div>
    );
}