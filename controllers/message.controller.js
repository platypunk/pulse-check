const Log = require('log');
const log = new Log('info');

const Message = require('../models/message.model.js');

exports.save = (sender, message) => {
    log.info(`Saving message ${message} from ${sender}...`);
    
    const msg = new Message({
        sender: sender,
        message: message
    });
    
    msg.save()
    .catch(err => {
        log.info(err.message || 'Technical error.');
    });
};