const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
    group: String,
    type: String,
    members: [String],
    admins: [String],
    deleted: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', GroupSchema);