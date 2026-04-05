import { useTheme } from '../ThemeContext';

export default function ThemeToggle({ style = {} }) {
    const { theme, toggle } = useTheme();
    return (
        <button onClick={toggle} title="Toggle theme" style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(128,128,128,0.25)',
            background: 'rgba(128,128,128,0.1)', cursor: 'pointer', fontSize: 16,
            transition: 'all 0.2s', lineHeight: 1, ...style
        }}>
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}