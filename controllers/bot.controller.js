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
  console.log("Bot received message " + text);

  messageCtrl.save(payload.sender.id, text);
});

bot.on('postback', (payload, chat) => {
  console.log("Bot received postback " + payload.postback.payload);

  let questionId = payload.postback.payload;
  let answer = payload.postback.title;
  let memberId = payload.sender.id;
  console.log(`Received answer ${answer} for question ${questionId} from member ${memberId}`);
  
  answerCtrl.findAnswerByUser(questionId, memberId, function(answer) {
      if (answer) {
        chat.say(fbConfig.answerAlreadyExist);
      } else {
        answerCtrl.save(questionId, memberId, answer);
        // comment
        questionCtrl.findById(questionId, function(question) {
            if (question && question.comment) {
              const askHaveComment = (convo) => {
                convo.ask(fbConfig.answerReceivedComment, (payload, convo) => {
                  const text = payload.message.text;
                  if (text.toLowerCase() === 'yes') {
                    askComment(convo);
                  } else {
                    convo.end();
                  }
                });
              };
              const askComment = (convo) => {
                convo.ask(fbConfig.askComment, (payload, convo) => {
                  const text = payload.message.text;
                  // save comment
                  convo.end();
                });
              };
              chat.conversation((convo) => {
                askHaveComment(convo);
              });
            } else {
              chat.say(fbConfig.answerReceived);
            }
        });
      }
  });
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
  chat.say('Hello!');
});

bot.hear([/(good)?bye/i, /see (ya|you)/i, 'adios'], (payload, chat) => {
  // Matches: goodbye, bye, see ya, see you, adios
  chat.say('Bye, human!');
});

bot.hear(['help'], (payload, chat) => {
  chat.say({
    text: 'Hello I am Pulsy, I am your digital sentiment stones.',
    buttons: [
      { type: 'postback', title: 'View Questions', payload: 'VIEW_QUESTIONS' },
      { type: 'postback', title: 'View Answers', payload: 'VIEW_ANSWERS' }
    ]
  });
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