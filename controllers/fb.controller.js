const fbConfig = require('../config/fb.config.js');

exports.receiveMessage = (req, res) => {
    console.log('Receiving message...');
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

exports.verifyMessage = (req, res) => {
    console.log('Verifying message...');
    let VERIFY_TOKEN = fbConfig.verifyToken;
    
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);      
        }
    } else {
        res.sendStatus(400);
    }
};

exports.getPrivacyPolicy = (req, res) => {
    console.log('Returning privacy policy...');
    
    res.status(200).send("Privacy Policy");
};

exports.sendMessage = (req, res) => {
    console.log('Sending message...');
    
};

exports.authenticate = (req, res) => {
    console.log('Authenticating with FB...');
    
};

exports.getGroups = (req, res) => {
    console.log('Getting groups...');

};

exports.getUsers = (req, res) => {
    console.log('Getting users...');
    
};
