const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config.js');
const User = require('../models/user.model.js');

exports.create = (req, res) => {
    console.log('Saving user...');
    
    if(!req.body.userName || !req.body.password) {
        res.status(400).send({
            success: false,
            message: 'Username and password is required'
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
    console.log('Getting users...');

    User.find({}, {
        _id: 1,
        userName: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1
    })
    .then(users => {
        res.status(200).send(users);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting user...');

    User.findById(req.params.userId,{
        _id: 1,
        userName: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1
    })
    .then(user => {
        if(!user) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating user...');

    if(!req.params.userId) {
        res.status(400).send({
            success: false,
            message: 'UserId is required'
        });
    } else {
        User.findById(req.params.userId)
        .then(user => {
            if(!user) {
                res.status(404).send({
                    message: 'Data not found with id ' + req.params.userId
                });            
            }
            if (req.body.password) user.password = req.body.password;
            if (req.body.firstName) user.firstName = req.body.firstName;
            if (req.body.lastName) user.lastName = req.body.lastName;
            if (req.body.isAdmin) user.isAdmin = req.body.isAdmin;
            user.save(function(err) {
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
                    message: 'Data not found with id ' + req.params.userId
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
    User.findByIdAndUpdate(req.params.userId, {
        deleted: true
    })
    .then(user => {
        if(!user) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });
        }
        res.status(200).send({
            success: true
        });    
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findUser = (req, res) => {
    console.log('Getting user...');

    User.findOne({
        userName: req.query.userName
    }, {
        _id: 1,
        userName: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1
    })
    .then(user => {
        if(!user) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.userId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.authenticate = (req, res) => {
    console.log('Authenticating user...');

    if(!req.body.userName || !req.body.password) {
        console.log('Username and password is required.');
        res.status(404).send({ 
            success: false, 
            message: 'Authentication failed.' 
        });
    } else {
        User.findOne({
            userName: req.body.userName
        })
        .then(user => {
            if(!user) {
                console.log('Username or password is incorrect.');
                res.status(400).send({ 
                    success: false, 
                    message: 'Authentication failed.' 
                });
            } else if (user.password != req.body.password) {
                console.log('Username or password is incorrect.');
                res.status(400).send({ 
                    success: false, 
                    message: 'Authentication failed.' 
                });
            } else {
                // remove password
                const payload = {
                    _id: user._id,
                    userName: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    deleted: user.deleted
                }
                var token = jwt.sign(payload, req.app.get('superSecret'), {
                    expiresIn: jwtConfig.expiry
                });
                res.status(200).send({
                    success: true,
                    token: token
                });
            }
        }).catch(err => {
            console.log(err.message || 'Technical error.');
            res.status(500).send({
                success: false,
                message: 'Technical error.'
            });
        });
    }
};