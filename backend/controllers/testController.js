const Question = require('../models/Question');
const vm = require('vm');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { aiEvaluateDSA, aiEvaluateSQL, aiGetHint } = require('../services/aiService');

const ALL_TOPICS = ['aptitude', 'dsa', 'sql', 'networks'];

// ── Get Questions ──────────────────────────────────────────────────────────
exports.getQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.find(filter);
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 5);
    res.json({ questions: shuffled });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get Placement Questions ────────────────────────────────────────────────
exports.getPlacementQuestions = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const allQuestions = [];
    for (const topic of ALL_TOPICS) {
      const filter = { topic };
      if (difficulty && difficulty !== 'mixed') filter.difficulty = difficulty;
      const qs = await Question.find(filter);
      const picked = qs.sort(() => Math.random() - 0.5).slice(0, 3);
      allQuestions.push(...picked);
    }
    res.json({ questions: allQuestions.sort(() => Math.random() - 0.5) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Check MCQ ──────────────────────────────────────────────────────────────
exports.checkMCQ = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const correct = question.correctAnswer === selectedAnswer;
    res.json({ correct, correctAnswer: question.correctAnswer, explanation: question.explanation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Run SQL with AI Evaluation ─────────────────────────────────────────────
exports.runSQL = async (req, res) => {
  try {
    const { questionId, userQuery, useAI = true } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const Database = require('better-sqlite3');
    const db = new Database(':memory:');
    if (question.starterCode) db.exec(question.starterCode);

    // Run exact matching first
    const exactResults = [];
    let allExactPassed = true;

    for (const tc of question.testCases) {
      try {
        let userResult;
        try {
          userResult = db.prepare(userQuery).all();
        } catch (e) {
          exactResults.push({ description: tc.description, passed: false, error: e.message, expected: tc.expectedOutput, got: null });
          allExactPassed = false;
          continue;
        }
        const expectedResult = db.prepare(tc.expectedOutput).all();
        const passed = JSON.stringify(userResult) === JSON.stringify(expectedResult);
        if (!passed) allExactPassed = false;
        exactResults.push({ description: tc.description, passed, expected: JSON.stringify(expectedResult), got: JSON.stringify(userResult) });
      } catch (e) {
        exactResults.push({ description: tc.description, passed: false, error: e.message });
        allExactPassed = false;
      }
    }
    db.close();

    // If all passed exactly, return immediately
    if (allExactPassed) {
      return res.json({ results: exactResults, allPassed: true, score: exactResults.length, total: question.testCases.length, aiEvaluation: null });
    }

    // Run AI evaluation for partial/failed results
    let aiEval = null;
    if (useAI && process.env.GEMINI_API_KEY) {
      aiEval = await aiEvaluateSQL({
        question: question.question,
        userQuery,
        exactResults,
        starterCode: question.starterCode,
      });
    }

    const finalPassed = aiEval ? aiEval.aiPassed : allExactPassed;
    const finalScore = aiEval ? aiEval.aiScore : exactResults.filter(r => r.passed).length;

    res.json({
      results: exactResults,
      allPassed: finalPassed,
      score: finalScore,
      total: question.testCases.length,
      aiEvaluation: aiEval,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// ── Language Runners ───────────────────────────────────────────────────────
function runJavaScript(userCode, input) {
  const sandbox = { input, output: undefined, console: { log: () => { } } };
  const script = new vm.Script(`${userCode}\noutput = solve(input);`);
  vm.createContext(sandbox);
  script.runInContext(sandbox, { timeout: 3000 });
  return JSON.stringify(sandbox.output);
}

function runPython(userCode, input) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa-py-'));
  const filePath = path.join(tmpDir, 'solution.py');
  const wrapper = `import json,sys\n${userCode}\ninput_data=json.loads(${JSON.stringify(JSON.stringify(input))})\nresult=solve(input_data)\nprint(json.dumps(result))`;
  fs.writeFileSync(filePath, wrapper);
  const result = spawnSync('python3', [filePath], { timeout: 5000, encoding: 'utf8' });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (result.error) throw new Error('Python error: ' + result.error.message);
  if (result.status !== 0) throw new Error(result.stderr?.trim() || 'Runtime error');
  return result.stdout.trim();
}

function runCpp(userCode, input) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa-cpp-'));
  const srcPath = path.join(tmpDir, 'solution.cpp');
  const binPath = path.join(tmpDir, 'solution');
  const fullCode = `#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n#include <map>\n#include <unordered_map>\n#include <set>\n#include <stack>\n#include <queue>\n#include <climits>\n#include <sstream>\nusing namespace std;\n${userCode}\nint main(){string input;getline(cin,input);solve(input);return 0;}`;
  fs.writeFileSync(srcPath, fullCode);
  const compile = spawnSync('g++', ['-std=c++17', '-O2', srcPath, '-o', binPath], { timeout: 10000, encoding: 'utf8' });
  if (compile.status !== 0) { fs.rmSync(tmpDir, { recursive: true, force: true }); throw new Error('Compilation error:\n' + compile.stderr); }
  const run = spawnSync(binPath, [], { timeout: 5000, encoding: 'utf8', input: JSON.stringify(input) });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (run.error) throw new Error('Runtime error: ' + run.error.message);
  if (run.status !== 0) throw new Error(run.stderr?.trim() || 'Runtime error');
  return run.stdout.trim();
}

function runC(userCode, input) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa-c-'));
  const srcPath = path.join(tmpDir, 'solution.c');
  const binPath = path.join(tmpDir, 'solution');
  const fullCode = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <ctype.h>\n#include <math.h>\n${userCode}\nint main(){char input[4096];fgets(input,sizeof(input),stdin);solve(input);return 0;}`;
  fs.writeFileSync(srcPath, fullCode);
  const compile = spawnSync('gcc', ['-O2', srcPath, '-o', binPath, '-lm'], { timeout: 10000, encoding: 'utf8' });
  if (compile.status !== 0) { fs.rmSync(tmpDir, { recursive: true, force: true }); throw new Error('Compilation error:\n' + compile.stderr); }
  const run = spawnSync(binPath, [], { timeout: 5000, encoding: 'utf8', input: JSON.stringify(input) });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (run.error) throw new Error('Runtime error: ' + run.error.message);
  if (run.status !== 0) throw new Error(run.stderr?.trim() || 'Runtime error');
  return run.stdout.trim();
}

// ── Run DSA with AI Evaluation ─────────────────────────────────────────────
exports.runDSA = async (req, res) => {
  try {
    const { questionId, userCode, language, useAI = true } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Run exact test cases first
    const exactResults = [];
    let allExactPassed = true;

    for (const tc of question.testCases) {
      try {
        let got;
        switch (language) {
          case 'python': got = runPython(userCode, tc.input); break;
          case 'cpp': got = runCpp(userCode, tc.input); break;
          case 'c': got = runC(userCode, tc.input); break;
          default: got = runJavaScript(userCode, tc.input);
        }
        const passed = got === tc.expectedOutput;
        if (!passed) allExactPassed = false;
        exactResults.push({ description: tc.description, passed, expected: tc.expectedOutput, got });
      } catch (e) {
        exactResults.push({ description: tc.description, passed: false, error: e.message });
        allExactPassed = false;
      }
    }

    // If all passed exactly, skip AI
    if (allExactPassed) {
      return res.json({ results: exactResults, allPassed: true, score: exactResults.length, total: question.testCases.length, aiEvaluation: null });
    }

    // Run AI evaluation for failed cases
    let aiEval = null;
    if (useAI && process.env.GEMINI_API_KEY) {
      aiEval = await aiEvaluateDSA({
        question: question.question,
        userCode,
        language,
        testCases: question.testCases,
        exactResults,
      });
    }

    const finalPassed = aiEval ? aiEval.aiPassed : allExactPassed;
    const finalScore = aiEval ? aiEval.aiScore : exactResults.filter(r => r.passed).length;

    res.json({
      results: exactResults,
      allPassed: finalPassed,
      score: finalScore,
      total: question.testCases.length,
      aiEvaluation: aiEval,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// ── Get Hint (costs 50% of question score) ─────────────────────────────────
exports.getHint = async (req, res) => {
  try {
    const { questionId, userCode, language } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const hint = await aiGetHint({
      question: question.question,
      topic: question.topic,
      difficulty: question.difficulty,
      userCode,
      language,
    });

    res.json({ hint: hint.hint, penalty: '50% score reduction applied' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Rate Question ──────────────────────────────────────────────────────────
exports.rateQuestion = async (req, res) => {
  try {
    const { questionId, rating } = req.body;
    const userId = req.userId;
    const QuestionRating = require('../models/QuestionRating');

    await QuestionRating.findOneAndUpdate(
      { questionId, userId },
      { questionId, userId, rating },
      { upsert: true, new: true }
    );
    res.json({ message: 'Rating saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};