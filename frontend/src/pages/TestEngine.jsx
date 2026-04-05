import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';
import { useTheme } from '../ThemeContext';
import Themetoggle from '../Components/Themetoggle';

const MCQ_TOPICS = ['aptitude', 'networks'];
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟡', color: '#f7df1e', monaco: 'javascript' },
  { id: 'python', label: 'Python', icon: '🐍', color: '#3776ab', monaco: 'python' },
  { id: 'cpp', label: 'C++', icon: '⚙️', color: '#00599c', monaco: 'cpp' },
  { id: 'c', label: 'C', icon: '🔵', color: '#a8b9cc', monaco: 'c' },
];

const RATINGS = [
  { id: 'too_easy', label: 'Too Easy', emoji: '😴', color: '#43e97b' },
  { id: 'just_right', label: 'Just Right', emoji: '👌', color: '#4facfe' },
  { id: 'too_hard', label: 'Too Hard', emoji: '🔥', color: '#f093fb' },
];

function playTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
  } catch (e) { }
}

export default function TestEngine() {
  const { topic, difficulty } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isPlacement = topic === 'placement';

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [hasStarted, setHasStarted] = useState(!isPlacement);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [feedback, setFeedback] = useState(null);
  const [runResults, setRunResults] = useState(null);
  const [aiEval, setAiEval] = useState(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerClass, setTimerClass] = useState('');
  const [perTopicDisplay, setPerTopicDisplay] = useState({});
  const [hint, setHint] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  // Sprint 4: rating + history tracking
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const perTopicRef = useRef({});
  // Full history: [{question, userAnswer, correct, correctAnswer, explanation, aiEval}]
  const historyRef = useRef([]);
  const timerRef = useRef(null);
  const prevTime = useRef(null);

  const currentQ = questions[current];
  const currentTopic = currentQ?.topic || topic;
  const isMCQ = MCQ_TOPICS.includes(currentTopic);
  const isSQL = currentTopic === 'sql';
  const isDSA = currentTopic === 'dsa';

  const bg = isDark ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#dde1f5,#c9cef0,#dde6f5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const text = isDark ? '#fff' : '#1a1a2e';
  const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const editorBg = isDark ? '#1e1e1e' : '#f8f9fc';
  const navBg = isDark ? 'rgba(15,12,41,0.97)' : 'rgba(238,240,248,0.97)';

  useEffect(() => { fetchQuestions(); }, []);

  useEffect(() => {
    if (!isPlacement || !hasStarted) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings > 2) {
             alert("⚠️ You have exceeded the warning limit by exiting fullscreen. Your test will now be submitted.");
             finishTest();
             return newWarnings;
          } else {
             setShowWarning(true);
             return newWarnings;
          }
        });
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPlacement, hasStarted]);

  async function startProctoredTest() {
    try {
      await document.documentElement.requestFullscreen();
      setHasStarted(true);
    } catch (err) {
      alert("Please allow fullscreen to start the test: " + err.message);
    }
  }

  async function resumeProctoredTest() {
    try {
      await document.documentElement.requestFullscreen();
      setShowWarning(false);
    } catch (err) {
      alert("Please allow fullscreen to resume: " + err.message);
    }
  }

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = isPlacement
        ? await api.get('/test/placement-questions?difficulty=medium')
        : await api.get(`/test/questions?topic=${topic}&difficulty=${difficulty}`);
      const qs = res.data.questions || [];
      setQuestions(qs);
      if (qs.length > 0) setTimeLeft(MCQ_TOPICS.includes(qs[0].topic) ? 45 : 180);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!currentQ) return;
    setTimeLeft(MCQ_TOPICS.includes(currentQ.topic) ? 45 : 180);
    setTimerClass(''); prevTime.current = null;
    setHint(null); setHintUsed(false); setShowHintConfirm(false);
    setSelectedRating(null); setRatingSubmitted(false);
  }, [current]);

  useEffect(() => {
    if (timeLeft === null || feedback || !hasStarted) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    if (timeLeft <= 10 && timerClass !== 'timer-danger') setTimerClass('timer-danger');
    else if (timeLeft <= 30 && timeLeft > 10 && timerClass !== 'timer-warning') setTimerClass('timer-warning');
    if (timeLeft <= 10 && prevTime.current !== timeLeft) { playTick(); prevTime.current = timeLeft; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, feedback, hasStarted]);

  function handleTimeout() {
    recordResult(currentQ?.topic, false, false, { timedOut: true });
    setFeedback({ correct: false, message: 'Time up!', explanation: currentQ?.explanation });
  }

  function recordResult(t, correct, hintWasUsed, extra = {}) {
    const effectiveCorrect = correct && !hintWasUsed;
    const prev = perTopicRef.current[t] || { score: 0, total: 0 };
    const updated = { ...perTopicRef.current, [t]: { score: prev.score + (effectiveCorrect ? 1 : 0), total: prev.total + 1 } };
    perTopicRef.current = updated;
    setPerTopicDisplay({ ...updated });

    // Save to history for review
    historyRef.current.push({
      questionId: currentQ?._id,
      question: currentQ?.question,
      topic: t,
      type: currentQ?.type,
      options: currentQ?.options,
      userAnswer: extra.userAnswer || answer,
      correctAnswer: extra.correctAnswer || currentQ?.correctAnswer,
      correct: effectiveCorrect,
      hintUsed: hintWasUsed,
      explanation: extra.explanation || currentQ?.explanation,
      aiEvaluation: extra.aiEval || null,
      timedOut: extra.timedOut || false,
      starterCode: currentQ?.starterCode,
    });
  }

  useEffect(() => {
    if (!currentQ) return;
    if (currentQ.topic === 'dsa') setAnswer(currentQ.starterCodeByLang?.[language] || currentQ.starterCode || '');
    else if (currentQ.type === 'sql') setAnswer('');
  }, [current, questions, language]);

  async function handleGetHint() {
    setShowHintConfirm(false); setLoadingHint(true);
    try {
      const { data } = await api.post('/test/hint', { questionId: currentQ._id, userCode: answer, language: isDSA ? language : 'sql' });
      setHint(data.hint); setHintUsed(true);
    } catch { setHint('Could not load hint. Try again.'); }
    finally { setLoadingHint(false); }
  }

  // Question difficulty rating
  async function handleRating(ratingId) {
    setSelectedRating(ratingId);
    try {
      await api.post('/test/rate', { questionId: currentQ._id, rating: ratingId });
      setRatingSubmitted(true);
    } catch (err) { console.error(err); }
  }

  async function handleMCQSubmit(option) {
    if (feedback) return;
    clearTimeout(timerRef.current);
    try {
      const { data } = await api.post('/test/check-mcq', { questionId: currentQ._id, selectedAnswer: option });
      recordResult(currentQ.topic, data.correct, false, { userAnswer: option, correctAnswer: data.correctAnswer, explanation: data.explanation });
      setFeedback({ correct: data.correct, correctAnswer: data.correctAnswer, explanation: data.explanation, selected: option });
    } catch (err) { console.error(err); }
  }

  async function handleRunCode() {
    if (!answer.trim()) return;
    setRunning(true); setRunResults(null); setAiEval(null);
    try {
      const endpoint = isSQL ? '/test/run-sql' : '/test/run-dsa';
      const payload = isSQL ? { questionId: currentQ._id, userQuery: answer } : { questionId: currentQ._id, userCode: answer, language };
      const { data } = await api.post(endpoint, payload);
      setRunResults(data); setAiEval(data.aiEvaluation);
      clearTimeout(timerRef.current);
      const passed = data.allPassed;
      recordResult(currentQ.topic, passed, hintUsed, { userAnswer: answer, aiEval: data.aiEvaluation });
      setFeedback({ correct: passed, message: passed ? 'All test cases passed! 🎉' : 'Some test cases failed.' });
    } catch (err) {
      setRunResults({ error: err.response?.data?.message || 'Execution error' });
    } finally { setRunning(false); }
  }

  function handleNext() {
    if (current + 1 >= questions.length) { finishTest(); return; }
    setCurrent(c => c + 1);
    setFeedback(null); setRunResults(null); setAiEval(null); setTimerClass('');
  }

  function finishTest() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    const skillResults = Object.entries(perTopicRef.current).map(([t, { score, total }]) => ({
      topic: t, difficulty: isPlacement ? 'medium' : difficulty,
      score, total, percentage: total > 0 ? Math.round((score / total) * 100) : 0
    }));
    navigate('/results', {
      state: { skillResults, testType: isPlacement ? 'placement' : 'individual', reviewHistory: historyRef.current }
    });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: 12 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: muted }}>Loading questions...</p>
    </div>
  );

  if (!loading && questions.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: 12 }}>
      <p style={{ fontSize: 40 }}>😕</p>
      <p style={{ color: text, fontSize: 16 }}>No questions found</p>
      <p style={{ color: muted, fontSize: 13, marginBottom: 16 }}>{isPlacement ? 'Run node seed.js in backend.' : `No ${topic} (${difficulty}) questions.`}</p>
      <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
    </div>
  );

  if (isPlacement && !hasStarted && questions.length > 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: 16, padding: 20 }}>
      <h1 style={{ color: text, margin: 0, fontSize: 28 }}>🛡️ Proctored Mock Test</h1>
      <p style={{ color: muted, textAlign: 'center', maxWidth: 450, marginTop: 0, fontSize: 15, lineHeight: 1.6 }}>
        This test must be taken in Fullscreen Mode. Exiting fullscreen will result in a warning. You have a maximum of 2 warnings before the test is automatically submitted.
      </p>
      <button style={{ padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, marginTop: 10, boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }} onClick={startProctoredTest}>
        Enter Fullscreen & Start
      </button>
      <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Go Back</button>
    </div>
  );

  const q = currentQ;
  const progress = (current / questions.length) * 100;
  const topicColor = { aptitude: '#667eea', dsa: '#f093fb', sql: '#4facfe', networks: '#43e97b' }[currentTopic] || '#fff';
  const timerColor = timeLeft <= 10 ? '#ff4444' : timeLeft <= 30 ? '#ffd93d' : '#43e97b';
  const selLang = LANGUAGES.find(l => l.id === language);

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Segoe UI',sans-serif" }}>

      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 }}>
          <h1 style={{ color: '#ff6b6b', margin: 0, fontSize: 32 }}>⚠️ Warning {warnings} of 2</h1>
          <p style={{ color: '#fff', textAlign: 'center', maxWidth: 450, marginTop: 0, fontSize: 16, lineHeight: 1.6 }}>
            You exited fullscreen mode. This is a proctored test. Please return to fullscreen immediately to continue.
          </p>
          <button style={{ padding: '14px 28px', borderRadius: 12, background: '#ffd93d', color: '#000', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, marginTop: 10 }} onClick={resumeProctoredTest}>
            Return to Fullscreen
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${border}`, background: navBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button style={gBtn(isDark, text)} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          {isPlacement && <span style={{ ...pill, background: 'rgba(255,200,50,0.2)', color: '#d4a017' }}>🎯 MOCK TEST</span>}
          <span style={{ ...pill, background: `${topicColor}22`, color: topicColor }}>{currentTopic?.toUpperCase()}</span>
          {!isPlacement && <span style={{ ...pill, background: difficulty === 'easy' ? '#43e97b22' : difficulty === 'medium' ? '#ffd93d22' : '#f093fb22', color: difficulty === 'easy' ? '#43e97b' : difficulty === 'medium' ? '#ffd93d' : '#f093fb' }}>{difficulty?.toUpperCase()}</span>}
          <span style={{ ...pill, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', color: text }}>Q {current + 1} / {questions.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Themetoggle />
          <div className={timerClass} style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timerColor, minWidth: 64, textAlign: 'right', padding: '4px 8px', borderRadius: 8, background: timeLeft <= 10 ? 'rgba(255,68,68,0.12)' : timeLeft <= 30 ? 'rgba(255,217,61,0.1)' : 'transparent', transition: 'background 0.3s' }}>
            ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#667eea,#f093fb)', transition: 'width 0.4s', width: `${progress}%` }} />
      </div>

      {/* Placement tracker */}
      {isPlacement && (
        <div style={{ display: 'flex', gap: 8, padding: '10px 24px', borderBottom: `1px solid ${border}`, flexWrap: 'wrap', background: navBg }}>
          {['aptitude', 'dsa', 'sql', 'networks'].map(t => {
            const r = perTopicDisplay[t];
            const color = { aptitude: '#667eea', dsa: '#f093fb', sql: '#4facfe', networks: '#43e97b' }[t];
            const active = currentTopic === t;
            return (
              <div key={t} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 12px', borderRadius: 20, border: `1px solid ${active ? color : border}`, background: active ? `${color}22` : 'transparent', fontSize: 11, transition: 'all 0.2s' }}>
                <span style={{ color, fontWeight: 700 }}>{t.toUpperCase()}</span>
                {r && <span style={{ color: muted }}>{r.score}/{r.total}</span>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px' }}>

        {/* Question */}
        <div style={{ background: cardBg, borderRadius: 14, padding: '18px 22px', marginBottom: 18, border: `1px solid ${topicColor}33` }}>
          <pre style={{ margin: 0, fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: "'Segoe UI',sans-serif", color: text }}>{q.question}</pre>
        </div>

        {/* MCQ */}
        {isMCQ && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {q.options?.map((opt, i) => {
              let bg2 = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)', bdr = border;
              if (feedback) {
                if (opt === feedback.correctAnswer) { bg2 = 'rgba(67,233,123,0.15)'; bdr = '#43e97b'; }
                else if (opt === feedback.selected && !feedback.correct) { bg2 = 'rgba(255,107,107,0.15)'; bdr = '#ff6b6b'; }
              }
              return (
                <div key={i} style={{ border: `1.5px solid ${bdr}`, borderRadius: 12, padding: '13px 15px', cursor: feedback ? 'default' : 'pointer', display: 'flex', gap: 10, alignItems: 'center', transition: 'all 0.15s', fontSize: 14, lineHeight: 1.4, background: bg2, color: text }}
                  onClick={() => !feedback && handleMCQSubmit(opt)}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </div>
              );
            })}
          </div>
        )}

        {/* SQL / DSA Editor */}
        {(isSQL || isDSA) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isSQL && (
              <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#eef1fc', borderRadius: 10, padding: 14, border: `1px solid ${border}` }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>📋 Table schema</p>
                <pre style={{ margin: 0, fontSize: 12, color: isDark ? '#7fdbff' : '#1565c0', fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{q.starterCode}</pre>
              </div>
            )}
            {isDSA && !feedback && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Language:</span>
                {LANGUAGES.map(lang => (
                  <button key={lang.id} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${language === lang.id ? lang.color : border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: language === lang.id ? `${lang.color}22` : 'transparent', color: language === lang.id ? lang.color : muted }}
                    onClick={() => setLanguage(lang.id)}>{lang.icon} {lang.label}</button>
                ))}
              </div>
            )}
            <div style={{ background: editorBg, borderRadius: 12, border: `1px solid ${border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: isDSA ? selLang?.color : '#4facfe' }}>{isDSA ? `${selLang?.icon} ${selLang?.label} Editor` : '🔵 SQL Query Editor'}</span>
                <span style={{ fontSize: 11, color: muted }}>{isSQL ? 'Write your SELECT query' : (language === 'javascript' || language === 'python') ? 'Write solve(input) and return result' : 'Write solve(...) and print result'}</span>
              </div>
              <Editor height={isDSA ? '240px' : '180px'} language={isDSA ? selLang?.monaco : 'sql'} theme={isDark ? 'vs-dark' : 'light'} value={answer} onChange={v => setAnswer(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, readOnly: !!feedback, tabSize: 2, padding: { top: 12, bottom: 12 }, wordWrap: 'on' }} />
              {!feedback && (
                <div style={{ padding: '0 12px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button style={runBtn(isDSA ? selLang?.color : null)} onClick={handleRunCode} disabled={running}>{running ? '⏳ Running...' : isDSA ? `▶ Run ${selLang?.label}` : '▶ Run & Submit'}</button>
                  {!hintUsed && (
                    <button style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,200,50,0.4)', background: 'rgba(255,200,50,0.1)', color: '#d4a017', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setShowHintConfirm(true)}>💡 Hint (-50% score)</button>
                  )}
                  {hintUsed && <span style={{ fontSize: 12, color: '#ffd93d' }}>💡 Hint used — 50% penalty</span>}
                </div>
              )}
            </div>
            {showHintConfirm && (
              <div style={{ background: isDark ? 'rgba(255,200,50,0.1)' : 'rgba(255,200,50,0.15)', border: '1px solid rgba(255,200,50,0.4)', borderRadius: 12, padding: '16px 20px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#d4a017' }}>⚠️ Use a hint?</p>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: muted }}>This will give you a hint but reduce your score for this question by 50%.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#d4a017', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }} onClick={handleGetHint} disabled={loadingHint}>{loadingHint ? '⏳ Getting hint...' : 'Yes, show hint'}</button>
                  <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: text, cursor: 'pointer', fontSize: 13 }} onClick={() => setShowHintConfirm(false)}>Cancel</button>
                </div>
              </div>
            )}
            {hint && (
              <div style={{ background: isDark ? 'rgba(255,200,50,0.08)' : 'rgba(255,200,50,0.12)', border: '1px solid rgba(255,200,50,0.3)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: 0.5 }}>💡 AI Hint</p>
                <p style={{ margin: 0, fontSize: 14, color: text, lineHeight: 1.6 }}>{hint}</p>
              </div>
            )}
            {isDSA && !feedback && (
              <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${border}` }}>
                {language === 'javascript' && <p style={{ margin: 0, fontSize: 13, color: muted }}>Name your function <code style={cd(isDark)}>solve(input)</code> and <strong>return</strong> the answer.</p>}
                {language === 'python' && <p style={{ margin: 0, fontSize: 13, color: muted }}>Name your function <code style={cd(isDark)}>solve(input)</code> and <strong>return</strong> the answer (don't print).</p>}
                {language === 'cpp' && <p style={{ margin: 0, fontSize: 13, color: muted }}>Write <code style={cd(isDark)}>void solve(string input)</code>. Use <code style={cd(isDark)}>cout</code> to print result.</p>}
                {language === 'c' && <p style={{ margin: 0, fontSize: 13, color: muted }}>Write <code style={cd(isDark)}>void solve(char* input)</code>. Use <code style={cd(isDark)}>printf</code> to print result.</p>}
              </div>
            )}
          </div>
        )}

        {/* Test case results */}
        {runResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {runResults.error && <div style={{ background: 'rgba(255,107,107,0.07)', border: '1px solid #ff6b6b44', borderRadius: 10, padding: 14 }}><p style={{ margin: '0 0 6px', color: '#ff6b6b', fontWeight: 700 }}>❌ Error</p><pre style={{ margin: 0, fontSize: 12, color: '#ff9e9e', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{runResults.error}</pre></div>}
            {runResults.results?.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 10, border: `1px solid ${r.passed ? '#43e97b44' : '#ff6b6b44'}`, background: r.passed ? 'rgba(67,233,123,0.07)' : 'rgba(255,107,107,0.07)', fontSize: 13 }}>
                <span style={{ color: r.passed ? '#43e97b' : '#ff6b6b', fontSize: 18, fontWeight: 700 }}>{r.passed ? '✓' : '✗'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, color: text }}>{r.description}</p>
                  {r.error && <p style={{ margin: '2px 0', color: muted, fontSize: 12 }}>Error: {r.error}</p>}
                  {!r.passed && !r.error && <><p style={{ margin: '2px 0', color: muted, fontSize: 12 }}>Expected: <code style={cd(isDark)}>{r.expected}</code></p><p style={{ margin: '2px 0', color: muted, fontSize: 12 }}>Got: <code style={cd(isDark)}>{r.got}</code></p></>}
                </div>
              </div>
            ))}
            {runResults.results && <p style={{ fontSize: 12, color: muted, textAlign: 'right', margin: 0 }}>{runResults.score}/{runResults.total} passed</p>}
            {aiEval?.usedAI && (
              <div style={{ background: isDark ? 'rgba(102,126,234,0.1)' : 'rgba(102,126,234,0.08)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 12, padding: '14px 18px', marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#667eea' }}>AI Evaluation</p>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: aiEval.aiPassed ? 'rgba(67,233,123,0.2)' : 'rgba(255,200,50,0.2)', color: aiEval.aiPassed ? '#43e97b' : '#ffd93d' }}>{aiEval.aiPassed ? 'Logically Correct ✓' : 'Needs Improvement'}</span>
                </div>
                {aiEval.feedback && <p style={{ margin: '0 0 6px', fontSize: 13, color: text, lineHeight: 1.6 }}>{aiEval.feedback}</p>}
                {aiEval.suggestion && <p style={{ margin: 0, fontSize: 13, color: '#ffd93d', lineHeight: 1.6 }}>💡 {aiEval.suggestion}</p>}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{ borderRadius: 12, padding: '14px 18px', border: `1px solid ${feedback.correct ? '#43e97b' : '#ff6b6b'}`, background: feedback.correct ? 'rgba(67,233,123,0.08)' : 'rgba(255,107,107,0.08)', marginTop: 10 }}>
            <p style={{ fontWeight: 700, color: feedback.correct ? '#43e97b' : '#ff6b6b', margin: '0 0 6px' }}>{feedback.correct ? '✅ Correct!' : '❌ ' + (feedback.message || 'Incorrect')}</p>
            {hintUsed && feedback.correct && <p style={{ margin: '0 0 6px', fontSize: 12, color: '#ffd93d' }}>⚠️ Hint was used — 50% score applied.</p>}
            {feedback.explanation && <p style={{ margin: 0, fontSize: 13, color: muted, lineHeight: 1.6 }}>💡 {feedback.explanation}</p>}
          </div>
        )}

        {/* ── Sprint 4: Question Difficulty Rating ── */}
        {feedback && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', marginTop: 14 }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: text }}>
              📊 How was this question?
            </p>
            {!ratingSubmitted ? (
              <div style={{ display: 'flex', gap: 10 }}>
                {RATINGS.map(r => (
                  <button key={r.id}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${selectedRating === r.id ? r.color : border}`, background: selectedRating === r.id ? `${r.color}22` : 'transparent', color: selectedRating === r.id ? r.color : muted, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                    onClick={() => handleRating(r.id)}>
                    <span style={{ fontSize: 20 }}>{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: '#43e97b' }}>✅ Thanks for your feedback!</p>
            )}
          </div>
        )}

        {/* Next button */}
        {feedback && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button style={{ padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#667eea,#764ba2)', color: '#fff', fontSize: 15, fontWeight: 700 }} onClick={handleNext}>
              {current + 1 >= questions.length ? '📊 View Results & Review' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const pill = { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 };
const cd = (isDark) => ({ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 });
const gBtn = (isDark, text) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 13 });
const runBtn = (color) => ({ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', background: color ? `linear-gradient(90deg,${color}cc,${color}88)` : 'linear-gradient(90deg,#4facfe,#00f2fe)', color: '#000', fontWeight: 700, fontSize: 14 });