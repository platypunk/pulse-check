const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    question: String,
    options: [{ option: String }],
    comment: String,
    schedule: [{ time: Date}],
    deleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);