const mongoose = require('mongoose');

const AnswerSchema = mongoose.Schema({
    questionId: String,
    userId: String,
    answer: String,
    comment: String,
    deleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Answer', AnswerSchema);