const Question = require('../models/question.model.js');

exports.create = (req, res) => {
    console.log('Saving question...');
    
    if(!req.body.question || !req.body.options || req.body.options.length < 2 ||
        !req.body.schedule || !req.body.userId || !req.body.groupId) {
        res.status(400).send({
            success: false,
            message: 'Question, options, schedule, userId and groupId are required'
        });
    } else {
        const question = new Question({
            userId: req.body.userId,
            groupId: req.body.groupId,
            question: req.body.question,
            options: req.body.options,
            comment: req.body.comment,
            schedule: new Date(req.body.schedule),
            location: req.body.location
        });
        
        question.save()
        .then(data => {
            res.status(200).send({
                success: true
            });
        }).catch(err => {
            console.log(err.message || 'Technical error.');
            res.status(500).send({
                success: false,
                message: 'Technical error.'
            });
        });
    }

};

exports.findAll = (req, res) => {
    console.log('Getting questions...');

	Question.find()
    .then(questions => {
        res.status(200).send(questions);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting question...');

	Question.findById(req.params.questionId)
    .then(question => {
        if(!question) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });            
        }
        res.send(question);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating question...');

    if(!req.params.questionId) {
        res.status(400).send({
            success: false,
            message: 'QuestionId is required'
        });
    } else {
        Question.findById(req.params.questionId)
        .then(question => {
            if(!question) {
                question.status(404).send({
                    message: 'Data not found with id ' + req.params.questionId
                });            
            }
            if (req.body.question) question.question = req.body.question;
            if (req.body.options) question.options = req.body.options;
            if (req.body.comment) question.comment = req.body.comment;
            if (req.body.schedule) question.schedule = req.body.schedule;
            if (req.body.location) question.location = req.body.location;
            if (req.body.schedule) question.schedule = new Date(req.body.schedule);
            question.save(function(err) {
                if(!err) {
                    res.status(200).send({
                        success: true
                    });
                } else {
                    console.log(err.message || 'Technical error.');
                    res.status(500).send({
                        message: 'Technical error.'
                    });
                }
            });
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                res.status(404).send({
                    message: 'Data not found with id ' + req.params.questionId
                });                
            }
            console.log(err.message || 'Technical error.');
            res.status(500).send({
                message: 'Technical error.'
            });
        });
    }
};

exports.delete = (req, res) => {
    console.log("Deleting question");
    
	Question.findByIdAndUpdate(req.params.questionId, {
            deleted: true
    })
    .then(question => {
        if(!question) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });
        }
        res.status(200).send({
            success: true
        });    
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findQuestion = (req, res) => {
    if(!req.query.userId) {
        res.status(400).send({
            success: false,
            message: 'UserId is required'
        });
    } else {
        if (req.query.userId) {
            console.log('Getting questions by user...');
            Question.find({
                userId: req.query.userId
            })
            .then(questions => {
                if(!questions) {
                    res.status(404).send({
                        message: 'Data not found with id ' + req.params.questionId
                    });            
                }
                res.send(questions);
            }).catch(err => {
                if(err.kind === 'ObjectId') {
                    res.status(404).send({
                        message: 'Data not found'
                    });               
                }
                console.log(err.message || 'Technical error.');
                res.status(500).send({
                    message: 'Technical error.'
                });
            });
        } 
    }
};

exports.getScheduled = (callback) => {
    console.log("Getting scheduled questions");

    Question.find({
        notified: {$ne: true},
        schedule: {$lte: Date.now()},
        deleted: {$ne: true}
    }).then(questions => {
        return callback(questions);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        return callback([]);
    });
}

exports.updateNotified = (questionId) => {
    console.log('Updating scheduled question...');

    Question.findByIdAndUpdate(questionId, {
        notified: true
    }).catch(err => {
        console.log(err.message || 'Technical error.');
    });
};

exports.findById = (questionId, callback) => {
    console.log('Getting question by id...');

    Question.findById(questionId)
    .then(question => {
        return callback(question);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        return callback(null);
    });
};
