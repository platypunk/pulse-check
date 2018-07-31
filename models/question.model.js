const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    userId: String,
    groupId: String,
    question: String,
    options: [String],
    comment: String,
    schedule: Date,
    location: String,
    deleted: Boolean,
    notified: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);