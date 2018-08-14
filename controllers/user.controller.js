const Log = require('log');
const log = new Log('info');

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config.js');
const User = require('../models/user.model.js');

exports.create = (req, res) => {
    log.info('Saving user...');
    
    if(!req.body.username || !req.body.password) {
        res.status(400).send({
            success: false,
            message: 'Username and password is required'
        });
    } else {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            isAdmin: req.body.isAdmin,
            memberId: req.body.memberId
        });
        
        user.save()
        .then(data => {
            res.status(200).send({
                success: true
            });
        }).catch(err => {
            log.info(err.message || 'Technical error.');
            res.status(500).send({
                success: false,
                message: 'Technical error.'
            });
        });
    }

};

exports.findAll = (req, res) => {
    log.info('Getting users...');

    User.find({}, {
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1,
        memberId: 1
    })
    .then(users => {
        res.status(200).send(users);
    }).catch(err => {
        log.info(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findOne = (req, res) => {
    log.info('Getting user...');

    User.findById(req.params.userId,{
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1,
        memberId: 1
    })
    .then(user => {
        if(!user) {
            res.status(404).send({
                message: `Data not found with id ${req.params.userId}`
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: `Data not found with id ${req.params.userId}`
            });                
        }
        log.info(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.update = (req, res) => {
    log.info('Updating user...');

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
                    message: `Data not found with id ${req.params.userId}`
                });            
            }
            if (req.body.password) user.password = req.body.password;
            if (req.body.firstName) user.firstName = req.body.firstName;
            if (req.body.lastName) user.lastName = req.body.lastName;
            if (req.body.isAdmin) user.isAdmin = req.body.isAdmin;
            if (req.body.memberId) user.memberId = req.body.memberId;
            user.save(function(err) {
                if(!err) {
                    res.status(200).send({
                        success: true
                    });
                } else {
                    log.info(err.message || 'Technical error.');
                    res.status(500).send({
                        message: 'Technical error.'
                    });
                }
            });
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                res.status(404).send({
                    message: `Data not found with id ${req.params.userId}`
                });                
            }
            log.info(err.message || 'Technical error.');
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
                message: `Data not found with id ${req.params.userId}`
            });
        }
        res.status(200).send({
            success: true
        });    
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            res.status(404).send({
                message: `Data not found with id ${req.params.userId}`
            });                
        }
        log.info(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findUser = (req, res) => {
    log.info('Getting user...');

    User.findOne({
        username: req.query.username
    }, {
        _id: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        isAdmin: 1,
        deleted: 1,
        memberId: 1
    })
    .then(user => {
        if(!user) {
            res.status(404).send({
                message: `Data not found with id ${req.params.userId}`
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: `Data not found with id ${req.params.userId}`
            });                
        }
        log.info(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.authenticate = (req, res) => {
    log.info('Authenticating user...');

    if(!req.body.username || !req.body.password) {
        log.info('Username and password is required.');
        res.status(404).send({ 
            success: false, 
            message: 'Authentication failed.' 
        });
    } else {
        User.findOne({
            username: req.body.username,
            deleted: {$ne: true}
        })
        .then(user => {
            if(!user) {
                log.info('Username or password is incorrect.');
                res.status(400).send({ 
                    success: false, 
                    message: 'Authentication failed.' 
                });
            } else if (user.password != req.body.password) {
                log.info('Username or password is incorrect.');
                res.status(400).send({ 
                    success: false, 
                    message: 'Authentication failed.' 
                });
            } else {
                // remove password
                const payload = {
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    deleted: user.deleted,
                    memberId: user.memberId
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
            log.info(err.message || 'Technical error.');
            res.status(500).send({
                success: false,
                message: 'Technical error.'
            });
        });
    }
};