const mongoose = require('mongoose');

const questionRatingSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: String, enum: ['too_easy', 'just_right', 'too_hard'], required: true },
    createdAt: { type: Date, default: Date.now },
});

// One rating per user per question
questionRatingSchema.index({ questionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('QuestionRating', questionRatingSchema);