const Group = require('../models/group.model.js');

exports.create = (req, res) => {
    console.log('Saving group...');
    
    if(!req.body.group || !req.body.type || !req.body.admins)  {
        res.status(400).send({
            success: false,
             message: 'Group, type and admins are required'
        });
    } else {
        const group = new Group({
            group: req.body.group,
            type: req.body.type,
            members: req.body.members,
            admins: req.body.admins
        });
        
        group.save()
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
    console.log('Getting groups...');

	Group.find()
    .then(groups => {
        res.status(200).send(groups);
    }).catch(err => {
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting group...');

	Group.findById(req.params.groupId)
    .then(group => {
        if(!group) {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });            
        }
        res.send(group);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating group...');

    if(!req.params.groupId)  {
        res.status(400).send({
            success: false,
            message: 'GroupId is required'
        });
    } else {
        Group.findById(req.params.groupId)
        .then(group => {
            if(!group) {
                group.status(404).send({
                    message: 'Data not found with id ' + req.params.groupId
                });            
            }
            if (req.body.group) group.group = req.body.group;
            if (req.body.type) group.type = req.body.type;
            if (req.body.members) group.members = req.body.members;
            if (req.body.admins) group.admins = req.body.admins;
            group.save(function(err) {
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
                    message: 'Data not found with id ' + req.params.groupId
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
	Group.findByIdAndUpdate(req.params.groupId, {
            deleted: true
    })
    .then(group => {
        if(!group) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });
        }
        res.status(200).send({
            success: true
        });    
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });                
        }
        console.log(err.message || 'Technical error.');
        res.status(500).send({
            message: 'Technical error.'
        });
    });
};