const Answer = require('../models/answer.model.js');

exports.create = (req, res) => {
    console.log('Saving answer...');
    
    if(!req.body.questionId || !req.body.userId || !req.body.answer) {
        res.send({
            message: 'Answer is required'
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
            res.send({success: true});
        }).catch(err => {
            res.send({
                message: err.message || 'Some error occurred while creating data.'
            });
        });
    }

};

exports.findAll = (req, res) => {
    console.log('Getting answers...');

	Answer.find()
    .then(answers => {
        res.send(answers);
    }).catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving data.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting answer...');

	Answer.findById(req.params.answerId)
    .then(answer => {
        if(!answer) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });            
        }
        res.send(answer);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.answerId
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating answer...');

    if(!req.body.questionId || !req.body.userId || !req.body.answer) {
        res.send({
            message: 'Answer is required'
        });
    } else {
        Answer.findByIdAndUpdate(req.params.answerId, {
            answer: req.body.answer,
            comment: req.body.comment
        }, {new: true})
        .then(answer => {
            if(!answer) {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.answerId
                });
            }
            res.send(answer);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.answerId
                });                
            }
            return res.status(500).send({
                message: 'Error updating data with id ' + req.params.answerId
            });
        });
    }
};

exports.delete = (req, res) => {
	Answer.findByIdAndUpdate(req.params.answerId, {
            deleted: true
    }, {new: true})
    .then(answer => {
        if(!answer) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });
        }
        res.send({message: 'Data deleted successfully!'});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });                
        }
        return res.status(500).send({
            message: 'Could not delete data with id ' + req.params.answerId
        });
    });
};

exports.findAnswer = (req, res) => {
    console.log('Getting answer by group and/or user...');

    Answer.find({
        questionId: req.query.questionId,
        userId: req.query.userId
    })
    .then(answer => {
        if(!answer) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });            
        }
        res.send(answer);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.answerId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.answerId
        });
    });
};