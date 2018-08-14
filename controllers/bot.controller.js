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
  console.log(`Bot received message: ${text}`);
  messageCtrl.save(payload.sender.id, text);
});

bot.on('postback', (payload, chat) => {
  console.log(`Bot received postback: ${payload.postback.payload}`);
  messageCtrl.save(payload.sender.id, `questionId: ${payload.postback.title}, 
    answer: ${payload.postback.payload}`);

  let questionId = payload.postback.payload;
  let answer = payload.postback.title;
  let memberId = payload.sender.id;
  console.log(`Received answer ${answer} for question ${questionId} from member ${memberId}`);
  
  answerCtrl.findAnswerByUser(questionId, memberId, function(answerByUser) {
    if (answerByUser) {
      console.log(`Bot chatting: ${fbConfig.answerAlreadyExist}`);
      const askUpdateAnswer = (convo) => {
        convo.ask(fbConfig.answerAlreadyExist, (payload, convo) => {
          if (payload.message && payload.message.text.toLowerCase() === 'yes') {
            console.log('AFTER ' + convo.get('answerId'));
            console.log('AFTER ' + convo.get('answerText'));
            answerCtrl.updateAnswer(convo.get('answerId'), convo.get('answerText'));
            chat.say(fbConfig.answerUpdated);
          } else {
            chat.say(fbConfig.noUpdate);
            convo.end();
          }
        });
      };
      chat.conversation((convo) => {
        convo.set('answerId', answerByUser._id);
        convo.set('answerText', answer);
        console.log('BEFORE ' + convo.get('answerId'));
        console.log('BEFORE ' + convo.get('answerText'));
        askUpdateAnswer(convo);
      });
    } else {
      answerCtrl.save(questionId, memberId, answer, function(savedAnswer) {
        // comment
        questionCtrl.findById(questionId, function(question) {
            if (question && question.comment) {
              const askHaveComment = (convo) => {
                convo.ask(fbConfig.answerReceivedComment, (payload, convo) => {
                  if (payload.message && payload.message.text.toLowerCase() === 'yes') {
                    askComment(convo);
                  } else {
                    chat.say(fbConfig.noUpdate);
                    convo.end();
                  }
                });
              };
              const askComment = (convo) => {
                convo.ask(fbConfig.askComment, (payload, convo) => {
                  if (payload.message) {
                    const text = payload.message.text;
                    console.log('AFTER ' + convo.get('answerId'));
                    answerCtrl.saveComment(answerId, text);
                    chat.say(fbConfig.commentReceived);
                    convo.end();
                  } else {
                    convo.end();
                  }
                });
              };
              chat.conversation((convo) => {
                convo.set('answerId', savedAnswer._id);
                console.log('BEFORE ' + convo.get('answerId'));
                askHaveComment(convo);
              });
            } else {
              console.log(`Bot chatting: ${fbConfig.answerReceived}`);
              chat.say(fbConfig.answerReceived);
            }
        });
      });      
    }
  });
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
  console.log(`Bot chatting: ${fbConfig.hello}`);
  chat.say(fbConfig.hello);
});

bot.hear([/(good)?bye/i, /see (ya|you)/i, 'adios'], (payload, chat) => {
  // Matches: goodbye, bye, see ya, see you, adios
  console.log(`Bot chatting: ${fbConfig.bye}`);
  chat.say(fbConfig.bye);
});

bot.hear(['thanks', 'thank you'], (payload, chat) => {
  console.log(`Bot chatting: ${fbConfig.welcome}`);
  chat.say(fbConfig.welcome);
});

bot.hear(['help'], (payload, chat) => {
  console.log('Hello I am Pulsy, your digital sentiment stones.');
  chat.say('Hello I am Pulsy, your digital sentiment stones.', {typing: true});
  // chat.say('I will ask you pulse questions as they are scheduled.', {typing: true});
  // chat.say('You can update your answers by clicking on an old question.', {typing: true});
  // chat.say('If you want to ask a sentiment question, please access https://pulsecheck.tk')
});

exports.receiveMessage = (req, res) => {
    console.log('Receiving message...');

    let body = req.body;
    try {
        if (body.object === 'page') {
            body.entry.forEach(function(entry) {
                if (entry.messaging) {
                    let message = entry.messaging[0];
                    console.log(message)
                    bot.handleFacebookData(body);
                }
            });
        }
    } catch (err) {
        console.log(err || "Technical error");
    }

    res.status(200).send('EVENT_RECEIVED');
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