const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  expectedOutput: String,
  description: String
});

const questionSchema = new mongoose.Schema({
  topic: { type: String, enum: ['aptitude', 'dsa', 'sql', 'networks'], required: true },
  type: { type: String, enum: ['mcq', 'code', 'sql'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  question: { type: String, required: true },
  // MCQ
  options: [String],
  correctAnswer: String,
  // SQL / DSA
  starterCode: String,
  starterCodeByLang: {
    javascript: String,
    python: String,
    cpp: String,
    c: String
  },
  testCases: [testCaseSchema],
  explanation: String
});

module.exports = mongoose.model('Question', questionSchema);