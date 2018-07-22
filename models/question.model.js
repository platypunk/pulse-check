const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    question: String,
    options: [String],
    comment: String,
    schedule: [Date],
    deleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);