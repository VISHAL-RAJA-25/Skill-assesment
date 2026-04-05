const mongoose = require('mongoose');

const skillResultSchema = new mongoose.Schema({
  topic: String,
  difficulty: String,
  score: Number,
  total: Number,
  percentage: Number
});

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, enum: ['individual', 'placement'], default: 'individual' },
  skillResults: [skillResultSchema],
  overallScore: Number,
  overallPercentage: Number,
  weakSkills: [String],
  strongSkills: [String],
  jobRecommendations: [String],
  takenAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', testResultSchema);

