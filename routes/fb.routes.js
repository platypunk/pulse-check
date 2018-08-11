module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.get('/fb/groups', fb.getGroups);

    app.get('/fb/members/:groupId', fb.getMembers);

    app.post('/fb/send', fb.sendMessage);
}