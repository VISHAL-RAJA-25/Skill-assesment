const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── Helper: call Gemini and parse JSON response ───────────────────────────
async function askGemini(prompt) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    // Strip markdown code fences if Gemini wraps in ```json
    const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(clean);
}

// ── AI Evaluate DSA Answer ────────────────────────────────────────────────
exports.aiEvaluateDSA = async ({ question, userCode, language, testCases, exactResults }) => {
    try {
        const passedCount = exactResults.filter(r => r.passed).length;

        // All passed exactly — no need for AI
        if (passedCount === testCases.length) {
            return {
                aiPassed: true,
                aiScore: testCases.length,
                aiTotal: testCases.length,
                feedback: '✅ All test cases passed! Your solution is correct.',
                suggestion: null,
                usedAI: false,
            };
        }

        const prompt = `You are a coding assessment evaluator. A student submitted a ${language} solution.

PROBLEM:
${question}

STUDENT CODE:
${userCode}

TEST RESULTS:
${exactResults.map((r, i) =>
            `Test ${i + 1}: ${r.passed ? 'PASSED' : 'FAILED'} - ${r.description}` +
            (r.error ? ` | Error: ${r.error}` : '') +
            (!r.passed && !r.error ? ` | Expected: ${r.expected} | Got: ${r.got}` : '')
        ).join('\n')}

Evaluate:
1. Is the logic/algorithm correct even if output format differs slightly? (e.g. 6 vs 6.0, or valid alternate answers)
2. How many test cases should be considered passed considering logical correctness?
3. Give 2-3 sentences of specific constructive feedback.
4. Give a one-line improvement hint, or null if the solution is correct.

Respond ONLY in this exact JSON format with no markdown or extra text:
{"logicallyCorrect":true,"adjustedPassed":2,"feedback":"Your feedback here.","suggestion":"hint or null"}`;

        const parsed = await askGemini(prompt);

        return {
            aiPassed: parsed.logicallyCorrect,
            aiScore: Math.max(passedCount, parsed.adjustedPassed || 0),
            aiTotal: testCases.length,
            feedback: parsed.feedback,
            suggestion: parsed.suggestion === 'null' ? null : parsed.suggestion,
            usedAI: true,
        };
    } catch (err) {
        console.error('Gemini DSA eval error:', err.message);
        const passedCount = exactResults.filter(r => r.passed).length;
        return {
            aiPassed: passedCount === testCases.length,
            aiScore: passedCount,
            aiTotal: testCases.length,
            feedback: null,
            suggestion: null,
            usedAI: false,
        };
    }
};

// ── AI Evaluate SQL Answer ─────────────────────────────────────────────────
exports.aiEvaluateSQL = async ({ question, userQuery, exactResults, starterCode }) => {
    try {
        const passedCount = exactResults.filter(r => r.passed).length;

        if (passedCount === exactResults.length) {
            return {
                aiPassed: true,
                aiScore: exactResults.length,
                aiTotal: exactResults.length,
                feedback: '✅ Your SQL query is correct!',
                suggestion: null,
                usedAI: false,
            };
        }

        const prompt = `You are a SQL assessment evaluator.

PROBLEM:
${question}

TABLE SETUP:
${starterCode}

STUDENT QUERY:
${userQuery}

TEST RESULTS:
${exactResults.map((r, i) =>
            `Test ${i + 1}: ${r.passed ? 'PASSED' : 'FAILED'} - ${r.description}` +
            (r.error ? ` | Error: ${r.error}` : '') +
            (!r.passed && !r.error ? ` | Expected: ${r.expected} | Got: ${r.got}` : '')
        ).join('\n')}

Evaluate:
1. Is the SQL query logically correct even if column order or formatting differs slightly?
2. How many test cases should pass considering logical correctness?
3. Give 2-3 sentences of specific SQL feedback.
4. A one-line improvement hint or null if correct.

Respond ONLY in this exact JSON format with no markdown:
{"logicallyCorrect":true,"adjustedPassed":2,"feedback":"Your feedback here.","suggestion":"hint or null"}`;

        const parsed = await askGemini(prompt);

        return {
            aiPassed: parsed.logicallyCorrect,
            aiScore: Math.max(passedCount, parsed.adjustedPassed || 0),
            aiTotal: exactResults.length,
            feedback: parsed.feedback,
            suggestion: parsed.suggestion === 'null' ? null : parsed.suggestion,
            usedAI: true,
        };
    } catch (err) {
        console.error('Gemini SQL eval error:', err.message);
        const passedCount = exactResults.filter(r => r.passed).length;
        return {
            aiPassed: passedCount === exactResults.length,
            aiScore: passedCount,
            aiTotal: exactResults.length,
            feedback: null,
            suggestion: null,
            usedAI: false,
        };
    }
};

// ── AI Generate Hint ──────────────────────────────────────────────────────
exports.aiGetHint = async ({ question, topic, difficulty, userCode, language }) => {
    try {
        const prompt = `You are a helpful coding tutor. A student is stuck on this ${difficulty} ${topic} problem.

PROBLEM:
${question}

${userCode ? `STUDENT'S CURRENT CODE (${language || 'sql'}):\n${userCode}\n` : ''}

Give ONE helpful hint that:
- Points them in the right direction WITHOUT giving away the answer
- Is specific to their code if they have written something
- Is 1-2 sentences maximum
- For DSA: hint about the right data structure or algorithm
- For SQL: hint about which clause or function to use

Respond with ONLY the hint text. No JSON, no formatting, no extra text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { hint: response.text().trim() };
    } catch (err) {
        console.error('Gemini hint error:', err.message);
        const fallbacks = {
            dsa: 'Think about which data structure gives you O(1) lookup time for values you have already seen.',
            sql: 'Think about whether you need to filter rows (WHERE) or group them (GROUP BY) first.',
        };
        return { hint: fallbacks[topic] || 'Break the problem into smaller steps and solve each one.' };
    }
};