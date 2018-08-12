const EventEmitter = require('events');
const question = require('./controllers/question.controller.js');
const fb = require('./controllers/fb.controller.js');


class Poller extends EventEmitter {
    constructor(timeout = 100) {
        super();
        this.timeout = timeout;
    }

    poll() {
        setTimeout(() => this.emit('poll'), this.timeout);
        console.log('Polling');

        question.getScheduled(function(schedQuestions) {
            if (schedQuestions) {
                console.log("Poll questions\n" + schedQuestions);
                schedQuestions.forEach(function(schedQuestion) {
                    fb.getMembers(schedQuestion.groupId, function(members) {
                        if (members) {
                            console.log("Poll members\n" + JSON.stringify(members));
                            members.forEach(function(member) {
                                fb.sendMessage(member.id, 
                                    schedQuestion.question,
                                    schedQuestion.options,
                                    function(thread) {
                                        if (thread) {
                                            console.log("Poll thread\n" + JSON.stringify(thread));
                                            question.updateScheduled(schedQuestion._id);
                                            // TODO save thread
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