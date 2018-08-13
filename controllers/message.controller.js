const Message = require('../models/message.model.js');

exports.save = (sender, message) => {
    console.log('Saving message...');
    
    const msg = new Message({
        sender: sender,
        message: message
    });
    
    msg.save()
    .catch(err => {
        console.log(err.message || 'Technical error.');
    });
};