const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userName: String,
    password: String,
    firstName: String,
    lastName: String,
    isAdmin: Boolean,
    deleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);