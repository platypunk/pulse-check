module.exports = (app) => {
    const groups = require('../controllers/group.controller.js');

    app.post('/groups', groups.create);

    app.get('/groups', groups.findAll);

    app.get('/groups/:groupId', groups.findOne);

    app.put('/groups/:groupId', groups.update);

    app.delete('/groups/:groupId', groups.delete);
}