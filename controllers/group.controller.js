const Group = require('../models/group.model.js');

exports.create = (req, res) => {
    console.log('Saving group...');
    
    if(!req.body.group || !req.body.type || !req.body.admin1)  {
        res.send({
            message: 'Group, type and admin are required'
        });
    } else {
        var members = [];
        var i = 1;
        console.log(req.body['member'+i]);
        while (req.body['member'+i]) {
            members.push(req.body['member'+i]);
            i++;
        }

        var admins = [];
        var i = 1;
        console.log(req.body['admin'+i]);
        while (req.body['admin'+i]) {
            members.push(req.body['admin'+i]);
            i++;
        }

        const group = new Group({
            group: req.body.group,
            type: req.body.type,
            members: members,
            admins: admins
        });
        
        group.save()
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
    console.log('Getting groups...');

	Group.find()
    .then(groups => {
        res.send(groups);
    }).catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving data.'
        });
    });
};

exports.findOne = (req, res) => {
    console.log('Getting group...');

	Group.findById(req.params.groupId)
    .then(group => {
        if(!group) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });            
        }
        res.send(group);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });                
        }
        return res.status(500).send({
            message: 'Error retrieving data with id ' + req.params.groupId
        });
    });
};

exports.update = (req, res) => {
    console.log('Updating group...');

    if(!req.body.group || !req.body.type || !req.body.admin1)  {
        res.send({
            message: 'Group, type and admin are required'
        });
    } else {
        var members = [];
        var i = 1;
        console.log(req.body['member'+i]);
        while (req.body['member'+i]) {
            members.push(req.body['member'+i]);
            i++;
        }

        var admins = [];
        var i = 1;
        console.log(req.body['admin'+i]);
        while (req.body['admin'+i]) {
            members.push(req.body['admin'+i]);
            i++;
        }

        Group.findByIdAndUpdate(req.params.groupId, {
            group: req.body.group,
            type: req.body.type,
            members: members,
            admins: admins
        }, {new: true})
        .then(group => {
            if(!group) {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.groupId
                });
            }
            res.send(group);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: 'Data not found with id ' + req.params.groupId
                });                
            }
            return res.status(500).send({
                message: 'Error updating data with id ' + req.params.groupId
            });
        });
    }
};

exports.delete = (req, res) => {
	Group.findByIdAndUpdate(req.params.groupId, {
            deleted: true
    }, {new: true})
    .then(group => {
        if(!group) {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });
        }
        res.send({message: 'Data deleted successfully!'});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: 'Data not found with id ' + req.params.groupId
            });                
        }
        return res.status(500).send({
            message: 'Could not delete data with id ' + req.params.groupId
        });
    });
};