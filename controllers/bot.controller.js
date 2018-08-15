const Log = require('log');
const log = new Log('info');

const BootBot = require('bootbot');
const fbConfig = require('../config/fb.config.js');
const questionCtrl = require('../controllers/question.controller.js');
const answerCtrl = require('../controllers/answer.controller.js');
const messageCtrl = require('../controllers/message.controller.js');


const bot = new BootBot({
    accessToken: fbConfig.appPageToken,
    verifyToken: fbConfig.verifyToken,
    appSecret: fbConfig.appSecret,
    webhook: '/fb/receive'
});


bot.on('message', (payload, chat) => {
    const text = payload.message.text;
    log.info(`Bot received message: ${text}`);
    messageCtrl.save(payload.sender.id, text);
});

bot.on('postback', (payload, chat) => {
    const questionId = payload.postback.payload;
    const answer = payload.postback.title;
    const memberId = payload.sender.id;
    log.info(`Bot received postback for ${questionId}`);
    messageCtrl.save(memberId, `questionId: ${questionId}, 
        answer: ${answer}`);

    log.info(`Received answer ${answer} for question ${questionId} from member ${memberId}`);
    
    answerCtrl.findAnswerByUser(questionId, memberId, function(answerByUser) {
        if (answerByUser) {
            log.info(`Bot chatting: ${fbConfig.answerAlreadyExist}`);
            const askUpdateAnswer = (convo) => {
                try {
                    convo.ask(fbConfig.answerAlreadyExist, (payload, convo) => {
                        if (payload.message && payload.message.text.toLowerCase() === 'yes') {
                            answerCtrl.updateAnswer(convo.get('answerId'), convo.get('answerText'));
                            chat.say(fbConfig.answerUpdated, {typing: true});
                            convo.end();
                        } else {
                            chat.say(fbConfig.noUpdate, {typing: true});
                            convo.end();
                        }
                    }); 
                } catch (err) {
                    log.info(err || 'Technical error');
                    convo.end();
                }
            };
            chat.conversation((convo) => {
                convo.set('answerId', answerByUser._id);
                convo.set('answerText', answer);
                askUpdateAnswer(convo);
            });
        } else {
            answerCtrl.save(questionId, memberId, answer, function(savedAnswer) {
                questionCtrl.findById(questionId, function(question) {
                    if (question && question.comment) {
                        const askHaveComment = (convo) => {
                            try {
                                convo.ask(fbConfig.answerReceivedComment, (payload, convo) => {
                                    if (payload.message && payload.message.text.toLowerCase() === 'yes') {
                                        askComment(convo);
                                    } else {
                                        chat.say(fbConfig.noUpdate, {typing: true});
                                        convo.end();
                                    }
                                });
                            } catch (err) {
                                log.info(err || 'Technical error');
                                convo.end();
                            }
                        };
                        const askComment = (convo) => {
                            try {
                                convo.ask(fbConfig.askComment, (payload, convo) => {
                                    if (payload.message) {
                                        const text = payload.message.text;
                                        answerCtrl.saveComment(convo.get('answerId'), text);
                                        chat.say(fbConfig.commentReceived, {typing: true});
                                        convo.end();
                                    } else {
                                        convo.end();
                                    }
                                });
                            } catch (err) {
                                log.info(err || 'Technical error');
                                convo.end();
                            }
                        };
                        chat.conversation((convo) => {
                            convo.set('answerId', savedAnswer._id);
                            askHaveComment(convo);
                        });
                    } else {
                        log.info(`Bot chatting: ${fbConfig.answerReceived}`);
                        chat.say(fbConfig.answerReceived, {typing: true});
                    }
                });
            });            
        }
    });
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
    log.info(`Bot chatting: ${fbConfig.hello}`);
    chat.say(fbConfig.hello, {typing: true});
});

bot.hear([/(good)?bye/i, /see (ya|you)/i, 'adios'], (payload, chat) => {
    // Matches: goodbye, bye, see ya, see you, adios
    log.info(`Bot chatting: ${fbConfig.bye}`);
    chat.say(fbConfig.bye, {typing: true});
});

bot.hear(['thanks', 'thank you'], (payload, chat) => {
    log.info(`Bot chatting: ${fbConfig.welcome}`);
    chat.say(fbConfig.welcome, {typing: true});
});

bot.hear(['help', 'info', 'test', 'how to'], (payload, chat) => {
    log.info('Bot chatting: help...');
    chat.say([fbConfig.help, fbConfig.help2, fbConfig.help3, fbConfig.help4], {typing: true});
});

exports.receiveMessage = (req, res) => {
    log.info('Receiving message...');

    let body = req.body;
    try {
        if (body.object === 'page') {
            body.entry.forEach(function(entry) {
                if (entry.messaging) {
                    let message = entry.messaging[0];
                    log.info(message)
                    bot.handleFacebookData(body);
                }
            });
        }
    } catch (err) {
        log.info(err || 'Technical error');
    }

    res.status(200).send('EVENT_RECEIVED');
};

exports.verifyMessage = (req, res) => {
    log.info('Verifying message...');
    let VERIFY_TOKEN = fbConfig.verifyToken;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            log.info('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);            
        }
    } else {
        res.sendStatus(400);
    }
};