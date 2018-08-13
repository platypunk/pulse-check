const EventEmitter = require('events');
const questionCtrl = require('./controllers/question.controller.js');
const fb = require('./controllers/fb.controller.js');


class Poller extends EventEmitter {
    constructor(timeout = 100) {
        super();
        this.timeout = timeout;
    }

    poll() {
        setTimeout(() => this.emit('poll'), this.timeout);
        console.log('Polling');

        questionCtrl.getScheduled(function(questions) {
            if (questions) {
                console.log("Poll questions\n" + questions);
                questions.forEach(function(question) {
                    fb.getMembers(question.groupId, function(members) {
                        if (members) {
                            console.log("Poll members\n" + JSON.stringify(members));
                            members.forEach(function(member) {
                                fb.sendQuestion(member.id, 
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
            }
        });
    }

    onPoll(cb) {
        this.on('poll', cb);
    }
}

module.exports = Poller;