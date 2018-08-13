const Message = require('../models/message.model.js');

exports.save = (sender, message) => {
    console.log('Saving message...');
    
    const message = new Message({
        sender: sender,
        message: message
    });
    
    message.save()
    .catch(err => {
        console.log(err.message || 'Technical error.');
    });
};