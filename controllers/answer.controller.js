const Answer = require('../models/answer.model.js');
const questionCtrl = require('./question.controller.js');

exports.create = (req, res) => {
    console.log('Saving answer...');
    
    if(!req.body.questionId || !req.body.userId || !req.body.answer) {
        res.status(400).send({
            success: false,
            message: 'QuestionId, userId and answer are required'
        });
    } else {
        const answer = new Answer({
            questionId: req.body.questionId,
            userId: req.body.userId,
            answer: req.body.answer,
            comment: req.body.comment
        });
        
        answer.save()
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
    console.log('Getting answers...');

    Answer.find()
    .then(answers => {
        res.status(200).send(answers);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting answer...');

    Answer.findById(req.params.answerId)
    .then(answer => {
        if(!answer) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });            
        }
        res.send(answer);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.answerId
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating answer...');

    if(!req.params.answerId) {
        res.status(400).send({
            success: false,
            message: 'AnswerId is required'
        });
    } else {
        Answer.findById(req.params.answerId)
        .then(answer => {
            if(!answer) {
                answer.status(404).send({
                    message: 'Data not found with id ' + req.params.answerId
                });            
            }
            if (req.body.answer) answer.answer = req.body.answer;
            if (req.body.comment) answer.comment = req.body.comment;
            answer.save(function(err) {
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
                    message: 'Data not found with id ' + req.params.answerId
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
	Answer.findByIdAndUpdate(req.params.answerId, {
        deleted: true
    })
    .then(answer => {
        if(!answer) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });
        }
        res.status(200).send({
            success: true
        });    
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findAnswer = (req, res) => {
    if(!req.query.questionId && !req.query.userId) {
        res.status(400).send({
            success: false,
            message: 'QuestionId or userId is required'
        });
    } else {
        if (req.query.userId) {
            console.log('Getting answers by user...');
            Answer.find({
                userId: req.query.userId
            })
            .then(answers => {
                if(!answers) {
                    res.status(404).send({
                        message: 'Data not found with id ' + req.params.questionId
                    });            
                }
                res.send(answers);
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
        } else if (req.query.questionId) {
            if (req.query.count === 'true') {
                console.log('Getting answers count by question...');
                const aggregatorOpts = [{
                        $match: {
                            questionId: req.query.questionId
                        }
                    },{
                        $group: {
                            _id: "$answer",
                            count: { $sum: 1 }
                        }
                    }
                ]
                Answer.aggregate(aggregatorOpts).exec()
                .then(answers => {
                    if(!answers) {
                        res.status(404).send({
                            message: 'Data not found with id ' + req.params.questionId
                        });            
                    }
                    res.send(answers);
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
            } else if (req.query.time === 'true') {
                questionCtrl.findById(req.query.questionId, function(question) {
                    if (question) {
                        Answer.find({
                            questionId: req.query.questionId,
                            deleted: {$ne: true}
                        })
                        .then(answers => {
                            if(!answers) {
                                res.status(404).send({
                                    message: 'Data not found with id ' + req.params.questionId
                                });            
                            }
                            let times = [];
                            let sum = 0, count = 0;
                            answers.forEach(function(answer) {
                                let diff = answer.updatedAt - question.schedule;
                                time = {
                                    userId: answer.userId,
                                    time: diff
                                };
                                times.push(time);
                                sum += diff;
                                count++;
                            });
                            res.send({
                                times: times,
                                ave: sum/count
                            });
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
                    } else {
                        res.status(404).send({
                            message: 'Data not found with id ' + req.params.questionId
                        });
                    }
                });
            } else {
                console.log('Getting answers by question...');
                Answer.find({
                    questionId: req.query.questionId
                })
                .then(answers => {
                    if(!answers) {
                        res.status(404).send({
                            message: 'Data not found with id ' + req.params.questionId
                        });            
                    }
                    res.send(answers);
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
    }
};

exports.findAnswerByUser = (questionId, userId, callback) => {
    console.log('Finding answer by user...');

    Answer.find({
        questionId: questionId,
        userId: userId
    })
    .then(answer => {
        return callback(answer);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
    });
};

exports.save = (questionId, userId, answer, callback) => {
    console.log('Saving answer...');
    
    const ans = new Answer({
        questionId: questionId,
        userId: userId,
        answer: answer
    });
    
    ans.save()
    .then(data => {
        return callback(data);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
    });
};

exports.saveComment = (answerId, comment) => {
    console.log(`Updating comment for ${answerId}`);

    Answer.findById(answerId)
    .then(answer => {
        if(answer) {    
            answer.comment = comment;
            answer.save(function(err) {
                if(err) {
                    console.log(err.message || 'Technical error.');
                }
            });
        }
    }).catch(err => {
        console.log(err.message || 'Technical error.');
    });
};