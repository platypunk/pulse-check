const request = require('request');
const util = require('util');
const fbConfig = require('../config/fb.config.js');

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
                // TODO find thread
                // save answer
                // hello
                // info / help
                // view questions

            }
        });
    }
    res.status(200).send('EVENT_RECEIVED');
};

exports.getGroups = (req, res) => {
    console.log('Getting groups...');

    var groups = [];
    getFbGroups(groups, 
        fbConfig.url + util.format(fbConfig.getGroups, fbConfig.appPageToken), 
        res);
};

function getFbGroups(groups, url, res) {
    console.log("GET request to " + url);
    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                console.log(err ? err.message : 'Technical error.');
                return res.status(500).send({
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
                return res.status(200).send(groups);
            }
        }
    );
}

exports.reqMembers = (req, res) => {
    console.log('Requesting members...');

    var members = [];
    getFbMembers(members, 
        fbConfig.url + util.format(fbConfig.getMembers, 
            req.params.groupId, 
            fbConfig.appPageToken),
        function(members) {
            return res.status(200).send(members);
        });
};

exports.getMembers = (groupId, callback) => {
    console.log('Getting members...');

    var members = [];
    getFbMembers(members, 
        fbConfig.url + util.format(fbConfig.getMembers, 
            groupId, 
            fbConfig.appPageToken),
        callback);
};

function getFbMembers(members, url, callback) {
    console.log("GET request to " + url);
    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                console.log(err ? err.message : 'Technical error.');
                return callback([]);
            }
            else {
                var json = JSON.parse(body);
                if (json.data) {
                    json.data.forEach(function(data) {
                        let member = {
                            id: data.id,
                            name: data.name
                        };
                        members.push(member);
                    });
                }
            }
            if (json.paging && json.paging.next) {
                getFbMembers(members, json.paging.next, callback);
            } else {
                return callback(members);
            }
        }
    );
}

exports.sendMessage = (memberId, question, options, callback) => {
    console.log('Sending message...');

    let quickReplies = [];
    options.forEach(function(option) {
        jsonOpt = {
            content_type: 'text',
            title: option,
            payload: option
        };
        quickReplies.push(jsonOpt);
    });
    jsonReq = 
    {
        recipient: {
            id: memberId
        },
        message: {
            text: question,
            quick_replies: quickReplies
        }
    };

    request.post(
        fbConfig.url + util.format(fbConfig.sendMessage, fbConfig.appPageToken),
        {json: jsonReq},
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                console.log(err? err.message : 'Technical error.');
                return callback([]);
            }
            else {
                return callback(body);
            }
        }
    );
};

