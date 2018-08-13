module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.get('/fb/groups', fb.getGroups);

    app.get('/fb/members/:groupId', fb.reqMembers);

    app.post('/fb/send', fb.sendMessage);
}