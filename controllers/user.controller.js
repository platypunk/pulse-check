const User = require('../models/user.model.js');

exports.create = (req, res) => {
    console.log('Saving user...');
    
    if(!req.body.userName) {
        res.send({
            message: 'Username is required'
        });
    } else {
        const user = new User({
            userName: req.body.userName,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            isAdmin: req.body.isAdmin
        });
        
        user.save()
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
    console.log('Getting users...');

    User.find()
    .then(users => {
        res.render('index', {
          users: users
      });
    }).catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving data.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting user...');

    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.userId
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating user...');

    if(!req.body.userName) {
        res.send({
            message: 'Username is required'
        });
    } else {
        User.findByIdAndUpdate(req.params.userId, {
            userName: req.body.userName,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            isAdmin: req.body.isAdmin
        }, {new: true})
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.userId
                });
            }
            res.send(user);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.userId
                });                
            }
            return res.status(500).send({
                message: 'Error updating data with id ' + req.params.userId
            });
        });
    }
};

exports.delete = (req, res) => {
    User.findByIdAndUpdate(req.params.userId, {
            deleted: true
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });
        }
        res.send({message: 'Data deleted successfully!'});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        return res.status(500).send({
            message: 'Could not delete data with id ' + req.params.userId
        });
    });
};

exports.findUser = (req, res) => {
    console.log('Getting user by group and/or user...');

    User.find({
        userName: req.query.userName
    })
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.userId
        });
    });
};