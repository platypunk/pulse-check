const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    sender: String,
    message: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);