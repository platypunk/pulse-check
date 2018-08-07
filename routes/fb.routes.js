module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.post('/fb/groups', fb.getGroups);

    app.post('/fb/users', fb.getUsers);

    app.post('/fb/send', fb.sendMessage);

    app.post('/fb/receive', fb.receiveMessage);
    
    app.get('/fb/receive', fb.verifyMessage);
}