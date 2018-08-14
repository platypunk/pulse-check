const Log = require('log');
const log = new Log('info');

const request = require('request');
const util = require('util');
const fbConfig = require('../config/fb.config.js');
const questionCtrl = require('../controllers/question.controller.js');


exports.getGroups = (req, res) => {
    log.info('Getting groups...');

    var groups = [];
    getFbGroups(groups, 
        fbConfig.url + util.format(fbConfig.getGroups, fbConfig.appPageToken), 
        res);
};

function getFbGroups(groups, url, res) {
    log.info(`GET request to ${url}`);
    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                log.info(err ? err.message : 'Technical error.');
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

exports.reqMembers = (req, res) => {
    log.info('Requesting members...');

    var members = [];
    getFbMembers(members, 
        fbConfig.url + util.format(fbConfig.getMembers, 
            req.params.groupId, 
            fbConfig.appPageToken),
        function(members) {
            res.status(200).send(members);
        });
};

exports.getMembers = (groupId, callback) => {
    log.info(`Getting members for group ${groupId}...`);

    var members = [];
    getFbMembers(members, 
        fbConfig.url + util.format(fbConfig.getMembers, 
            groupId, 
            fbConfig.appPageToken),
        callback);
};

function getFbMembers(members, url, callback) {
    log.info(`GET request to ${url}`);
    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                log.info(err ? err.message : 'Technical error.');
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

exports.getMember = (req, res) => {
    let url = util.format(fbConfig.url + fbConfig.getMember, req.params.memberId, fbConfig.appPageToken);
    log.info(`GET request to ${url}`);

    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                log.info(err ? err.message : 'Technical error.');
                res.status(500).send({
                    success: false,
                    message: 'Technical error.'
                });
            }
            res.status(200).send(JSON.parse(body));
        }
    );
};

exports.sendQuestionNow = (req, res) => {
    log.info('Sending question now...');

    questionCtrl.findById(req.params.questionId, function(question) {
        exports.getMembers(question.groupId, function(members) {
            if (members) {
                log.info("Sending to members now\n" + JSON.stringify(members));
                members.forEach(function(member) {
                    exports.sendQuestion(member.id, 
                        question,
                        function(res) {
                            if (res) {
                                log.info("Send response\n" + JSON.stringify(res));
                                questionCtrl.updateNotified(question._id);
                            }
                        });
                });
            }
        });
    });
    res.status(200).send({
        success: true
    });
};

exports.sendQuestion = (memberId, question, callback) => {
    log.info(`Sending question ${question._id} to ${memberId}...`);

    let buttons = [];
    question.options.forEach(function(option) {
        jsonOpt = {
            type: 'postback',
            title: option,
            payload: question._id
        };
        buttons.push(jsonOpt);
    });
    jsonReq = 
    {
        recipient: {
            id: memberId
        },
        message: {
            attachment: {  
                type: 'template',
                payload: {  
                    template_type: 'generic',
                    elements: [{  
                        title: question.question,
                        buttons: buttons
                    }
                    ]
                }
            }
        }
    };

    sendMsg(jsonReq, callback);
};

exports.sendMessage = (memberId, message) => {
    log.info(`Sending message ${message} to ${memberId}...`);

    jsonReq = 
    {
        recipient: {
            id: memberId
        },
        message: {
            text: message
        }
    };

    sendMsg(jsonReq, function(res) {
        log.info(`Send response\n ${res}`);
    });
};

function sendMsg(jsonReq, callback) {
    let url = fbConfig.url + util.format(fbConfig.sendMessage, fbConfig.appPageToken);
    log.info(`POST request to ${url}`);

    request.post(
        url,
        {json: jsonReq},
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                log.info(err? err.message : 'Technical error.');
                return callback([]);
            }
            else {
                return callback(body);
            }
        }
    );
}


exports.authenticate = (req, res) => {
    log.info('Authenticating fb user...');

    if(!req.body.code) {
        res.status(400).send({
            success: false,
            message: 'Code is required'
        });
    } else {
        request.get(
            util.format(fbConfig.auth, fbConfig.appPageToken, 
                fbConfig.authRedirect, fbConfig.appSecret, req.body.code),
            function (err, response, body) {
                if (err || response.statusCode != 200) {
                    log.info(err ? err.message : 'Technical error.');
                    res.status(500).send({
                        success: false,
                        message: 'Technical error.'
                    });
                } else {
                    res.status(200).send(JSON.parse(body));
                }
            }
        );
    }
};

