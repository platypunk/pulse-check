const Question = require('../models/question.model.js');

exports.create = (req, res) => {
    console.log('Creating...');

    if(!req.body.question || !req.body.option1 || !req.body.option2 || 
        !req.body.schedule) {
        res.send({
            message: 'Question, options and schedule are required'
        });
    } else {
        const question = new Question();
        question.question = req.body.question;
        var i = 1;
        console.log(req.body['option'+i]);
        while (req.body['option'+i]) {
            question.options.push(req.body['option'+i]);
            i++;
        }
        question.comment = req.body.comment;
        question.schedule = new Date(req.body.schedule + ':00');
        
        question.save()
        .then(data => {
            console.log('x');
            res.send({success: true});
        }).catch(err => {
            console.log('y');
            res.send({
                message: err.message || 'Some error occurred while creating data.'
            });
        });
    }

};

exports.findAll = (req, res) => {
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
	if(!req.body.content) {
        return res.status(400).send({
            message: 'Data content can not be empty'
        });
    }

    Question.findByIdAndUpdate(req.params.questionId, {
        title: req.body.title
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
};

exports.delete = (req, res) => {
	Question.findByIdAndRemove(req.params.questionId)
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