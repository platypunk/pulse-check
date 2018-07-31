const Question = require('../models/question.model.js');

exports.create = (req, res) => {
    console.log('Saving question...');
    
    // TODO add userId, groupId, location
    if(!req.body.question || !req.body.option1 || !req.body.option2 || 
        !req.body.schedule) {
        res.send({
            message: 'Question, options and schedule are required'
        });
    } else {
        var options = [];
        var i = 1;
        console.log(req.body['option'+i]);
        while (req.body['option'+i]) {
            options.push(req.body['option'+i]);
            i++;
        }

        const question = new Question({
            userId: req.body.userId,
            groupId: req.body.groupId,
            question: req.body.question,
            options: options,
            comment: req.body.comment,
            schedule: new Date(req.body.schedule + ':00'),
            location: req.body.location
        });
        
        question.save()
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
    console.log('Getting questions...');

	Question.find()
    .then(questions => {
        res.render('index', {
          questions: questions
      });
    }).catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving data.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting question...');

	Question.findById(req.params.questionId)
    .then(question => {
        if(!question) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });            
        }
        res.send(question);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.questionId
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating question...');

    // TODO add groupId, location
    if(!req.body.question || !req.body.option1 || !req.body.option2 || 
        !req.body.schedule) {
        res.send({
            message: 'Question, options and schedule are required'
        });
    } else {
        var options = [];
        var i = 1;
        console.log(req.body['option'+i]);
        while (req.body['option'+i]) {
            options.push(req.body['option'+i]);
            i++;
        }

        Question.findByIdAndUpdate(req.params.questionId, {
            groupId: req.body.groupId,
            question: req.body.question,
            options: options,
            comment: req.body.comment,
            schedule: new Date(req.body.schedule + ':00'),
            location: req.body.location
        }, {new: true})
        .then(question => {
            if(!question) {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.questionId
                });
            }
            res.send(question);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.questionId
                });                
            }
            return res.status(500).send({
                message: 'Error updating data with id ' + req.params.questionId
            });
        });
    }
};

exports.delete = (req, res) => {
	Question.findByIdAndUpdate(req.params.questionId, {
            deleted: true
    }, {new: true})
    .then(question => {
        if(!question) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });
        }
        res.send({message: 'Data deleted successfully!'});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.questionId
            });                
        }
        return res.status(500).send({
            message: 'Could not delete data with id ' + req.params.questionId
        });
    });
};