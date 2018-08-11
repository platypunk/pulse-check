const fbConfig = require('../config/fb.config.js');
const request = require('request');
const util = require('util');

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

exports.receiveMessage = (req, res) => {
    console.log('Receiving message...');

    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            if (entry.messaging) {
                let webhook_event = entry.messaging[0];
                console.log(webhook_event);
            }
        });
    }
    res.status(200).send('EVENT_RECEIVED');
};

exports.sendMessage = (req, res) => {
    console.log('Sending message...');

    if(!req.body.userId) {
        res.status(400).send({
            success: false,
            message: 'UserId, question and options are required'
        });
    } else {
        jsonReq = 
        {
          "recipient":{
            "id": req.body.userId
        },
        "message":{
            "text": "How are you?",
            "quick_replies":[
            {
                "content_type":"text",
                "title":"Good",
                "payload":"GOOD"
            },
            {
                "content_type":"text",
                "title":"Bad",
                "payload":"BAD"
            }]
            }
        };
        request.post(
            'https://' + fbConfig.host + fbConfig.sendMessageURL,
            { json: { jsonReq } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(err.message || 'Technical error.');
                    res.status(500).send({
                        success: false,
                        message: 'Technical error.'
                    });
                }
                else {
                    console.log(JSON.stringify(body));
                }
            }
        );
        res.status(200).send({
            success: true
        });
    }
};

exports.authenticate = (req, res) => {
    console.log('Authenticating with FB...');
    
};

exports.getGroups = (req, res) => {
    console.log('Getting groups...');

    var groups = [];
    getFbGroups(groups, 
        fbConfig.url + util.format(fbConfig.getGroups, fbConfig.appPageToken), 
        res);
};

function getFbGroups(groups, url, res) {
    request.get(
        url,
        function (error, response, body) {
            if (error || response.statusCode != 200) {
                console.log(error.message || 'Technical error.');
                res.status(500).send({
                    success: false,
                    message: 'Technical error.'
                });
            }
            else {
                var json = JSON.parse(body);
                if (json.data) {
                    json.data.forEach(function(data) {
                        // includes secret groups
                        if (!data.archived && !data.is_workplace_default) {
                            let group = {
                                id: data.id,
                                name: data.name
                            };
                            groups.push(group);
                        }
                    });
                }
            }
            if (json.paging && json.paging.next) {
                getFbGroups(groups, json.paging.next, res);
            } else {
                res.status(200).send(groups);
            }
        }
    );
}

exports.getUsers = (req, res) => {
    console.log('Getting users...');
    
};
