const request = require('request');
const util = require('util');
const fbConfig = require('../config/fb.config.js');
const questionCtrl = require('../controllers/question.controller.js');
const answerCtrl = require('../controllers/answer.controller.js');

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
    try {
        if (body.object === 'page') {
            body.entry.forEach(function(entry) {
                if (entry.messaging) {
                    let message = entry.messaging[0];
                    console.log(message);
                    if (message.postback) {
                        let questionId = message.postback.payload;
                        let answer = message.postback.title;
                        let memberId = message.sender.id;
                        console.log(util.format("Received answer %s for question %s from member %s", answer, questionId, memberId));
                        answerCtrl.findAnswerByUser(questionId, memberId, function(answer) {
                            if (answer) {
                                exports.sendMessage(memberId, "Sorry you already provided an answer for this question");
                            } else {
                                answerCtrl.save(questionId, memberId, answer);
                                questionCtrl.findById(questionId, function(question) {
                                    if (question && question.comment) {
                                        exports.sendMessage(memberId, "Your answer has been recorded, if you have any comment on the topic please let me know");
                                    } else {
                                        exports.sendMessage(memberId, "Your answer has been recorded, thank you");
                                    }
                                });
                                
                            }
                        });
                    }
                    // comment
                    // hello
                    // info / help
                    // view questions
                }
            });
        }
    } catch (err) {
        console.log(err || "Technical error");
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
    console.log('Requesting members...');

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

exports.getMember = (req, res) => {
    let url = util.format(fbConfig.url + fbConfig.getMember, req.params.memberId, fbConfig.appPageToken);
    console.log("GET request to " + url);

    request.get(
        url,
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                console.log(err ? err.message : 'Technical error.');
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
    console.log('Sending question now...');

    questionCtrl.findById(req.params.questionId, function(question) {
        exports.getMembers(question.groupId, function(members) {
            if (members) {
                console.log("Sending to members now\n" + JSON.stringify(members));
                members.forEach(function(member) {
                    exports.sendQuestion(member.id, 
                        question,
                        function(res) {
                            if (res) {
                                console.log("Send response\n" + JSON.stringify(res));
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
    console.log('Sending question...');

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
    console.log('Sending message...');

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
        console.log("Send response\n" + res);
    });
};

function sendMsg(jsonReq, callback) {
    let url = fbConfig.url + util.format(fbConfig.sendMessage, fbConfig.appPageToken);
    console.log("POST request to " + url);

    request.post(
        url,
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
}

